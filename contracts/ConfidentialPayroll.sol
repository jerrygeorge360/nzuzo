// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IConfidentialERC20.sol";
import "./IPayrollNFT.sol";

contract ConfidentialPayroll is ZamaEthereumConfig, ReentrancyGuard {
    address public employer;
    IConfidentialERC20 public token;
    IPayrollNFT public nft;

    mapping(address => euint64) private salaries;
    mapping(address => bool) public isEmployee;
    address[] public employees;

    euint64 private cachedTreasuryBalance;

    uint256 public payrollCooldown; // in seconds, default 0
    uint256 public lastPayrollRun;
    uint256 public constant MAX_EMPLOYEES = 100;

    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PayrollRun(uint256 timestamp, uint256 employeeCount);
    event SalaryUpdated(address indexed employee, uint256 timestamp);
    event BonusPaid(address indexed employee, uint256 timestamp, string memo);
    event CooldownUpdated(uint256 cooldownInSeconds);

    modifier onlyEmployer() {
        require(msg.sender == employer, "Not employer");
        _;
    }

    constructor(address tokenAddress, address _employer, address _nftContract) {
        employer = _employer;
        token = IConfidentialERC20(tokenAddress);
        nft = IPayrollNFT(_nftContract);
    }

    function addEmployee(
        address employee,
        externalEuint64 encryptedSalary,
        bytes calldata inputProof
    ) external onlyEmployer {
        require(!isEmployee[employee], "Already registered");
        require(employees.length < MAX_EMPLOYEES, "Employee cap reached");

        euint64 salary = FHE.fromExternal(encryptedSalary, inputProof);
        FHE.allowThis(salary);
        FHE.allow(salary, employer);
        FHE.allow(salary, employee);

        salaries[employee] = salary;
        isEmployee[employee] = true;
        employees.push(employee);
        emit EmployeeAdded(employee);
    }

    function removeEmployee(address employee) external onlyEmployer {
        require(isEmployee[employee], "Not registered");
        isEmployee[employee] = false;
        salaries[employee] = euint64.wrap(0);

        uint256 len = employees.length;
        for (uint256 i = 0; i < len; i++) {
            if (employees[i] == employee) {
                employees[i] = employees[len - 1];
                employees.pop();
                break;
            }
        }
        emit EmployeeRemoved(employee);
    }

    function updateSalary(
        address employee,
        externalEuint64 encryptedSalary,
        bytes calldata inputProof
    ) external onlyEmployer {
        require(isEmployee[employee], "Not registered");
        euint64 salary = FHE.fromExternal(encryptedSalary, inputProof);
        FHE.allowThis(salary);
        FHE.allow(salary, employer);
        FHE.allow(salary, employee);
        salaries[employee] = salary;
        emit SalaryUpdated(employee, block.timestamp);
    }

    function payBonus(
        address employee,
        externalEuint64 encryptedBonus,
        bytes calldata inputProof,
        string calldata memo
    ) external onlyEmployer {
        require(isEmployee[employee], "Not registered");
        euint64 bonus = FHE.fromExternal(encryptedBonus, inputProof);
        FHE.allowThis(bonus);
        FHE.allow(bonus, employer);
        FHE.allow(bonus, employee);
        FHE.allowTransient(bonus, address(token));

        token.transfer(employee, bonus);
        nft.mintBonus(employee, block.timestamp, memo);
        emit BonusPaid(employee, block.timestamp, memo);
    }

    function setPayrollCooldown(
        uint256 cooldownInSeconds
    ) external onlyEmployer {
        payrollCooldown = cooldownInSeconds;
        emit CooldownUpdated(cooldownInSeconds);
    }

    function runPayroll() external onlyEmployer nonReentrant {
        require(
            payrollCooldown == 0 ||
                block.timestamp >= lastPayrollRun + payrollCooldown,
            "Payroll cooldown active"
        );
        lastPayrollRun = block.timestamp;

        uint256 count = employees.length;
        for (uint256 i = 0; i < count; i++) {
            address emp = employees[i];
            FHE.allowTransient(salaries[emp], address(token));
            token.transfer(emp, salaries[emp]);
            nft.mintPayslip(emp, block.timestamp, payrollCooldown);
        }
        emit PayrollRun(block.timestamp, count);
    }

    function grantSalaryAccess(address thirdParty) external {
        require(isEmployee[msg.sender], "Not an employee");
        FHE.allow(salaries[msg.sender], thirdParty);
    }

    function getSalaryHandle(address employee) external view returns (euint64) {
        return salaries[employee];
    }

    function getEmployees() external view returns (address[] memory) {
        return employees;
    }

    function employeeCount() external view returns (uint256) {
        return employees.length;
    }

    /// @notice Caches the treasury balance handle and marks it publicly decryptable
    function syncTreasuryAllowance() external onlyEmployer {
        euint64 raw = token.balanceOf(address(this));
        euint64 owned = FHE.add(raw, FHE.asEuint64(0));
        FHE.allowThis(owned);
        FHE.makePubliclyDecryptable(owned);
        cachedTreasuryBalance = owned;
    }

    function getTreasuryHandle() external view onlyEmployer returns (euint64) {
        return cachedTreasuryBalance;
    }
}

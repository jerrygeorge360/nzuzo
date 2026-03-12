// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "./IConfidentialERC20.sol";

contract ConfidentialPayroll is ZamaEthereumConfig {
    address public employer;
    IConfidentialERC20 public token;

    mapping(address => euint64) private salaries;
    mapping(address => bool) public isEmployee;
    address[] public employees;

    euint64 private cachedTreasuryBalance;

    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PayrollRun(uint256 timestamp, uint256 employeeCount);

    modifier onlyEmployer() {
        require(msg.sender == employer, "Not employer");
        _;
    }

    constructor(address tokenAddress) {
        employer = msg.sender;
        token = IConfidentialERC20(tokenAddress);
    }

    function addEmployee(
        address employee,
        externalEuint64 encryptedSalary,
        bytes calldata inputProof
    ) external onlyEmployer {
        require(!isEmployee[employee], "Already registered");
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

    function runPayroll() external onlyEmployer {
        uint256 count = employees.length;
        for (uint256 i = 0; i < count; i++) {
            address emp = employees[i];
            FHE.allowTransient(salaries[emp], address(token));
            token.transfer(emp, salaries[emp]);
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

// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "./IConfidentialERC20.sol";
import {
    Ownable2Step,
    Ownable
} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title   MockUSDC.
 * @notice  A v0.9 compatible mock confidential ERC20 for testing.
 */
contract MockUSDC is ZamaEthereumConfig, IConfidentialERC20, Ownable2Step {
    uint64 internal _totalSupply;
    string internal _name;
    string internal _symbol;

    mapping(address => euint64) internal _balances;
    mapping(address => mapping(address => euint64)) internal _allowances;

    constructor() Ownable(msg.sender) {
        _name = "Mock USDC";
        _symbol = "mUSDC";
    }

    function name() external view returns (string memory) {
        return _name;
    }
    function symbol() external view returns (string memory) {
        return _symbol;
    }
    function decimals() external pure returns (uint8) {
        return 6;
    }
    function totalSupply() external view returns (uint64) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    function allowance(
        address owner,
        address spender
    ) external view returns (euint64) {
        return _allowances[owner][spender];
    }

    function approve(
        address spender,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        return approve(spender, FHE.fromExternal(encryptedAmount, inputProof));
    }

    function approve(address spender, euint64 amount) public returns (bool) {
        _allowances[msg.sender][spender] = amount;
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
        FHE.allow(amount, spender);
        emit Approval(msg.sender, spender, type(uint256).max);
        return true;
    }

    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        return transfer(to, FHE.fromExternal(encryptedAmount, inputProof));
    }

    function transfer(address to, euint64 amount) public returns (bool) {
        ebool canTransfer = FHE.le(amount, _balances[msg.sender]);
        _transfer(msg.sender, to, amount, canTransfer);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        euint64 amount
    ) public returns (bool) {
        euint64 currentAllowance = _allowances[from][msg.sender];
        ebool isAllowed = FHE.le(amount, currentAllowance);
        ebool canTransfer = FHE.le(amount, _balances[from]);
        ebool isTransferable = FHE.and(isAllowed, canTransfer);

        _transfer(from, to, amount, isTransferable);

        // Update allowance (simplified)
        _allowances[from][msg.sender] = FHE.select(
            isTransferable,
            FHE.sub(currentAllowance, amount),
            currentAllowance
        );
        return true;
    }

    function transferFrom(
        address from,
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        return
            transferFrom(
                from,
                to,
                FHE.fromExternal(encryptedAmount, inputProof)
            );
    }

    function mint(address to, uint64 amount) external onlyOwner {
        _unsafeMint(to, amount);
        _totalSupply += amount;
    }

    function _transfer(
        address from,
        address to,
        euint64 amount,
        ebool isTransferable
    ) internal {
        euint64 transferValue = FHE.select(
            isTransferable,
            amount,
            FHE.asEuint64(0)
        );

        _balances[from] = FHE.sub(_balances[from], transferValue);
        FHE.allowThis(_balances[from]);
        FHE.allow(_balances[from], from);

        _balances[to] = FHE.add(_balances[to], transferValue);
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);

        emit Transfer(from, to, type(uint256).max);
    }

    function _unsafeMint(address account, uint64 amount) internal {
        euint64 newBalance;
        if (!FHE.isInitialized(_balances[account])) {
            newBalance = FHE.asEuint64(amount);
        } else {
            newBalance = FHE.add(_balances[account], amount);
        }
        _balances[account] = newBalance;
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, account);
        emit Transfer(address(0), account, type(uint256).max);
    }
}

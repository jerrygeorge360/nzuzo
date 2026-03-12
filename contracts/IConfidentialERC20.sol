// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";

/**
 * @title   IConfidentialERC20.
 * @notice  Interface that defines ERC20-like tokens with encrypted balances (v0.9 compatible).
 */
interface IConfidentialERC20 {
    event Approval(address indexed owner, address indexed spender, uint256 placeholder);
    event Transfer(address indexed from, address indexed to, uint256 transferId);

    function approve(
        address spender,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool isSuccess);

    function approve(address spender, euint64 amount) external returns (bool isSuccess);

    function transfer(address to, externalEuint64 encryptedAmount, bytes calldata inputProof) external returns (bool isSuccess);

    function transfer(address to, euint64 amount) external returns (bool isSuccess);

    function transferFrom(address from, address to, euint64 amount) external returns (bool isSuccess);

    function transferFrom(
        address from,
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool isSuccess);

    function allowance(address owner, address spender) external view returns (euint64 allowance);

    function balanceOf(address account) external view returns (euint64 balance);

    function decimals() external view returns (uint8 decimals);

    function name() external view returns (string memory name);

    function symbol() external view returns (string memory symbol);

    function totalSupply() external view returns (uint64 totalSupply);
}

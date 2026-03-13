// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPayrollNFT {
    function mintPayslip(
        address employee,
        uint256 payrollDate,
        uint256 payPeriod
    ) external returns (uint256);
    function mintBonus(
        address employee,
        uint256 payrollDate,
        string calldata memo
    ) external returns (uint256);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ConfidentialPayroll.sol";
import "./PayrollNFT.sol";

contract PayrollFactory {
    address public immutable tokenAddress;
    address public immutable feeCollector;
    uint256 public deploymentFee;

    mapping(address => address[]) public employerContracts;
    address[] public allContracts;

    event PayrollCreated(
        address indexed employer,
        address indexed payrollContract,
        address indexed nftContract
    );

    constructor(address _tokenAddress, address _feeCollector) {
        tokenAddress = _tokenAddress;
        feeCollector = _feeCollector;
        deploymentFee = 0.01 ether;
    }

    function createPayroll() external payable returns (address, address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");

        // Use call to transfer ETH to feeCollector
        (bool success, ) = payable(feeCollector).call{value: msg.value}("");
        require(success, "Fee transfer failed");

        // Deploy NFT contract first
        PayrollNFT nft = new PayrollNFT(msg.sender);

        // Deploy payroll contract with NFT address
        ConfidentialPayroll payroll = new ConfidentialPayroll(
            tokenAddress,
            msg.sender,
            address(nft)
        );

        // Authorize payroll contract to mint NFTs
        nft.setMinter(address(payroll));

        employerContracts[msg.sender].push(address(payroll));
        allContracts.push(address(payroll));

        emit PayrollCreated(msg.sender, address(payroll), address(nft));
        return (address(payroll), address(nft));
    }

    function getEmployerContracts(
        address employer
    ) external view returns (address[] memory) {
        return employerContracts[employer];
    }

    function getAllContracts() external view returns (address[] memory) {
        return allContracts;
    }

    function setDeploymentFee(uint256 newFee) external {
        require(msg.sender == feeCollector, "Not authorized");
        deploymentFee = newFee;
    }
}

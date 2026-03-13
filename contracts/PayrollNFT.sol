// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PayrollNFT is ERC721 {
    using Strings for uint256;
    using Strings for address;

    string public constant NAME = "NZP Payslip";
    string public constant SYMBOL = "NZPSLIP";

    address public minter;
    address public employer;
    uint256 private _tokenIdCounter;

    enum PayslipType {
        Salary,
        Bonus
    }

    struct PayslipData {
        address employee;
        uint256 payrollDate;
        uint256 payPeriod;
        PayslipType payslipType;
        string memo;
    }

    mapping(uint256 => PayslipData) public payslips;

    modifier onlyMinter() {
        require(msg.sender == minter, "Not authorized");
        _;
    }

    constructor(address _employer) ERC721(NAME, SYMBOL) {
        employer = _employer;
    }

    function setMinter(address _minter) external {
        require(minter == address(0), "Minter already set");
        minter = _minter;
    }

    // Soulbound - block all transfers
    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert("Soulbound: non-transferable");
    }

    function mintPayslip(
        address employee,
        uint256 payrollDate,
        uint256 payPeriod
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _mint(employee, tokenId);
        payslips[tokenId] = PayslipData({
            employee: employee,
            payrollDate: payrollDate,
            payPeriod: payPeriod,
            payslipType: PayslipType.Salary,
            memo: ""
        });
        return tokenId;
    }

    function mintBonus(
        address employee,
        uint256 payrollDate,
        string calldata memo
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _mint(employee, tokenId);
        payslips[tokenId] = PayslipData({
            employee: employee,
            payrollDate: payrollDate,
            payPeriod: 0,
            payslipType: PayslipType.Bonus,
            memo: memo
        });
        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        NAME,
                        " #",
                        tokenId.toString(),
                        '", "description": "Confidential Payslip NFT powered by Nzuzo Pay", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateSVG(uint256 tokenId) public view returns (string memory) {
        PayslipData memory data = payslips[tokenId];

        string memory typeBadge = data.payslipType == PayslipType.Salary
            ? "SALARY"
            : "BONUS";
        string memory badgeColor = data.payslipType == PayslipType.Salary
            ? "#10b981"
            : "#f59e0b";

        string memory periodStr = getPeriodString(data.payPeriod);

        string memory memoSection = "";
        if (
            data.payslipType == PayslipType.Bonus && bytes(data.memo).length > 0
        ) {
            memoSection = string(
                abi.encodePacked(
                    '<text x="40" y="260" font-family="Arial" font-size="12" fill="#9ca3af">Memo</text>',
                    '<text x="40" y="280" font-family="Arial" font-size="14" font-weight="bold" fill="#f3f4f6">',
                    data.memo,
                    "</text>"
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    '<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">',
                    '<rect width="400" height="500" fill="#09090b" rx="20"/>',
                    '<rect x="1" y="1" width="398" height="498" fill="none" stroke="#27272a" stroke-width="1" rx="19"/>',
                    '<text x="40" y="60" font-family="Arial" font-size="20" font-weight="bold" fill="#10b981">NZP Payslip</text>',
                    '<rect x="290" y="42" width="85" height="24" fill="#3f3f46" rx="12"/>',
                    '<text x="302" y="58" font-family="Arial" font-size="10" font-weight="bold" fill="#f3f4f6">CONFIDENTIAL</text>',
                    '<text x="40" y="110" font-family="Arial" font-size="12" fill="#9ca3af">Employer</text>',
                    '<text x="40" y="130" font-family="Arial" font-size="14" font-weight="bold" fill="#f3f4f6">',
                    formatAddress(employer),
                    "</text>",
                    '<text x="40" y="160" font-family="Arial" font-size="12" fill="#9ca3af">Employee</text>',
                    '<text x="40" y="180" font-family="Arial" font-size="14" font-weight="bold" fill="#f3f4f6">',
                    formatAddress(data.employee),
                    "</text>",
                    '<text x="240" y="110" font-family="Arial" font-size="12" fill="#9ca3af">Date</text>',
                    '<text x="240" y="130" font-family="Arial" font-size="14" font-weight="bold" fill="#f3f4f6">',
                    uint256(data.payrollDate).toString(),
                    "</text>",
                    '<rect x="40" y="210" width="70" height="24" fill="',
                    badgeColor,
                    '" rx="12"/>',
                    '<text x="52" y="226" font-family="Arial" font-size="10" font-weight="bold" fill="#ffffff">',
                    typeBadge,
                    "</text>",
                    memoSection,
                    '<text x="40" y="320" font-family="Arial" font-size="12" fill="#9ca3af">Amount</text>',
                    '<text x="40" y="340" font-family="Arial" font-size="14" font-weight="bold" fill="#f3f4f6">\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 Private</text>',
                    '<text x="240" y="210" font-family="Arial" font-size="12" fill="#9ca3af">Pay Period</text>',
                    '<text x="240" y="230" font-family="Arial" font-size="14" font-weight="bold" fill="#f3f4f6">',
                    periodStr,
                    "</text>",
                    '<line x1="40" y1="440" x2="360" y2="440" stroke="#27272a" stroke-width="1"/>',
                    '<text x="40" y="470" font-family="Arial" font-size="10" fill="#71717a">Powered by Nzuzo Pay \u2022 Fully Homomorphic Encryption</text>',
                    '<text x="360" y="470" font-family="Arial" font-size="12" font-weight="bold" fill="#3f3f46" text-anchor="end">#',
                    tokenId.toString(),
                    "</text>",
                    "</svg>"
                )
            );
    }

    function formatAddress(address addr) internal pure returns (string memory) {
        string memory str = addr.toHexString();
        bytes memory b = bytes(str);
        bytes memory out = new bytes(13);
        out[0] = b[0];
        out[1] = b[1];
        out[2] = b[2];
        out[3] = b[3];
        out[4] = b[4];
        out[5] = b[5];
        out[6] = ".";
        out[7] = ".";
        out[8] = ".";
        out[9] = b[b.length - 4];
        out[10] = b[b.length - 3];
        out[11] = b[b.length - 2];
        out[12] = b[b.length - 1];
        return string(out);
    }

    function getPeriodString(
        uint256 period
    ) internal pure returns (string memory) {
        if (period == 604800) return "Weekly";
        if (period == 1209600) return "Biweekly";
        if (period == 2592000) return "Monthly";
        if (period == 0) return "Once-off";
        return "Custom";
    }

    function getPayslipsByEmployee(
        address employee
    ) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == employee) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == employee) {
                result[index] = i;
                index++;
            }
        }
        return result;
    }
}

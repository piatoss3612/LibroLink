// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC4883} from "./IERC4883.sol";
import {LibroBuddyUtils} from "../lib/LibroBuddyUtils.sol";

interface ILibroBuddyParts is IERC4883 {
    error LibroBuddyParts__TokenNotExists(uint256 tokenId);

    event LibroBuddyPartsInitialized(
        LibroBuddyUtils.LibroBuddyPart indexed part, uint256 x, uint256 y, uint256 width, uint256 height
    );
    event LibroBuddyPartsCreated(
        LibroBuddyUtils.LibroBuddyPart indexed part, uint256 indexed tokenId, string data, bool isSvg
    );

    event LibroBuddyPartsGatewaySet(string gateway);

    struct LibroBuddyInitParams {
        uint8 partId;
        uint256 x;
        uint256 y;
        uint256 width;
        uint256 height;
        string defaultUri;
        string gateway;
    }

    function part() external view returns (LibroBuddyUtils.LibroBuddyPart);
    function partName() external view returns (string memory);
    function x() external view returns (uint256);
    function y() external view returns (uint256);
    function width() external view returns (uint256);
    function height() external view returns (uint256);
    function gateway() external view returns (string memory);
    function create(string memory data, bool isSvg) external returns (uint256);
    function mint(address to, uint256 tokenId) external;
    function mintToBatch(address[] memory to, uint256 tokenId) external;
    function setGateway(string memory _gateway) external;
}

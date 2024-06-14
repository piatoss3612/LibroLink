// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ILibroBuddyParts} from "./interfaces/ILibroBuddyParts.sol";
import {LibroBuddyUtils} from "./lib/LibroBuddyUtils.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title LibroBuddyParts
 * @author piatoss3612
 * @notice ERC1155 contract for LibroBuddy parts
 */
contract LibroBuddyParts is ILibroBuddyParts, ERC1155, Ownable {
    using Strings for string;

    LibroBuddyUtils.LibroBuddyPart private _part;
    LibroBuddyUtils.LibroBuddyPartData private _partData;
    string private _gateway;

    uint256 public tokenId;
    mapping(uint256 => string) public tokenData;
    mapping(uint256 => bool) public tokenIsSvg;

    constructor(LibroBuddyInitParams memory params) ERC1155(params.defaultUri) Ownable(msg.sender) {
        _part = LibroBuddyUtils.LibroBuddyPart(params.partId);
        _partData = LibroBuddyUtils.LibroBuddyPartData(params.x, params.y, params.width, params.height);

        emit LibroBuddyPartsInitialized(_part, params.x, params.y, params.width, params.height);

        _setGateway(params.gateway);
    }

    function part() public view override returns (LibroBuddyUtils.LibroBuddyPart) {
        return _part;
    }

    function partName() public view override returns (string memory) {
        return LibroBuddyUtils.partName(_part);
    }

    function x() public view override returns (uint256) {
        return _partData.x;
    }

    function y() public view override returns (uint256) {
        return _partData.y;
    }

    function width() public view override returns (uint256) {
        return _partData.width;
    }

    function height() public view override returns (uint256) {
        return _partData.height;
    }

    function gateway() public view override returns (string memory) {
        return _gateway;
    }

    function create(string memory data, bool isSvg) external onlyOwner returns (uint256 _tokenId) {
        _tokenId = tokenId++;
        tokenData[_tokenId] = data;
        tokenIsSvg[_tokenId] = isSvg;

        emit LibroBuddyPartsCreated(_part, _tokenId, data, isSvg);
    }

    function mint(address to, uint256 _tokenId) external onlyOwner {
        _mint(to, _tokenId, 1, "");
    }

    function mintToBatch(address[] memory to, uint256 _tokenId) external onlyOwner {
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], _tokenId, 1, "");
        }
    }

    function setGateway(string memory gw) external onlyOwner {
        _setGateway(gw);
    }

    function _setGateway(string memory gw) internal {
        _gateway = gw;
        emit LibroBuddyPartsGatewaySet(gw);
    }

    function uri(uint256 _tokenId) public view override returns (string memory _uri) {
        string memory name = string(
            abi.encodePacked("LibroBuddyParts-", LibroBuddyUtils.partName(_part), "#", Strings.toString(_tokenId))
        );
        string memory description = string(abi.encodePacked("LibroBuddyParts for ", LibroBuddyUtils.partName(_part)));
        string memory iamge = Base64.encode(bytes(_generateSVG(_tokenId)));

        _uri = string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name,
                            '","description":"',
                            description,
                            '","image":"',
                            "data:image/svg+xml;base64,",
                            iamge,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function _generateSVG(uint256 _tokenId) internal view returns (string memory svg) {
        string memory render = renderTokenById(_tokenId);

        if (tokenIsSvg[_tokenId]) {
            svg = render;
        } else {
            svg = string(
                abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">', render, "</svg>")
            );
        }
    }

    function renderTokenById(uint256 id) public view returns (string memory render) {
        if (tokenIsSvg[id]) {
            render = tokenData[id];
        } else {
            render = string(
                abi.encodePacked(
                    "<g class=",
                    LibroBuddyUtils.partClassName(_part),
                    ">",
                    '<image x="',
                    Strings.toString(_partData.x),
                    '" y="',
                    Strings.toString(_partData.y),
                    '" width="',
                    Strings.toString(_partData.width),
                    '" height="',
                    Strings.toString(_partData.height),
                    '" href="',
                    gateway(),
                    "/ipfs/",
                    tokenData[id],
                    '"/>',
                    "</g>"
                )
            );
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, IERC165) returns (bool) {
        return interfaceId == type(ILibroBuddyParts).interfaceId || super.supportsInterface(interfaceId);
    }
}

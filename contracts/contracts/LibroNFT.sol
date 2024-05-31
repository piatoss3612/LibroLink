// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title LibroNFT
 * @dev Basic ERC721 token.
 */
contract LibroNFT is ERC721 {
    uint256 private _tokenId;
    string private _tokenURI;

    constructor(string memory uri) ERC721("LibroNFT", "LIBRO") {
        _tokenURI = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        return _tokenURI;
    }

    /**
     * @dev Mints a new token to the sender.
     */
    function mint() external {
        uint256 tokenId = _tokenId++;
        _safeMint(msg.sender, tokenId);
    }
}

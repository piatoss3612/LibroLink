// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC6454} from "./interfaces/IERC6454.sol";

/**
 * @title LibroNFT
 * @dev Basic ERC721 token.
 */
contract LibroNFT is ERC721, IERC6454 {
    error LibroNFT__Soulbound();

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

    /**
     * @dev Burns the token.
     */
    function burn(uint256 tokenId) external {
        _requireOwned(tokenId);
        _burn(tokenId);
    }

    /**
     * @notice Used to check whether the given token is transferable or not.
     * @dev IERC-6454 implementation.
     * @param tokenId token id to check
     * @param from address from which the token is being transferred
     * @param to address to which the token is being transferred
     * @return Boolean value indicating whether the given token is transferable
     */
    function isTransferable(uint256 tokenId, address from, address to) public view returns (bool) {
        /*
            Only allow:
            - Minting tokens to Non-Zero address
            - Burning tokens by sending to Zero address
         */

        if (from == address(0x0) && to == address(0x0)) {
            return false;
        }

        if (from == address(0x0) || to == address(0x0)) {
            return true;
        }

        _requireOwned(tokenId);

        // Disallow transfer of tokens.
        return false;
    }

    /**
     * @dev Overriding ERC721 _update function to add transfer restrictions.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Only allow minting and burning of tokens.
        if (isTransferable(tokenId, from, to)) {
            return super._update(to, tokenId, auth);
        }

        // Revert by default.
        revert LibroNFT__Soulbound();
    }

    /**
     * @dev Overriding IERC-165 supportsInterface function to add ERC-6454 support.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC6454).interfaceId || super.supportsInterface(interfaceId);
    }
}

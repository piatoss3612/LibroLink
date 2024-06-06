// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract NftGated {
    error NftGated__SenderDoesNotOwnNft();

    IERC721 public immutable nft;

    constructor(address _nft) {
        nft = IERC721(_nft);
    }

    /**
     * @notice Checks if the sender owns an NFT.
     * @param account Address of the account to check for NFT ownership.
     */
    function _requireNftOwner(address account) internal view {
        if (nft.balanceOf(account) == 0) {
            revert NftGated__SenderDoesNotOwnNft();
        }
    }
}

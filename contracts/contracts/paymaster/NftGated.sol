// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract NftGated {
    error NftGated__SenderDoesNotOwnNft();

    IERC721 public immutable nft;

    /**
     * @notice Checks if the sender owns an NFT.
     * @param account Address of the account to check for NFT ownership.
     */
    function _requireNftOwner(address account) internal view {
        if (!isEligible(account)) {
            revert NftGated__SenderDoesNotOwnNft();
        }
    }

    function isEligible(address account) public view returns (bool) {
        return nft.balanceOf(account) > 0;
    }
}

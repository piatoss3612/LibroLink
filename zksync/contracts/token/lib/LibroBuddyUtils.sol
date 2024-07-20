// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library LibroBuddyUtils {
    error LibroBuddyUtils__InvalidPart();

    enum LibroBuddyPart {
        BUDDY,
        BACKGROUND,
        LEFT_ORNAMENT,
        RIGHT_ORNAMENT
    }

    struct LibroBuddyPartData {
        uint256 x;
        uint256 y;
        uint256 width;
        uint256 height;
    }

    struct LibroBuddyPartInitParams {
        uint8 partId;
        LibroBuddyPartData data;
        string defaultUri;
        string gateway;
    }

    function partName(LibroBuddyPart _part) internal pure returns (string memory name) {
        if (_part == LibroBuddyPart.BUDDY) {
            name = "Buddy";
        } else if (_part == LibroBuddyPart.BACKGROUND) {
            name = "Background";
        } else if (_part == LibroBuddyPart.LEFT_ORNAMENT) {
            name = "Left Ornament";
        } else if (_part == LibroBuddyPart.RIGHT_ORNAMENT) {
            name = "Right Ornament";
        } else {
            revert LibroBuddyUtils__InvalidPart();
        }
    }

    function partClassName(LibroBuddyPart _part) internal pure returns (string memory className) {
        if (_part == LibroBuddyPart.BUDDY) {
            className = "buddy";
        } else if (_part == LibroBuddyPart.BACKGROUND) {
            className = "background";
        } else if (_part == LibroBuddyPart.LEFT_ORNAMENT) {
            className = "left-ornament";
        } else if (_part == LibroBuddyPart.RIGHT_ORNAMENT) {
            className = "right-ornament";
        } else {
            revert LibroBuddyUtils__InvalidPart();
        }
    }
}

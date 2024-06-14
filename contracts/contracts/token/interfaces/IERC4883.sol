// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IERC4883 is IERC165 {
    function renderTokenById(uint256 id) external view returns (string memory);
}

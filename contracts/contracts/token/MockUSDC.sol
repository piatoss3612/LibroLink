// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("MOCK USDC", "USDC") {
        _mint(msg.sender, 100000000000 * 10 ** decimals());
    }

    function faucet() external {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    function faucet(address to) external {
        _mint(to, 10000000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}

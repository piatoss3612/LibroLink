// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPriceConverter} from "./interfaces/IPriceConverter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC20TokenManager is Ownable {
    error ERC20TokenManager__InvalidToken();
    error ERC20TokenManager__InvalidPriceConverter();

    mapping(address => IPriceConverter) private _tokenPriceConverters;

    event TokenPriceConverterSet(address indexed token, IPriceConverter priceConverter);

    constructor() Ownable(msg.sender) {}

    function setTokenPriceConverter(address token, IPriceConverter priceConverter) external onlyOwner {
        if (address(priceConverter) == address(0)) {
            revert ERC20TokenManager__InvalidToken();
        }

        if (address(priceConverter) == address(0)) {
            revert ERC20TokenManager__InvalidPriceConverter();
        }

        _tokenPriceConverters[token] = priceConverter;
        emit TokenPriceConverterSet(token, priceConverter);
    }

    function getTokenPriceConverter(address token) external view returns (IPriceConverter) {
        return _tokenPriceConverters[token];
    }

    function _requireTokenPriceConverter(address token) internal view returns (IPriceConverter converter) {
        converter = _tokenPriceConverters[token];
        if (address(converter) == address(0)) {
            revert ERC20TokenManager__InvalidToken();
        }
    }

    function getTokenPriceInEth(address token, uint256 amount) public view returns (uint256, uint8) {
        IPriceConverter converter = _requireTokenPriceConverter(token);
        return converter.assetToEth(amount);
    }

    function getEthPriceInToken(address token, uint256 ethAmount) public view returns (uint256, uint8) {
        IPriceConverter converter = _requireTokenPriceConverter(token);
        return converter.ethToAsset(ethAmount);
    }

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transferFrom(address(this), to, amount);
    }
}

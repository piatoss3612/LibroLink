// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPriceConverter} from "./interfaces/IPriceConverter.sol";
import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDCPriceConverter is IPriceConverter {
    error USDCPriceConverter__InvalidPrice();

    uint8 private constant ETH_DECIMALS = 18;

    ERC20 private _usdc;
    AggregatorV3Interface private _priceFeed; // ETH/USD price feed

    constructor(address usdc, address priceFeed_) {
        _usdc = ERC20(usdc);
        _priceFeed = AggregatorV3Interface(priceFeed_);
    }

    function asset() external view returns (address usdc, uint8 decimals) {
        return (address(_usdc), _usdc.decimals());
    }

    function priceFeed() external view returns (address) {
        return address(_priceFeed);
    }

    function latestAssetPrice() public view returns (uint256, uint8) {
        (, int256 price,,,) = _priceFeed.latestRoundData();
        if (price <= 0) {
            revert USDCPriceConverter__InvalidPrice();
        }

        return (uint256(price), _priceFeed.decimals());
    }

    function assetToEth(uint256 assetAmount) external view override returns (uint256 ethAmount) {
        (uint256 price, uint8 priceDecimals) = latestAssetPrice(); // Get the latest price, and the decimals

        // Calculate the eth amount without decimals
        ethAmount = (assetAmount * (10 ** priceDecimals)) / price;

        // Adjust decimals to match ETH's 18 decimals
        ethAmount = (ethAmount * (10 ** (ETH_DECIMALS - _usdc.decimals())));
    }

    function ethToAsset(uint256 ethAmount) external view override returns (uint256 assetAmount) {
        (uint256 price, uint8 priceDecimals) = latestAssetPrice(); // Get the latest price, and the decimals

        // Calculate the asset amount without decimals
        assetAmount = (ethAmount * price) / (10 ** priceDecimals);

        // Adjust decimals to match the asset's decimals
        assetAmount = (assetAmount * (10 ** _usdc.decimals())) / (10 ** ETH_DECIMALS);
    }
}

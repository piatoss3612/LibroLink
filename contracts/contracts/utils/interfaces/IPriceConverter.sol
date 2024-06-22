// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPriceConverter {
    function asset() external view returns (address, uint8);
    function priceFeed() external view returns (address);
    function latestAssetPrice() external view returns (uint256, uint8);
    function assetToEth(uint256 assetAmount) external view returns (uint256 ethAmount, uint8 decimals);
    function ethToAsset(uint256 ethAmount) external view returns (uint256 assetAmount, uint8 decimals);
}

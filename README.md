# 2. General Paymaster with custom features

## Overview

## Table of Contents

- [Requirements](#requirements)
- [General Paymaster](#general-paymaster)
- [Considerations when integrating the Paymaster contract to your project](#considerations-when-integrating-the-paymaster-contract-to-your-project)
- [NFT Gated Access](#nft-gated-access)
- [Daily Limit Control](#daily-limit-control)
- [Ban Filter](#ban-filter)
- [Deploy the Paymaster Contract](#deploy-the-paymaster-contract)
- [Frontend Integration](#frontend-integration)
- [Demo](#demo)
- [Conclusion](#conclusion)
- [Next Steps](#next-steps)
- [References](#references)

## Requirements

- [Node.js](https://nodejs.org/en/) (v20.10.0)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.22.21)
- [zksync-cli](https://docs.zksync.io/build/tooling/zksync-cli/getting-started.html) (v1.7.1)

> This guide is following section of [1. Social Login with Privy and zkSync Network](https://github.com/piatoss3612/LibroLink/tree/01.social-login). You don't need to follow the previous guide to complete this guide. However, it is recommended to read the setup and installation part of the previous guide.

## General Paymaster

### 1. Take a look at the General Paymaster contract

- [GeneralPaymaster.sol](https://github.com/matter-labs/zksync-contract-templates/blob/main/templates/hardhat/solidity/contracts/paymasters/GeneralPaymaster.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {
    IPaymaster,
    ExecutionResult,
    PAYMASTER_VALIDATION_SUCCESS_MAGIC
} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {
    TransactionHelper,
    Transaction
} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import {BOOTLOADER_FORMAL_ADDRESS} from "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @author Matter Labs
/// @notice This contract does not include any validations other than using the paymaster general flow.
contract GeneralPaymaster is IPaymaster, Ownable {
    modifier onlyBootloader() {
        require(msg.sender == BOOTLOADER_FORMAL_ADDRESS, "Only bootloader can call this method");
        // Continue execution if called from the bootloader.
        _;
    }

    constructor() Ownable(msg.sender) {}

    function validateAndPayForPaymasterTransaction(bytes32, bytes32, Transaction calldata _transaction)
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        // By default we consider the transaction as accepted.
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        require(_transaction.paymasterInput.length >= 4, "The standard paymaster input must be at least 4 bytes long");

        bytes4 paymasterInputSelector = bytes4(_transaction.paymasterInput[0:4]);
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            // Note, that while the minimal amount of ETH needed is tx.gasPrice * tx.gasLimit,
            // neither paymaster nor account are allowed to access this context variable.
            uint256 requiredETH = _transaction.gasLimit * _transaction.maxFeePerGas;

            // The bootloader never returns any data, so it can safely be ignored here.
            (bool success,) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: requiredETH}("");
            require(success, "Failed to transfer tx fee to the Bootloader. Paymaster balance might not be enough.");
        } else {
            revert("Unsupported paymaster flow in paymasterParams.");
        }
    }

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {}

    function withdraw(address payable _to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = _to.call{value: balance}("");
        require(success, "Failed to withdraw funds from paymaster.");
    }

    receive() external payable {}
}
```

### 2. General Paymaster Flow

TODO: Add the general paymaster flow

### 3. Create a new Paymaster contract

- Create a new Paymaster contract. We will name it `LibroPaymaster.sol`.
- Add the custom errors to the contract as shown below.

```solidity
// contracts/contracts/paymaster/LibroPaymaster.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    IPaymaster,
    ExecutionResult,
    PAYMASTER_VALIDATION_SUCCESS_MAGIC
} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {
    TransactionHelper,
    Transaction
} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import {BOOTLOADER_FORMAL_ADDRESS} from "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LibroPaymaster is IPaymaster, Ownable {
    // ====== Custom Errors ======
    error LibroPaymaster__OnlyBootloaderCanCallThisMethod();
    error LibroPaymaster__PaymasterInputShouldBeAtLeast4BytesLong();
    error LibroPaymaster__FailedToTransferTxFeeToBootloader();
    error LibroPaymaster__UnsupportedPaymasterFlowInPaymasterParams();
    error LibroPaymaster__FailedToWithdrawFundsFromPaymaster();

    // ====== Modifiers ======
    modifier onlyBootloader() {
        if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) {
            revert LibroPaymaster__OnlyBootloaderCanCallThisMethod();
        }
        // Continue execution if called from the bootloader.
        _;
    }

    // ====== Constructor ======
    constructor() Ownable(msg.sender) {}

    /**
     *
     * @notice Function used to validate and pay for the zkSync transaction. It can be called only by the bootloader.
     * @param _transaction Structure used to represent zkSync transaction.
     * @return magic  PAYMASTER_VALIDATION_SUCCESS_MAGIC on validation success.
     * @return context Empty bytes array, as it is not used in the current implementation.
     */
    function validateAndPayForPaymasterTransaction(bytes32, bytes32, Transaction calldata _transaction)
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        // By default we consider the transaction as accepted.
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        if (_transaction.paymasterInput.length < 4) {
            revert LibroPaymaster__PaymasterInputShouldBeAtLeast4BytesLong();
        }

        bytes4 paymasterInputSelector = bytes4(_transaction.paymasterInput[0:4]);
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            // Note, that while the minimal amount of ETH needed is tx.gasPrice * tx.gasLimit,
            // neither paymaster nor account are allowed to access this context variable.
            uint256 requiredETH = _transaction.gasLimit * _transaction.maxFeePerGas;

            // The bootloader never returns any data, so it can safely be ignored here.
            (bool success,) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: requiredETH}("");
            if (!success) {
                revert LibroPaymaster__FailedToTransferTxFeeToBootloader();
            }
        } else {
            revert LibroPaymaster__UnsupportedPaymasterFlowInPaymasterParams();
        }
    }

    /**
     *
     * @notice Function used to execute extra logic after the zkSync transaction is executed. It can be called only by the bootloader.
     * @param _context Empty bytes array, as it is not used in the current implementation.
     * @param _transaction Structure used to represent zkSync transaction.
     * @param _txResult Enum used to represent the result of the transaction execution.
     * @param _maxRefundedGas Maximum amount of gas that can be refunded to the paymaster.
     */
    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable override onlyBootloader {}

    function withdraw(address payable _to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = _to.call{value: balance}("");
        if (!success) {
            revert LibroPaymaster__FailedToWithdrawFundsFromPaymaster();
        }
    }

    receive() external payable {}
}
```

### 4. Compile the contract

- Before compiling the contract, make sure to add the `isSystem` flag to the `zksolc` settings in the `hardhat.config.ts` file.
- `isSystem` flag is required to enable the interactivity with the zkSync system contracts.

```typescript
// contracts/hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync";

const config: HardhatUserConfig = {
  defaultNetwork: "zkSyncSepoliaTestnet",
  networks: {
    ...,
  },
  zksolc: {
    version: "latest",
    settings: {
      // Make sure 'isSystem' is set to 'true' to compile the system contracts.
      isSystem: true,
    },
  },
  solidity: {
    version: "0.8.24",
  },
};

export default config;
```

- Compile the contract using the following command:

```bash
$ npx hardhat compile

...
Successfully compiled 1 Solidity file
Done in 9.19s.
```

## Considerations when integrating the Paymaster contract to your project

### 1. Problem with General Paymaster

- The General Paymaster contract does not include any validations other than using the paymaster general flow.
- It means that anyone can use the paymaster to get support for their transactions.
- It is not suitable for a production environment, as it can be misused by malicious users and your paymaster can run out of funds.
- To prevent this, you need to consider adding custom features to the paymaster contract.

### 2. Custom Features

- Let's think about what custom features there can be in the paymaster contract.
- Here are some of the custom features that can be added to the paymaster contract:
  - NFT Gated Access: Allow only users who own an NFT to use the paymaster.
  - Daily Counter/Gas Limit: Limit the number of transactions a user can perform in a day.
  - Allow/Ban List: Allow or ban specific users from using the paymaster.

> There is no answer to what custom features you should add to the paymaster contract. It depends on your project requirements and the use case of the paymaster contract.

### 3. Choose the custom features

- In this guide, we will add the following custom features to the paymaster contract:
  - NFT Gated Access: Allow only users who own an NFT to use the paymaster.
  - Daily Limit Control: Limit the number of transactions a user can perform in a day.
  - Ban Filter: Ban specific users from using the paymaster.

## NFT Gated Access

### 1. Create an NFTGated contract

- Create a new abstract contract named `NftGated.sol`.
- The contract will have a function to check if the sender owns an NFT.

```solidity
// contracts/contracts/paymaster/NftGated.sol

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
        if (!isNftOwner(account)) {
            revert NftGated__SenderDoesNotOwnNft();
        }
    }

    function isNftOwner(address account) public view returns (bool) {
        return nft.balanceOf(account) > 0;
    }
}
```

### 2. Add the NFTGated contract to the LibroPaymaster contract

- Import the `NftGated` contract to the `LibroPaymaster` contract.

```solidity
import {NftGated, IERC721} from "./NftGated.sol";
```

- Inherit the `NftGated` contract in the `LibroPaymaster` contract.

```solidity
contract LibroPaymaster is IPaymaster, NftGated, Ownable {
    error LibroPaymaster__ZeroAddress();
    ...
}
```

- Add the NFT contract address to the constructor of the `LibroPaymaster` contract.

```solidity
constructor(address _nft) Ownable(msg.sender) {
    nft = IERC721(_nft);
}
```

- Add the NFT owner check in the `validateAndPayForPaymasterTransaction` function.
- If the user does not own the NFT, the transaction will be reverted.

```solidity
function validateAndPayForPaymasterTransaction(bytes32, bytes32, Transaction calldata _transaction)
    external
    payable
    onlyBootloader
    returns (bytes4 magic, bytes memory context)
{
    // By default we consider the transaction as accepted.
    magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
    if (_transaction.paymasterInput.length < 4) {
        revert LibroPaymaster__PaymasterInputShouldBeAtLeast4BytesLong();
    }

    // Check if the user owns the NFT.
    address userAddress = address(uint160(_transaction.from));
    if (userAddress == address(0)) {
        revert LibroPaymaster__ZeroAddress();
    }

    _requireNftOwner(userAddress);

    bytes4 paymasterInputSelector = bytes4(_transaction.paymasterInput[0:4]);

    ...
}
```

### 3. Another Issue with the NFTGated contract

- The `NftGated` contract only checks if the user owns an NFT.
- If the NFT is transferred to another user, recipient can take advantage of the paymaster contract.
- This allows one user with multiple accounts to use the paymaster contract, which is not desirable.
- To prevent this, we need to add a restriction to the NFT.
- We will add the `Soulbound` feature to the NFT contract only allowing authorized users who have gone through the appropriate membership procedures.

> We will cover the membership procedure in the future guides. For now, the NFT can be minted by anyone for testing purposes.

### 4. Soulbound NFT Interface

- There are many ways to implement the `Soulbound` feature.
- In this guide, we will implement the `Soulbound` feature using the `IERC6454` interface.
- The `IERC6454` interface will have a minimal function to check if the token is transferable or not.

```solidity
// contracts/contracts/token/interfaces/IERC6454.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC6454 { /* is IERC165 */
    /**
     * @notice Used to check whether the given token is transferable or not.
     * @dev If this function returns `false`, the transfer of the token MUST revert execution.
     * @dev If the tokenId does not exist, this method MUST revert execution, unless the token is being checked for
     *  minting.
     * @dev The `from` parameter MAY be used to also validate the approval of the token for transfer, but anyone
     *  interacting with this function SHOULD NOT rely on it as it is not mandated by the proposal.
     * @param tokenId ID of the token being checked
     * @param from Address from which the token is being transferred
     * @param to Address to which the token is being transferred
     * @return Boolean value indicating whether the given token is transferable
     */
    function isTransferable(uint256 tokenId, address from, address to) external view returns (bool);
}
```

### 5. Add the Soulbound NFT feature to the LibroNFT contract

- Add the `IERC6454` interface to the `LibroNFT` contract.
- Implement the `isTransferable` function to check if the token is transferable or not.
- Only allow minting tokens to a non-zero address and burning tokens by sending to a zero address.
- Override the `_update` function to add transfer restrictions.
- Override the `supportsInterface` function to add ERC-6454 support.

```solidity
// contracts/contracts/token/LibroNFT.sol

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
```

## Daily Limit Control

- The Daily Limit Control feature will limit the number of transactions a user can perform in a day.
- We can use another approach to limit the gas usage per day, though counter is more intuitive and easier to implement.
- Gas usage limit will be handled in advanced guides.

### 1. Create a DailyLimit contract

- Create a new abstract contract named `DailyLimit.sol`.
- The contract will have a function to check and update the daily limit for a user.
- The limit will be reset every day at 6 am UTC.
- If the user reaches the daily limit, the user will not be able to perform any more operations until the next day.

```solidity
// contracts/contracts/paymaster/DailyLimit.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract DailyLimit {
    error DailyLimit__DailyLimitReached(address user);

    /**
     * @notice Structure used to track the daily limit for a user.
     */
    struct Tracker {
        uint128 counter;
        uint128 timestamp;
    }

    uint256 public dailyLimit;

    mapping(address => Tracker) public dailyLimitTracker;

    event DailyLimitSet(uint256 newLimit);

    /**
     * @notice Check the daily limit for a user.
     * @param _user The user address.
     * @return reset Whether the counter should be reset.
     * @return reached Whether the limit was reached.
     * @return counter The current counter value.
     */
    function checkDailyLimit(address _user) public view returns (bool reset, bool reached, uint128 counter) {
        uint256 current = block.timestamp;
        uint128 yesterday6am = uint128(((current - 1 days) / 1 days) * 1 days + 6 hours); // yesterday 6am UTC
        uint128 today6am = yesterday6am + 1 days; // today 6am UTC

        Tracker memory tracker = dailyLimitTracker[_user];

        if (
            (tracker.timestamp < today6am && current >= today6am)
                || (tracker.timestamp < yesterday6am && current < today6am)
        ) {
            // 1. If the last update was before today 6am and the current time is after today 6am,
            // 2. Or if the last update was before yesterday 6am and the current time is before today 6am, (in case the time is after midnight but before 6am)
            // the counter should be reset whether the limit was reached or not.
            reset = true;
        } else if (tracker.counter >= dailyLimit) {
            // If the counter reached the limit, the user should not be able to perform any more operations.
            reached = true;
        }

        // Return the current counter value.
        counter = tracker.counter;
    }

    /**
     * @notice Update the daily limit for a user.
     * @param _user The user address.
     */
    function _updateDailyLimit(address _user) internal {
        (bool reset, bool reached,) = checkDailyLimit(_user);

        // If the limit was reached, revert the transaction.
        if (reached) {
            revert DailyLimit__DailyLimitReached(_user);
        }

        Tracker storage tracker = dailyLimitTracker[_user];

        // If the counter should be reset, set it to 1 otherwise increment it.
        if (reset) {
            tracker.counter = 1;
        } else {
            tracker.counter++;
        }

        // Update the timestamp.
        tracker.timestamp = uint128(block.timestamp);
    }

    /**
     * @notice Set the daily limit.
     * @dev virtual function to allow overriding it in derived contracts.
     * @param _dailyLimit The new daily limit.
     */
    function setDailyLimit(uint256 _dailyLimit) external virtual {
        _setDailyLimit(_dailyLimit);
    }

    /**
     * @notice Set the daily limit.
     * @param _dailyLimit The new daily limit.
     */
    function _setDailyLimit(uint256 _dailyLimit) internal {
        dailyLimit = _dailyLimit;
        emit DailyLimitSet(_dailyLimit);
    }
}
```

### 2. Add the DailyLimit contract to the LibroPaymaster contract

- Import the `DailyLimit` contract to the `LibroPaymaster` contract.

```solidity
import {DailyLimit} from "./DailyLimit.sol";
```

- Inherit the `DailyLimit` contract in the `LibroPaymaster` contract.

```solidity
contract LibroPaymaster is IPaymaster, NftGated, DailyLimit, Ownable {
    ...
}
```

- Add the daily limit to the constructor of the `LibroPaymaster` contract.

```solidity
constructor(address _nft, uint256 _dailyLimit) Ownable(msg.sender) {
    nft = IERC721(_nft);
    _setDailyLimit(_dailyLimit);
}
```

- Add the daily limit check in the `validateAndPayForPaymasterTransaction` function.

```solidity
function validateAndPayForPaymasterTransaction(bytes32, bytes32, Transaction calldata _transaction)
    external
    payable
    onlyBootloader
    returns (bytes4 magic, bytes memory context)
{
    ...

    bytes4 paymasterInputSelector = bytes4(_transaction.paymasterInput[0:4]);
    if (paymasterInputSelector == IPaymasterFlow.general.selector) {
        // Check if the daily limit was reached.
        _updateDailyLimit(userAddress);

        ...
    } else {
        revert LibroPaymaster__UnsupportedPaymasterFlowInPaymasterParams();
    }
}
```

- Override the `setDailyLimit` function to add the `onlyOwner` modifier.
- Only the owner of the contract can set the daily limit.

```solidity
 /**
 * @dev Override the daily limit setter to add the onlyOwner modifier.
 */
function setDailyLimit(uint256 _dailyLimit) external override onlyOwner {
    _setDailyLimit(_dailyLimit);
}
```

## Ban Filter

### 1. Create a BanFilter contract

- Create a new abstract contract named `BanFilter.sol`.
- The contract will have a function to check if the user is banned.
- The contract will have a function to set the ban status of a user.
- If the user is banned, the user will not be able to perform any operations using the paymaster contract.

```solidity
// contracts/contracts/paymaster/BanFilter.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract BanFilter {
    error BanFilter__UserBanned(address user);

    mapping(address => bool) public bannedUsers;

    event BanStatusChanged(address indexed user, bool status);

    /**
     * @notice Check if the user is banned.
     * @param _user The user address.
     */
    function _requireNotBanned(address _user) internal view {
        if (bannedUsers[_user]) {
            revert BanFilter__UserBanned(_user);
        }
    }

    /**
     * @notice Check if the user is banned.
     * @param _user The user address.
     */
    function isBanned(address _user) external view returns (bool) {
        return bannedUsers[_user];
    }

    /**
     * @notice Set the ban status of a user.
     * @dev virtual function to allow overriding in derived contracts.
     * @param _user The user address.
     * @param _status The ban status.
     */
    function setBanStatus(address _user, bool _status) external virtual {
        _setBanStatus(_user, _status);
    }

    /**
     * @notice Set the ban status of a user.
     * @dev internal function to allow overriding in derived contracts.
     * @param _user The user address.
     * @param _status The ban status.
     */
    function _setBanStatus(address _user, bool _status) internal {
        bannedUsers[_user] = _status;
        emit BanStatusChanged(_user, _status);
    }
}
```

### 2. Add the BanFilter contract to the LibroPaymaster contract

- Import the `BanFilter` contract to the `LibroPaymaster` contract.

```solidity
import {BanFilter} from "./BanFilter.sol";
```

- Inherit the `BanFilter` contract in the `LibroPaymaster` contract.

```solidity
contract LibroPaymaster is IPaymaster, NftGated, DailyLimit, BanFilter, Ownable {
    ...
}
```

- Add the ban filter check in the `validateAndPayForPaymasterTransaction` function.

```solidity
function validateAndPayForPaymasterTransaction(bytes32, bytes32, Transaction calldata _transaction)
    external
    payable
    onlyBootloader
    returns (bytes4 magic, bytes memory context)
{
    ...

    _requireNftOwner(userAddress);

    // Check if the user is banned.
    _requireNotBanned(userAddress);

    ...
}
```

- Override the `setBanStatus` function to add the `onlyOwner` modifier.
- Only the owner of the contract can set the ban status of a user.

```solidity
/**
 * @dev Override the ban status setter to add the onlyOwner modifier.
 */
function setBanStatus(address _user, bool _status) external override onlyOwner {
    _setBanStatus(_user, _status);
}
```

## Deploy the Paymaster Contract

### 1. Create a Counter contract

- Before deploying the `LibroPaymaster` contract, create a new `Counter` contract.
- The `Counter` contract will be used to interact with the paymaster contract on the frontend.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;

    function increment() public {
        count += 1;
    }
}
```

### 2. Compile the contracts

> Make sure `isSystem` flag is set to `true` in the `zksolc` settings in the `hardhat.config.ts` file.

```bash
$ yarn hardhat compile
```

### 3. Deploy the LibroPaymaster contract and required contracts

- Create a new script to deploy the `LibroPaymaster` contract and required contracts.
- The script will deploy the `LibroNFT`, `LibroPaymaster`, and `Counter` contracts.
- After deploying the contracts, send some ETH to the paymaster contract for gas sponsorship.

```typescript
// contracts/deploy/deployLibroPaymaster.ts
import { ethers } from "ethers";
import { deployContract, getWallet } from "./utils";

export default async function () {
  const tokenURI =
    "https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmXeQG8Kd3KT6rWaDKD9Eg2MrmRR7GG2jijgFDpcWK1Dyk";
  const nft = await deployContract("LibroNFT", [tokenURI]);

  // Deploy LibroPaymaster
  const nftAddress = await nft.getAddress();
  const dailyLimit = 3;

  const paymaster = await deployContract("LibroPaymaster", [
    nftAddress,
    dailyLimit,
  ]);

  // Deploy Counter
  await deployContract("Counter", []);

  // Send some ETH to the paymaster
  const wallet = getWallet();
  const paymasterAddress = await paymaster.getAddress();
  const value = ethers.parseEther("0.2");

  await (
    await wallet.sendTransaction({
      to: paymasterAddress,
      value,
    })
  ).wait();

  console.log("Sent 0.2 ETH to paymaster");
}
```

- Run the script to deploy the contracts. The script will also verify the contracts on the zkSync block explorer.

```bash
$ yarn hardhat deploy-zksync --script deployLibroPaymaster.ts
yarn run v1.22.21

Starting deployment process of "LibroNFT"...
Estimated deployment cost: 0.000122854 ETH

"LibroNFT" was successfully deployed:
 - Contract address: 0x2DcA9FdA301B22Bcc3ca7FA7B30b506CAF9205B5
 - Contract source: contracts/token/LibroNFT.sol:LibroNFT
 - Encoded constructor arguments: 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006268747470733a2f2f677265656e2d6d61696e2d686f766572666c792d3933302e6d7970696e6174612e636c6f75642f697066732f516d58655147384b64334b5436725761444b44394567324d726d5252374747326a696a6746447063574b3144796b000000000000000000000000000000000000000000000000000000000000

Requesting contract verification...
Your verification ID is: 15396
Contract successfully verified on zkSync block explorer!

Starting deployment process of "LibroPaymaster"...
Estimated deployment cost: 0.0000084064 ETH

"LibroPaymaster" was successfully deployed:
 - Contract address: 0x8624cfA52d5F93c0174D8d318fD9E531592D176E
 - Contract source: contracts/paymaster/LibroPaymaster.sol:LibroPaymaster
 - Encoded constructor arguments: 0x0000000000000000000000002dca9fda301b22bcc3ca7fa7b30b506caf9205b50000000000000000000000000000000000000000000000000000000000000003

Requesting contract verification...
Your verification ID is: 15397
Contract successfully verified on zkSync block explorer!

Starting deployment process of "Counter"...
Estimated deployment cost: 0.0000068427 ETH

"Counter" was successfully deployed:
 - Contract address: 0x42d625D2A7142F55952d8B63a5FCa907656c2887
 - Contract source: contracts/Counter.sol:Counter
 - Encoded constructor arguments: 0x

Requesting contract verification...
Your verification ID is: 15400
Contract successfully verified on zkSync block explorer!
Sent 0.2 ETH to paymaster
Done in 49.15s.
```

## Frontend Integration

### 1. Create Files for the Address and ABI

- Modify the `LibroNFT.ts` file to export the address and ABI of the `LibroPaymaster` contract.
- ABI can be obtained from the `artifacts` directory after compiling the contracts or `deployments-zk` directory after deploying the contracts.

```typescript
// frontend/libs/LibroNFT.ts
const LIBRO_NFT_ADDRESS = "0x2DcA9FdA301B22Bcc3ca7FA7B30b506CAF9205B5" as `0x${string}`;;
const LIBRO_NFT_ABI = [
    ...
] as const;

export { LIBRO_NFT_ADDRESS, LIBRO_NFT_ABI };
```

- Create a new file named `LibroPaymaster.ts` in the `libs` directory.

```typescript
// frontend/libs/LibroPaymaster.ts
const LIBRO_PAYMASTER_ADDRESS = "0x8624cfA52d5F93c0174D8d318fD9E531592D176E" as `0x${string}`;;
const LIBRO_PAYMASTER_ABI = [
    ...
] as const;

export { LIBRO_PAYMASTER_ADDRESS, LIBRO_PAYMASTER_ABI };
```

- Create a new file named `Counter.ts` in the `libs` directory.

```typescript
// frontend/libs/Counter.ts
const COUNTER_ADDRESS = "0x42d625D2A7142F55952d8B63a5FCa907656c2887" as `0x${string}`;;
const COUNTER_ABI = [
    ...
] as const;

export { COUNTER_ADDRESS, COUNTER_ABI };
```

### 2. Create context directory

- Create a new directory named `context` in the `frontend` directory.
- Move the `ZkSyncClient` context from `app/providers.ts` to the `context/ZkSyncClient.ts` file.

```typescript
// frontend/context/ZkSyncClient.ts
import { createContext, useEffect, useState } from "react";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { WalletClient, createWalletClient, custom } from "viem";
import { eip712WalletActions, zkSyncSepoliaTestnet } from "viem/zksync";

interface ZkSyncClientContextValue {
  wallet: ConnectedWallet | null;
  zkSyncClient: WalletClient | null;
}

const ZkSyncClientContext = createContext({} as ZkSyncClientContextValue);

const ZkSyncClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [zkSyncClient, setZkSyncClient] = useState<WalletClient | null>(null);

  const zkSyncSetup = async (wallet: ConnectedWallet) => {
    await wallet.switchChain(zkSyncSepoliaTestnet.id); // Switch to zkSync chain
    const provider = await wallet.getEthereumProvider(); // Get EIP-1193 provider

    const client = createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: zkSyncSepoliaTestnet,
      transport: custom(provider),
    }).extend(eip712WalletActions());

    setWallet(wallet);
    setZkSyncClient(client);
  };

  useEffect(() => {
    if (ready && authenticated) {
      const embeddedWallet: ConnectedWallet | undefined = wallets.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (embeddedWallet) {
        zkSyncSetup(embeddedWallet);
      }
    }
  }, [ready, authenticated, wallets]);

  return (
    <ZkSyncClientContext.Provider
      value={{
        wallet,
        zkSyncClient,
      }}
    >
      {children}
    </ZkSyncClientContext.Provider>
  );
};

export { ZkSyncClientContext, ZkSyncClientProvider };
```

- Modify the import in the `hooks/useZkSyncClient.ts` file.
- Extend the public client with the L2 actions of zkSync. This is required to estimate the transaction fee.

```typescript
// frontend/hooks/useZkSyncClient.ts
import { ZkSyncClientContext } from "@/context/ZkSyncClient"; // Fix the import
import { useContext } from "react";
import { createPublicClient, http } from "viem";
import { zkSyncSepoliaTestnet } from "viem/chains";
import { publicActionsL2 } from "viem/zksync";

const useZkSyncClient = () => {
  const publicClient = createPublicClient({
    chain: zkSyncSepoliaTestnet,
    transport: http(),
  }).extend(publicActionsL2()); // Extend the client with L2 actions of zkSync
  const { wallet, zkSyncClient } = useContext(ZkSyncClientContext);

  return { wallet, publicClient, zkSyncClient };
};

export default useZkSyncClient;
```

- Modify the import in the `app/providers.ts` file.
- Modify export to default export.

```typescript
// frontend/app/providers.ts
"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ChakraProvider } from "@chakra-ui/react";
import { zkSyncSepoliaTestnet } from "viem/zksync";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ZkSyncClientProvider } from "@/context/ZkSyncClient";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Configure the default chain and supported chains with zkSyncSepoliaTestnet
        defaultChain: zkSyncSepoliaTestnet,
        supportedChains: [zkSyncSepoliaTestnet],
        // Create embedded wallets for users who don't have a wallet at first login
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <ChakraProvider>
        <ZkSyncClientProvider>
          <QueryClientProvider client={queryClient}>
            {mounted && children}
          </QueryClientProvider>
        </ZkSyncClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  );
};

export default Providers; // Change the export to default export
```

- Modify the import in the `app/layout.tsx` file.

```typescript
// frontend/app/layout.tsx
import Providers from "./providers";
```

### 3. Create Paymaster context

```typescript
// frontend/types/index.ts
import { Account, Address } from "viem";

interface TransactionRequest {
  name: string; // The name of the request
  from?: Account | Address; // The account or address from which the transaction is sent
  to: `0x${string}`; // The address to which the transaction is sent
  data: `0x${string}`; // The data of the transaction
  value?: `0x${string}`; // The value of the transaction
}

export { TransactionRequest };
```

```bash
$ yarn add @chakra-ui/icons
```

## Demo

## Conclusion

## Next Steps

## References

- [zkSync: NFT Gated Paymaster](https://docs.zksync.io/build/tutorials/dapp-development/gated-nft-paymaster-tutorial.html)

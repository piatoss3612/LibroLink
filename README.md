# 2. General Paymaster with custom features

## Overview

In this tutorial, we will cover following topics:

- Understand the General Paymaster contract and its limitations.
- Add custom features to the paymaster contract.
- Integrate the paymaster contract with the Privy and viem on the frontend.

This tutorial is for developers who:

- Interested in onboarding Web2 users to Web3 by providing a seamless social login experience.
- Want to learn how to create a general paymaster contract with custom features.
- Build a project with zkSync network and get ready for the next hackathon.

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

### 0. What is a Paymaster?

- A paymaster is a contract that pays fees for the transactions on behalf of the user.
- Or accepts ERC20 tokens as a payment for the transaction fees.
- zkSync provides native support for EOAs to leverage the paymaster contract.
- These features are useful for onboarding Web2 users to Web3 by providing a gasless experience.

### 1. General Paymaster Contract

- [GeneralPaymaster.sol](https://github.com/matter-labs/zksync-contract-templates/blob/main/templates/hardhat/solidity/contracts/paymasters/GeneralPaymaster.sol) is a basic general paymaster contract provided by zkSync.
- The default flow of the general paymaster contract only supports the ETH payment for the transaction fees.

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

### 2. IPaymaster Interface

- [IPaymaster.sol](https://github.com/matter-labs/era-contracts/blob/main/system-contracts/contracts/interfaces/IPaymaster.sol) is the interface for the paymaster contract.
- Every paymaster contract should implement the `IPaymaster` interface.
- The interface includes two functions: `validateAndPayForPaymasterTransaction` and `postTransaction`.
- The `validateAndPayForPaymasterTransaction` function is called by the bootloader to verify that the paymaster agrees to pay for the fee for the transaction.
- The `postTransaction` function is called by the bootloader after the execution of the transaction. It is not guaranteed that this method will be called at all.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "../libraries/TransactionHelper.sol";

enum ExecutionResult {
    Revert,
    Success
}

bytes4 constant PAYMASTER_VALIDATION_SUCCESS_MAGIC = IPaymaster.validateAndPayForPaymasterTransaction.selector;

interface IPaymaster {
    /// @dev Called by the bootloader to verify that the paymaster agrees to pay for the
    /// fee for the transaction. This transaction should also send the necessary amount of funds onto the bootloader
    /// address.
    /// @param _txHash The hash of the transaction
    /// @param _suggestedSignedHash The hash of the transaction that is signed by an EOA
    /// @param _transaction The transaction itself.
    /// @return magic The value that should be equal to the signature of the validateAndPayForPaymasterTransaction
    /// if the paymaster agrees to pay for the transaction.
    /// @return context The "context" of the transaction: an array of bytes of length at most 1024 bytes, which will be
    /// passed to the `postTransaction` method of the account.
    /// @dev The developer should strive to preserve as many steps as possible both for valid
    /// and invalid transactions as this very method is also used during the gas fee estimation
    /// (without some of the necessary data, e.g. signature).
    function validateAndPayForPaymasterTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable returns (bytes4 magic, bytes memory context);

    /// @dev Called by the bootloader after the execution of the transaction. Please note that
    /// there is no guarantee that this method will be called at all. Unlike the original EIP4337,
    /// this method won't be called if the transaction execution results in out-of-gas.
    /// @param _context, the context of the execution, returned by the "validateAndPayForPaymasterTransaction" method.
    /// @param  _transaction, the users' transaction.
    /// @param _txResult, the result of the transaction execution (success or failure).
    /// @param _maxRefundedGas, the upper bound on the amout of gas that could be refunded to the paymaster.
    /// @dev The exact amount refunded depends on the gas spent by the "postOp" itself and so the developers should
    /// take that into account.
    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable;
}
```

### 3. General Paymaster Flow

![Paymaster Flow](https://docs.zksync.io/_ipx/q_90/images/101-paymasters/zksync-paymaster.png)

1. The transaction with `paymaster params` is sent to the mempool.

- `paymaster params` is a part of the transaction that contains the additional information to leverage the paymaster contract.

2. The system contract `Bootloader` checks the `paymaster params` and calls the `validateAndPayForPaymasterTransaction` function of the paymaster contract.
3. The paymaster contract verifies the transaction and pays at least `tx.gasPrice * tx.gasLimit` ETH for the transaction to the bootloader.
4. The transaction is executed.
5. The system contract `Bootloader` calls the `postTransaction` function of the paymaster contract, which can be used to execute additional logic after the transaction is executed.

### 4. Create a new Paymaster contract

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

### 5. Compile the Paymaster contract

- Before compiling the contract, make sure to add the `isSystem` flag to the `zksolc` settings in the `hardhat.config.ts` file.
- `isSystem` flag is required to enable the interactivity with the zkSync system contracts.

```tsx
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
- To prevent this, you need to consider adding custom features to the paymaster contract to control the usage of the paymaster.

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
- We can use another approach like limiting the gas usage per day, though counter is more intuitive and easier to implement.
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

```tsx
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

```tsx
// frontend/libs/LibroNFT.ts
const LIBRO_NFT_ADDRESS = "0x2DcA9FdA301B22Bcc3ca7FA7B30b506CAF9205B5" as `0x${string}`;;
const LIBRO_NFT_ABI = [
    ...
] as const;

export { LIBRO_NFT_ADDRESS, LIBRO_NFT_ABI };
```

- Create a new file named `LibroPaymaster.ts` in the `libs` directory.

```tsx
// frontend/libs/LibroPaymaster.ts
const LIBRO_PAYMASTER_ADDRESS = "0x8624cfA52d5F93c0174D8d318fD9E531592D176E" as `0x${string}`;;
const LIBRO_PAYMASTER_ABI = [
    ...
] as const;

export { LIBRO_PAYMASTER_ADDRESS, LIBRO_PAYMASTER_ABI };
```

- Create a new file named `Counter.ts` in the `libs` directory.

```tsx
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

```tsx
// frontend/context/ZkSyncClient.tsx
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
- Extend the public client with the L2 actions of zkSync. This is required to [estimate the transaction fee](https://viem.sh/zksync/actions/estimateFee).

```tsx
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

- Modify the import in the `app/providers.tsx` file.
- Modify export to default export.

```tsx
// frontend/app/providers.tsx
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

```tsx
// frontend/app/layout.tsx
import Providers from "./providers";
```

### 3. Create PaymasterModal component

- Install the `@chakra-ui/icons` package to use the icons in the modal component.

```bash
$ yarn add @chakra-ui/icons
```

- Create a new component named `PaymasterModal.tsx` in the `components/paymaster` directory.
- The component will display the transaction details and allow the user to confirm the transaction.
- The component will also display the error message if the user is banned, not an NFT owner, or has reached the daily limit.
- Once the user confirms the transaction, the transaction will be processed.
- The component will display the transaction status and transaction hash after the transaction is processed.

```tsx
import {
  Button,
  Center,
  Divider,
  HStack,
  Highlight,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  SmallCloseIcon,
  WarningIcon,
} from "@chakra-ui/icons";

const Line = ({
  left,
  right,
}: {
  left: string | JSX.Element;
  right: string | JSX.Element;
}): JSX.Element => (
  <HStack spacing={4} justify="space-between" w={"100%"}>
    <Text fontSize="lg" fontWeight="bold">
      {left}
    </Text>
    <Text fontSize="lg">{right}</Text>
  </HStack>
);

interface PaymentModalProps {
  onClose: () => void;
  isOpen: boolean;
  isLoading: boolean;
  requestName: string;
  gasPrice: string;
  fee: string;
  cost: string;
  dailyLimit: bigint;
  canResetDailyTxCount: boolean;
  hasReachedDailyLimit: boolean;
  dailyTxCount: bigint;
  isBanned: boolean;
  isNftOwner: boolean;
  txStatus: "success" | "reverted" | "";
  txHash: string;
  confirmPayment: () => void;
}

const PaymasterModal = ({
  onClose,
  isOpen,
  isLoading,
  requestName,
  gasPrice,
  fee,
  cost,
  dailyLimit,
  canResetDailyTxCount,
  hasReachedDailyLimit,
  dailyTxCount,
  isBanned,
  isNftOwner,
  txStatus,
  txHash,
  confirmPayment,
}: PaymentModalProps) => {
  const paymasterAvailable = !isBanned && isNftOwner && !hasReachedDailyLimit;
  const errorMessage = isBanned
    ? "Banned account are not allowed"
    : !isNftOwner
    ? "Only LibroNFT holders are allowed"
    : hasReachedDailyLimit
    ? "Daily limit reached"
    : "";

  return (
    <Modal
      isCentered
      onClose={onClose}
      isOpen={isOpen}
      motionPreset="slideInBottom"
      size={{ base: "lg", md: "xl" }}
      trapFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transaction Details</ModalHeader>
        <ModalCloseButton onClick={onClose} />
        {isLoading && (
          <ModalBody>
            <Center m={12}>
              <Stack spacing={8} justify="center" align="center">
                <Spinner thickness="4px" size="lg" />
                <Text>Processing...</Text>
              </Stack>
            </Center>
          </ModalBody>
        )}
        {!isLoading && !txHash && (
          <>
            <ModalBody bg={"gray.100"} mx={6} rounded={"md"}>
              <Stack m={4} spacing={4} justify="center" align="center">
                {errorMessage && (
                  <Highlight
                    query={errorMessage}
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "red.500",
                      fontWeight: "bold",
                      fontSize: "lg",
                      color: "white",
                    }}
                  >
                    {errorMessage}
                  </Highlight>
                )}
                <Line left="Transaction:" right={requestName} />
                <Line left="Transaction Fee:" right={`${fee} ETH`} />
                <Line left="Gas Price:" right={`${gasPrice} ETH`} />
                <Line
                  left="Daily Limit:"
                  right={`${dailyTxCount.toString()}/${dailyLimit.toString()}`}
                />
                <Line
                  left="Reset Daily Limit:"
                  right={
                    <Tooltip
                      label="Reset on UTC 6:00 AM"
                      aria-label="A tooltip"
                    >
                      {canResetDailyTxCount ? (
                        <CheckCircleIcon color="green" />
                      ) : (
                        <SmallCloseIcon color="red" />
                      )}
                    </Tooltip>
                  }
                />
                <Divider />
                <Line left="Estimated Cost:" right={`${cost} ETH`} />
                {paymasterAvailable && (
                  <Line
                    left="Paymaster Discount:"
                    right={
                      <Highlight
                        query={"-100%"}
                        styles={{
                          px: "2",
                          py: "1",
                          rounded: "full",
                          bg: "green.100",
                          fontWeight: "bold",
                        }}
                      >
                        -100%
                      </Highlight>
                    }
                  />
                )}
                <Divider />
                <Line
                  left="Total Cost:"
                  right={`${paymasterAvailable ? "FREE" : `${cost} ETH`}`}
                />
              </Stack>
            </ModalBody>
            <ModalFooter display="flex" justifyContent="center">
              <Button
                colorScheme="green"
                onClick={confirmPayment}
                width={"100%"}
                isDisabled={!paymasterAvailable}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
        {!isLoading && txHash && (
          <>
            <ModalBody>
              <Center m={4}>
                <Stack spacing={4} justify="center" align="center">
                  {txStatus === "success" ? (
                    <>
                      <CheckCircleIcon
                        name="check-circle"
                        color="green.500"
                        boxSize={"2.4rem"}
                      />
                      <Text>Transaction Succeeded</Text>
                    </>
                  ) : (
                    <>
                      <WarningIcon
                        name="warning"
                        color="red.500"
                        boxSize={"2.4rem"}
                      />
                      <Text>Transaction Reverted</Text>
                    </>
                  )}

                  <Link
                    href={`https://sepolia.explorer.zksync.io/tx/${txHash}`}
                    isExternal
                  >
                    See on Explorer <ExternalLinkIcon mx="2px" />
                  </Link>
                </Stack>
              </Center>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PaymasterModal;
```

### 4. Define the PaymasterRequest type

- Create a new file named `index.d.ts` in the `types` directory.
- Define the `PaymasterRequest` type to represent the transaction request to process with the paymaster.

```tsx
// frontend/types/index.d.ts
import { Account, Address } from "viem";

interface PaymasterRequest {
  name: string; // The name of the request
  from?: Account | Address; // The account or address from which the transaction is sent
  to: `0x${string}`; // The address to which the transaction is sent
  data: `0x${string}`; // The data of the transaction
  value?: bigint; // The value of the transaction
}

export { PaymasterRequest };
```

### 5. Create the PaymasterContext

- Create a new file named `Paymaster.tsx` in the `context` directory.
- Define the `PaymasterContext` context to open the paymaster modal and process the transaction.
- The `openPaymasterModal` function will take the transaction request and callback function as arguments.
  - `request`: The transaction request to process.
  - `callback`: The callback function to execute after successfully processing the transaction.

```tsx
// frontend/context/Paymaster.tsx
import { PaymasterRequest } from "@/types";
import { createContext } from "react";

interface PaymasterContextValue {
  openPaymasterModal: (
    request: PaymasterRequest,
    callback?: () => void
  ) => void;
}

const PaymasterContext = createContext({} as PaymasterContextValue);
```

### 6. Create the PaymasterProvider component

- On the same file, create the `PaymasterProvider` component to provide the `PaymasterContext` context.
- The component will handle the transaction request, estimate the transaction fee, and process the transaction with the paymaster.
- The component will also handle the daily limit, ban filter, and NFT owner checks.
-

```tsx
import PaymasterModal from "@/components/paymaster/PaymasterModal";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import {
  LIBRO_PAYMASTER_ABI,
  LIBRO_PAYMASTER_ADDRESS,
} from "@/libs/LibroPaymaster";
import { PaymasterRequest } from "@/types";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { formatEther } from "viem";
import {
  EstimateFeeReturnType,
  getGeneralPaymasterInput,
  zkSyncSepoliaTestnet,
} from "viem/zksync";

...

const PaymasterProvider = ({ children }: { children: React.ReactNode }) => {
  // Chakra UI hooks for modals and toasts
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Custom hook to get the wallet and clients
  const { wallet, publicClient, zkSyncClient } = useZkSyncClient();

  // State for the transaction request
  const [request, setRequest] = useState<PaymasterRequest | null>(null);
  const [callback, setCallback] = useState<() => void>(() => {});

  // State for the loading status and transaction result
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<"success" | "reverted" | "">("");
  const [txHash, setTxHash] = useState<string>("");

  // Function to get the estimate fee of zkSync network for a transaction
  const getEstimateFee = async (): Promise<EstimateFeeReturnType> => {
    if (!publicClient || !wallet) {
      throw new Error("Request not found");
    }

    if (!request) {
      throw new Error("Request not found");
    }

    const paymasterInput = getGeneralPaymasterInput({
      innerInput: "0x",
    });

    return await publicClient.estimateFee({
      account: request.from || (wallet.address as `0x${string}`),
      to: request.to,
      data: request.data,
      value: request.value,
      paymaster: LIBRO_PAYMASTER_ADDRESS,
      paymasterInput,
    });
  };

  const { data: estimateFee } = useQuery({
    queryKey: ["estimateFee", wallet?.address],
    queryFn: getEstimateFee,
    enabled: !!publicClient && !!wallet && !!request,
    refetchInterval: 3000,
  });

  const estimateFeeValue =
    estimateFee ||
    ({ gasLimit: BigInt(0), maxFeePerGas: BigInt(0) } as EstimateFeeReturnType);
  const gasPrice = formatEther(estimateFeeValue.maxFeePerGas);
  const fee = formatEther(estimateFeeValue.gasLimit);
  const cost = formatEther(
    estimateFeeValue.maxFeePerGas * estimateFeeValue.gasLimit
  );

  // Function to open the paymaster modal
  const openPaymasterModal = (
    request: PaymasterRequest,
    callback?: () => void
  ) => {
    setRequest(request);
    setCallback(() => callback || (() => {}));
    onOpen();
  };

  // Function to close the paymaster modal
  const closePaymasterModal = () => {
    const fn = callback;
    const status = txStatus;

    setRequest(null);
    setCallback(() => {});
    setTxStatus("");
    setTxHash("");
    onClose();

    if (status === "success") {
      fn(); // Call the callback function
    }
  };

  const confirmPayment = async () => {
    try {
      if (!wallet || !zkSyncClient) {
        throw new Error("Wallet or zkSync client not found");
      }

      if (!request) {
        throw new Error("Request not found");
      }

      setIsLoading(true);

      // Get the paymaster input
      const paymasterInput = getGeneralPaymasterInput({
        innerInput: "0x",
      });

      // Send the transaction
      const hash = await zkSyncClient.sendTransaction({
        account: request.from || (wallet.address as `0x${string}`),
        to: request.to,
        data: request.data,
        value: request.value,
        chain: zkSyncSepoliaTestnet,
        paymaster: LIBRO_PAYMASTER_ADDRESS,
        paymasterInput,
      });

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Update the result
      setTxHash(hash);
      setTxStatus(receipt.status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the daily limit of the paymaster
  const getDailyLimit = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "dailyLimit",
    });
  };

  // Function to check the daily limit of an account
  // [reset, reached, count]
  const checkDailyLimit = async (
    account: `0x${string}`
  ): Promise<readonly [boolean, boolean, bigint]> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "checkDailyLimit",
      args: [account],
    });
  };

  // Function to get whether an account is banned or not
  const getIsBanned = async (account: `0x${string}`): Promise<boolean> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "isBanned",
      args: [account],
    });
  };

  // Function to get whether an account is an NFT owner or not
  const getIsNftOwner = async (account: `0x${string}`): Promise<boolean> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "isNftOwner",
      args: [account],
    });
  };

  const [
    dailyLimitQuery,
    checkDailyLimitQuery,
    isBannedQuery,
    isNftOwnerQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: ["dailyLimit"],
        queryFn: getDailyLimit,
        enabled: !!publicClient,
        refetchInterval: 3000,
      },
      {
        queryKey: ["checkDailyLimit", wallet?.address],
        queryFn: async () => {
          return await checkDailyLimit(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet,
        refetchInterval: 3000,
      },
      {
        queryKey: ["isBanned", wallet?.address],
        queryFn: async () => {
          return await getIsBanned(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet,
        refetchInterval: 3000,
      },
      {
        queryKey: ["isNftOwner", wallet?.address],
        queryFn: async () => {
          return await getIsNftOwner(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet,
        refetchInterval: 3000,
      },
    ],
  });

  const dailyLimit = dailyLimitQuery.data || BigInt(0);
  const [canResetDailyTxCount, hasReachedDailyLimit, dailyTxCount] =
    checkDailyLimitQuery.data || [false, false, BigInt(0)];
  const isBanned = isBannedQuery.data || false;
  const isNftOwner = isNftOwnerQuery.data || false;

  return (
    <PaymasterContext.Provider
      value={{
        openPaymasterModal,
      }}
    >
      <PaymasterModal
        isOpen={isOpen}
        onClose={closePaymasterModal}
        isLoading={isLoading}
        requestName={request?.name || "Unknown Request"}
        gasPrice={gasPrice}
        fee={fee}
        cost={cost}
        dailyLimit={dailyLimit}
        canResetDailyTxCount={canResetDailyTxCount}
        hasReachedDailyLimit={hasReachedDailyLimit}
        dailyTxCount={dailyTxCount}
        isBanned={isBanned}
        isNftOwner={isNftOwner}
        txStatus={txStatus}
        txHash={txHash}
        confirmPayment={confirmPayment}
      />
      {children}
    </PaymasterContext.Provider>
  );
};

export { PaymasterProvider, PaymasterContext };
```

### 7. How to send a transaction with the Paymaster

- At the last section, we created the `ZkSyncClient` context which provides the `publicClient` and `zkSyncClient` objects.
- `zkSyncClient` is extended with the EIP-712 actions of zkSync for signing the typed structured data.

```tsx
const client = createWalletClient({
  account: wallet.address as `0x${string}`,
  chain: zkSyncSepoliaTestnet,
  transport: custom(provider),
}).extend(eip712WalletActions());
```

- Once the user confirms the transaction, the `confirmPayment` function is called to send the transaction with the paymaster.

```tsx
const confirmPayment = async () => {
  ...
};
```

- The `confirmPayment` function first gets the paymaster input of general type.

```tsx
const paymasterInput = getGeneralPaymasterInput({
  innerInput: "0x",
});
```

- Then it sends the transaction with the paymaster parameters.
- In detail, the `sendTransaction` works as follows:
  1. Check the request fields
  2. If paymaster parameters are found, request to signer to sign the digest of EIP-712 typed structured data
  3. Attach the signature to the transaction and send the serialized transaction to the zkSync network
- The `sendTransaction` function returns the transaction hash after the transaction is processed.

```tsx
const hash = await zkSyncClient.sendTransaction({
  account: request.from || (wallet.address as `0x${string}`),
  to: request.to,
  data: request.data,
  value: request.value,
  chain: zkSyncSepoliaTestnet,
  paymaster: LIBRO_PAYMASTER_ADDRESS,
  paymasterInput,
});
```

### 8. Modify the Providers component

- Modify the `Providers` component to wrap the children with the `PaymasterProvider` component.
- The `PaymasterProvider` component depends on the `ZkSyncClientProvider` component, thus it should be wrapped inside the `ZkSyncClientProvider` component.

```tsx
// frontend/app/providers.tsx
"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ChakraProvider } from "@chakra-ui/react";
import { zkSyncSepoliaTestnet } from "viem/zksync";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ZkSyncClientProvider } from "@/context/ZkSyncClient";
import { PaymasterProvider } from "@/context/Paymaster";

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
            {/*
                Wrap the children with the PaymasterProvider
                to provide the PaymasterContext context
            */}
            <PaymasterProvider>{mounted && children}</PaymasterProvider>
          </QueryClientProvider>
        </ZkSyncClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  );
};

export default Providers;
```

### 9. Create the usePaymaster hook

- Create a new file named `usePaymaster.ts` in the `hooks` directory.
- Create the `usePaymaster` hook to access the `PaymasterContext` context.

```typescript
import { PaymasterContext } from "@/context/Paymaster";
import { useContext } from "react";

const usePaymaster = () => {
  return useContext(PaymasterContext);
};

export default usePaymaster;
```

### 10. Modify the Main component

- Modify the `Main` component to use the `usePaymaster` hook and open the paymaster modal to interact with the `Counter` contract.
- The `getCounterValue` function will get the counter value from the `Counter` contract. The counter value will be displayed in the UI.
- The `incrementCounter` function will open the paymaster modal to increment the counter value.

```tsx
// frontend/components/Main.tsx
"use client";

import usePaymaster from "@/hooks/usePaymaster";
import { COUNTER_ABI, COUNTER_ADDRESS } from "@/libs/Counter";

const Main = () => {
  const { openPaymasterModal } = usePaymaster();

  ...

  // ====== Counter ======
  const getCounterValue = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: COUNTER_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: "count",
    });
  };

  const { data: counterValue } = useQuery({
    queryKey: ["counterValue"],
    queryFn: getCounterValue,
    enabled: !!publicClient,
    refetchInterval: 3000,
  });

  // ====== Counter with Paymaster ======
  const incrementCounter = async () => {
    if (!wallet) {
      return;
    }

    const data = encodeFunctionData({
      abi: COUNTER_ABI,
      functionName: "increment",
    });

    openPaymasterModal({
      name: "Increment Counter",
      from: wallet.address as `0x${string}`,
      to: COUNTER_ADDRESS,
      data,
    });
  };

  if (!authenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        bg="gray.300"
      >
        <Center my="auto">
          <Button onClick={login} isLoading={!ready}>
            Login
          </Button>
        </Center>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.300">
      <Center my="auto">
        <VStack
          spacing={4}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Button onClick={logout} isLoading={!ready}>
            Logout
          </Button>
          {wallet && (
            <VStack spacing={4}>

              ...

              {/*
                Counter Section to display the counter value and increment the counter
              */}
              <VStack spacing={4} border="1px" borderRadius={"md"} p={8} m={4}>
                <Heading>Counter</Heading>
                <Text>Counter Value: {counterValue?.toString()}</Text>
                <Button onClick={incrementCounter}>Increment Counter</Button>
              </VStack>
            </VStack>
          )}
        </VStack>
      </Center>
    </Box>
  );
};

export default Main;
```

> In this example, the `Counter` contract is used to demonstrate the paymaster integration. You can replace the `Counter` contract with any other contract you want to interact with!

## Demo

### Run the Application Locally

- Run the frontend application or access the deployed application to leverage the paymaster integration.

```bash
$ yarn dev
```

- Open the browser and navigate to `http://localhost:3000` to access the application.

### Demo Video

- [Demo Application](https://zk-sync-native-aa-demo-6toua303d-piatoss3612s-projects.vercel.app/)

[![General-Paymaster-Demo](https://img.youtube.com/vi/Ht7gay-9IAI/0.jpg)](https://www.youtube.com/watch?v=Ht7gay-9IAI)

## Conclusion

- In this tutorial, we learned how to add custom logic to the paymaster contract to restrict the transaction based on the user's daily limit, ban status, and NFT ownership.
- We also learned how to integrate the paymaster contract with the frontend application to process the transaction based on the user's eligibility and provide a gasless transaction experience.
- We also learned how to estimate the transaction fee and process the transaction with viem library and zkSync network.

## Next Steps

### In the Next Tutorial

- Implement the contract account
- Implement the registry contract for LibroLink membership management

### Advanced Topics

- Gas usage limit and refund excess gas mechanism on the General Paymaster
- Approval-based Paymaster with ERC20 tokens payment and price oracle integration

## References

- [Paymasters introduction](https://docs.zksync.io/build/quick-start/paymasters-introduction)
- [Dapp with gated NFT paymaster](https://code.zksync.io/tutorials/dapp-nft-paymaster)
- [Viem: estimateFee](https://viem.sh/zksync/actions/estimateFee)

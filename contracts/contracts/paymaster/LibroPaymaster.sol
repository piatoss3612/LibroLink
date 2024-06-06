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

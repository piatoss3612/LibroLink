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

import {NftGated, IERC721} from "./NftGated.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20TokenPriceManager} from "../token/ERC20TokenPriceManager.sol";

contract LibroERC20Paymaster is IPaymaster, NftGated, ERC20TokenPriceManager {
    // ====== Custom Errors ======
    error LibroERC20Paymaster__ZeroAddress();
    error LibroERC20Paymaster__OnlyBootloaderCanCallThisMethod();
    error LibroERC20Paymaster__PaymasterInputShouldBeAtLeast4BytesLong();
    error LibroERC20Paymaster__MinimumAllowanceNotSatisfied(uint256 required, uint256 actual);
    error LibroERC20Paymaster__FailedToTransferTxFeeToBootloader();
    error LibroERC20Paymaster__UnsupportedPaymasterFlowInPaymasterParams();
    error LibroERC20Paymaster__FailedToWithdrawFundsFromPaymaster();
    error LibroERC20Paymaster__ExeededMinimumAllowance(uint256 required, uint256 allowed);
    error LibroERC20Paymaster__FailedToTransferToken(address token);

    event Refund(address indexed user, address indexed token, uint256 amount);

    // ====== Modifiers ======
    modifier onlyBootloader() {
        if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) {
            revert LibroERC20Paymaster__OnlyBootloaderCanCallThisMethod();
        }
        // Continue execution if called from the bootloader.
        _;
    }

    // ====== Constructor ======
    constructor(address _nft) {
        nft = IERC721(_nft);
    }

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
            revert LibroERC20Paymaster__PaymasterInputShouldBeAtLeast4BytesLong();
        }

        // Check if the user owns the NFT.
        address userAddress = address(uint160(_transaction.from));
        if (userAddress == address(0)) {
            revert LibroERC20Paymaster__ZeroAddress();
        }

        bytes4 paymasterInputSelector = bytes4(_transaction.paymasterInput[0:4]);

        // Check if the paymaster flow is approval based.
        if (paymasterInputSelector != IPaymasterFlow.approvalBased.selector) {
            revert LibroERC20Paymaster__UnsupportedPaymasterFlowInPaymasterParams();
        }

        // Decode the paymaster input.
        (address token, uint256 minAllowance,) = abi.decode(_transaction.paymasterInput[4:], (address, uint256, bytes));

        // Check if the user has enough allowance.
        uint256 actualAllowance = IERC20(token).allowance(userAddress, address(this));
        if (actualAllowance < minAllowance) {
            revert LibroERC20Paymaster__MinimumAllowanceNotSatisfied(minAllowance, actualAllowance);
        }

        // Note, that while the minimal amount of ETH needed is tx.gasPrice * tx.gasLimit,
        // neither paymaster nor account are allowed to access this context variable.
        uint256 requiredETH = _transaction.gasLimit * _transaction.maxFeePerGas;

        // Convert the required amount of ETH to tokens. If the token is not supported, the function will revert.
        (uint256 requiredToken,) = getEthPriceInToken(token, requiredETH);

        // Check if required token amount exceeds the minimal allowance.
        if (requiredToken > minAllowance) {
            revert LibroERC20Paymaster__ExeededMinimumAllowance(requiredToken, minAllowance);
        }

        // Check if the user owns the gated NFT.
        if (isNftOwner(userAddress)) {
            // Give 5% discount to the user.
            requiredToken = (requiredToken * 95) / 100;
        }

        // Transfer the required amount of tokens to the paymaster.
        bool transferred = IERC20(token).transferFrom(userAddress, address(this), requiredToken);
        if (!transferred) {
            revert LibroERC20Paymaster__FailedToTransferToken(token);
        }

        // Encode the token address, the required amount and the sponsored amount in the context.
        context = _encodeContext(token, requiredToken, 0);

        // The bootloader never returns any data, so it can safely be ignored here.
        (bool success,) = payable(BOOTLOADER_FORMAL_ADDRESS).call{value: requiredETH}("");
        if (!success) {
            revert LibroERC20Paymaster__FailedToTransferTxFeeToBootloader();
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
    ) external payable override onlyBootloader {
        uint256 gasUsed = (_transaction.gasLimit - _maxRefundedGas) * _transaction.maxFeePerGas;

        (address token, uint256 requiredAmount,) = _decodeContext(_context);

        // Calculate the amount of tokens used.
        (uint256 usedToken,) = getEthPriceInToken(token, gasUsed);

        // Calculate the amount of tokens that should be refunded.
        uint256 refundAmount = requiredAmount - usedToken;

        // Take 2% fee from the used tokens for extra gas consumption.
        uint256 fee = (usedToken * 2) / 100;
        refundAmount -= fee;

        // Refund the unused tokens to the user.
        if (refundAmount > 0) {
            address userAddress = address(uint160(_transaction.from));
            bool transferred = IERC20(token).transfer(userAddress, refundAmount);
            if (!transferred) {
                revert LibroERC20Paymaster__FailedToTransferToken(token);
            }

            emit Refund(userAddress, token, refundAmount);
        }
    }

    function withdraw(address payable _to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = _to.call{value: balance}("");
        if (!success) {
            revert LibroERC20Paymaster__FailedToWithdrawFundsFromPaymaster();
        }
    }

    function _encodeContext(address _token, uint256 _requiredAmount, uint256 _sponsoredAmount)
        internal
        pure
        returns (bytes memory)
    {
        return abi.encode(_token, _requiredAmount, _sponsoredAmount);
    }

    function _decodeContext(bytes memory _context)
        internal
        pure
        returns (address token, uint256 requiredAmount, uint256 sponsoredAmount)
    {
        return abi.decode(_context, (address, uint256, uint256));
    }

    receive() external payable {}
}

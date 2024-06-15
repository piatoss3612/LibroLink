// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";

contract LibroAccountFactory {
    error LibroAccountFactory__DeploymentFailed();

    bytes32 public aaBytecodeHash;

    constructor(bytes32 _aaBytecodeHash) {
        aaBytecodeHash = _aaBytecodeHash;
    }

    /**
     * @notice Deploys a new account contract
     * @param salt random salt by which the account address is calculated
     * @param owner address of the account owner
     */
    function deployAccount(bytes32 salt, address owner) external returns (address accountAddress) {
        // Call the system contract to deploy the account
        (bool success, bytes memory returnData) = SystemContractsCaller.systemCallWithReturndata(
            uint32(gasleft()),
            address(DEPLOYER_SYSTEM_CONTRACT),
            uint128(0),
            abi.encodeCall(
                DEPLOYER_SYSTEM_CONTRACT.create2Account,
                (salt, aaBytecodeHash, abi.encode(owner), IContractDeployer.AccountAbstractionVersion.Version1)
            )
        );
        if (!success) {
            revert LibroAccountFactory__DeploymentFailed();
        }

        // Decode the return data to get the address of the deployed account
        (accountAddress) = abi.decode(returnData, (address));
    }

    /**
     * @notice Returns the address of the account that would be deployed with the given salt
     * @param salt random salt by which the account address is calculated
     * @param owner address of the account owner
     */
    function getAccountAddress(bytes32 salt, address owner) external view returns (address accountAddress) {
        accountAddress = IContractDeployer(DEPLOYER_SYSTEM_CONTRACT).getNewAddressCreate2(
            address(this), aaBytecodeHash, salt, abi.encode(owner)
        );
    }
}

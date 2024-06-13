import { Deployer } from "@matterlabs/hardhat-zksync";
import { getProvider, getWallet, verifyContract } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { EIP712Signer, types, utils } from "zksync-ethers";
import {
  AbiCoder,
  Contract,
  Signature,
  ZeroHash,
  concat,
  parseEther,
} from "ethers";

// This script is used to deploy a LibroAccountFactory contract and create an account using it.
// as well as verify it on Block Explorer if possible for the network
export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = getProvider();
  const wallet = getWallet();
  const deployer = new Deployer(hre, wallet);

  const factoryArtifact = await deployer.loadArtifact("LibroAccountFactory");
  const accountArtifact = await deployer.loadArtifact("LibroAccount");

  const aaBytecodeHash = utils.hashBytecode(accountArtifact.bytecode);

  const factory = await deployer.deploy(
    factoryArtifact,
    [aaBytecodeHash],
    undefined,
    undefined,
    [accountArtifact.bytecode] // Should specify additional factory dependencies
  );

  const factoryAddress = await factory.getAddress();

  console.log(`Factory address: ${factoryAddress}`);

  const abiCoder = new AbiCoder();

  console.log("Verifying factory on Block Explorer");

  await verifyContract({
    address: factoryAddress,
    contract: "contracts/account/LibroAccountFactory.sol:LibroAccountFactory",
    constructorArguments: abiCoder.encode(["bytes32"], [aaBytecodeHash]),
    bytecode: factoryArtifact.bytecode,
  });

  console.log("Factory verified");

  const salt = ZeroHash;
  const owner = wallet.address;

  const tx = await factory.deployAccount(salt, owner);
  await tx.wait();

  const accountAddress = await factory.getAccountAddress(salt, owner);

  console.log(`Account address: ${accountAddress}`);

  console.log("Verifying account on Block Explorer");

  await verifyContract({
    address: accountAddress,
    contract: "contracts/account/LibroAccount.sol:LibroAccount",
    constructorArguments: abiCoder.encode(["address"], [owner]),
    bytecode: accountArtifact.bytecode,
  });

  console.log("Account verified");

  console.log("Funding account with 0.02 ETH");

  const fundTx = await wallet.sendTransaction({
    to: accountAddress,
    value: parseEther("0.02"),
  });
  await fundTx.wait();

  console.log("Account funded");

  const counterAddress = "0x42d625D2A7142F55952d8B63a5FCa907656c2887";
  const counterArtifact = await deployer.loadArtifact("Counter");

  const counter = new Contract(counterAddress, counterArtifact.abi, wallet);

  const countBefore = BigInt(await counter.count());

  console.log(`Counter count before: ${countBefore.toString()}`);

  console.log("Calling increment on account");

  let incrementTx = await counter.increment.populateTransaction();

  incrementTx = {
    ...incrementTx,
    from: accountAddress,
    chainId: (await provider.getNetwork()).chainId,
    nonce: await provider.getTransactionCount(accountAddress),
    type: 113,
    gasPrice: await provider.getGasPrice(),
    value: BigInt(0),
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
    } as types.Eip712Meta,
  };

  incrementTx.gasLimit = await provider.estimateGas(incrementTx);

  const digest = EIP712Signer.getSignedDigest(incrementTx);

  const signature = concat([
    Signature.from(wallet.signingKey.sign(digest)).serialized,
  ]);

  incrementTx.customData = {
    ...incrementTx.customData,
    customSignature: signature,
  };

  console.log("Sending increment transaction");

  const sentTx = await provider.broadcastTransaction(
    types.Transaction.from(incrementTx).serialized
  );

  await sentTx.wait();

  const countAfter = BigInt(await counter.count());

  console.log(`Counter count after: ${countAfter}`);

  if (countAfter === countBefore + BigInt(1)) {
    console.log("Counter incremented successfully");
  } else {
    console.error("Counter increment failed");
  }

  console.log("Done!");
}

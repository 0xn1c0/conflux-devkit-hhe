import hre from "hardhat";
import { Conflux, Drip, address } from "js-conflux-sdk";

const conflux = new Conflux({
  url: hre.network.config.url,
});

async function main() {
  try {
    // Validate connection
    await conflux.updateNetworkId();
    const version = await conflux.provider.call("cfx_clientVersion");
    console.log(`Connected to Conflux network: ${version}`);

    const account = conflux.wallet.addPrivateKey(
      hre.network.config.accounts[0],
    );
    const { abi, bytecode } = await hre.artifacts.readArtifact("Lock");
    const contract = conflux.Contract({
      abi: abi,
      bytecode: bytecode,
    });
    const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const amount = Drip.fromCFX(10);

    const deployReceipt = await contract
      .constructor(unlockTime)
      .sendTransaction({
        from: account.address,
        value: amount,
      })
      .executed();

    console.log(
      "Contract deployed to:",
      address.simplifyCfxAddress(deployReceipt.contractCreated),
    );
  } catch (error) {
    if (error.errno === -111) {
      console.warn(`Failed to connect to ${error.address}:${error.port}.`);
    } else if (error.code === -32601) {
      console.warn(
        `${hre.network.name} is not compatible with this deploy, select a conflux Core endpoint`,
      );
    } else {
      console.error("Failed to deploy contract:", error);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

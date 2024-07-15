import hre from "hardhat";
const {
  conflux, // The Conflux instance
  ConfluxSDK,
} = hre;
async function main() {
  try {
    // Validate connection
    const version = await conflux.provider.call("cfx_clientVersion");
    console.log(`Connected to Conflux network: ${version}`);

    const accounts = await conflux.getSigners();
    const contract = await conflux.getContractFactory("Lock");

    const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const amount = ConfluxSDK.Drip.fromCFX(10);

    const deployReceipt = await contract
      .constructor(unlockTime)
      .sendTransaction({
        from: accounts[0].address,
        value: amount,
      })
      .executed();

    console.log(
      "Contract deployed to:",
      ConfluxSDK.address.simplifyCfxAddress(deployReceipt.contractCreated),
    );
  } catch (error) {
    if (error.errno === -111) {
      console.warn(`Failed to connect to ${error.address}:${error.port}.`);
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

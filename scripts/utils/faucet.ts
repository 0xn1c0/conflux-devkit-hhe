import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Faucet } from "devkit";

const devkit_faucet = new Faucet();
export async function faucet(
  taskArguments: { amount: string; address: string },
  hre: HardhatRuntimeEnvironment,
  runSuper: unknown,
) {
  const _ = runSuper;
  await devkit_faucet.run({
    faucet: [taskArguments.amount, taskArguments.address],
  });
}

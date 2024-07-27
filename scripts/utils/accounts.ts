import { HardhatRuntimeEnvironment } from "hardhat/types";
import { genesisList } from "devkit";

export async function accounts(
  taskArguments: { amount: string; address: string },
  hre: HardhatRuntimeEnvironment,
  runSuper: unknown,
) {
  const _ = runSuper;
  await genesisList.run({});
}

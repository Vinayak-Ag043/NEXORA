const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Nexora smart contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const NexoraFactory = await ethers.getContractFactory("Nexora");
  const nexora = await NexoraFactory.deploy();

  await nexora.waitForDeployment();

  const contractAddress = await nexora.getAddress();
  console.log("\n==========================================");
  console.log("Nexora smart contract successfully deployed!");
  console.log("Contract Address:", contractAddress);
  console.log("==========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

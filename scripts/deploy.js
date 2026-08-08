const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying Nexora to:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log(
    "Deployer balance:",
    hre.ethers.formatEther(balance),
    "ETH"
  );

  const Nexora = await hre.ethers.getContractFactory("Nexora");

  console.log("Deploying contract...");

  const nexora = await Nexora.deploy();

  await nexora.waitForDeployment();

  const address = await nexora.getAddress();

  const deploymentInfo = {
    contract: "Nexora",
    address: address,
    network: "sepolia",
    chainId: 11155111,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("====================================");
  console.log("NEXORA DEPLOYED SUCCESSFULLY");
  console.log("Contract address:", address);
  console.log("Network: sepolia");
  console.log("Chain ID: 11155111");
  console.log("Deployment information saved to deployment.json");
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
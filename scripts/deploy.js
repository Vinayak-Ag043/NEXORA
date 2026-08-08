const hre = require('hardhat');

async function main() {
  const Nexora = await hre.ethers.getContractFactory('Nexora');
  const nexora = await Nexora.deploy();
  await nexora.waitForDeployment();
  console.log('Nexora smart contract successfully deployed!');
  console.log(`Contract Address: ${await nexora.getAddress()}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

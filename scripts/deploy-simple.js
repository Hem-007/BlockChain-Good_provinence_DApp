const hre = require("hardhat");

async function main() {
  console.log("Deploying ArtisanMarketplace contract...");

  try {
    // Get the network
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);

    // Get the signer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

    // Deploy the contract without specifying gas parameters
    const ArtisanMarketplace = await hre.ethers.getContractFactory("ArtisanMarketplace");
    console.log("Deploying contract...");
    const artisanMarketplace = await ArtisanMarketplace.deploy();

    console.log("Waiting for deployment transaction to be mined...");
    await artisanMarketplace.waitForDeployment();

    const address = await artisanMarketplace.getAddress();
    console.log(`ArtisanMarketplace deployed to: ${address}`);

    console.log("Deployment completed successfully!");

    // For verification purposes, print out the command to verify the contract
    console.log(`\nTo verify the contract on Etherscan, run:`);
    console.log(`npx hardhat verify --network sepolia ${address}`);
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

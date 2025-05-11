const hre = require("hardhat");

async function main() {
  console.log("Preparing to deploy ArtisanMarketplace contract...");
  try {
    // Get the network
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (chainId: ${network.chainId})`);

    // Get the signer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deployer account: ${deployer.address}`);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

    // Use a conservative gas price (1 gwei)
    const gasPrice = hre.ethers.parseUnits("1", "gwei");
    console.log(`Using gas price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);

    // Get the contract factory
    const ArtisanMarketplace = await hre.ethers.getContractFactory("ArtisanMarketplace");
    console.log("Contract factory created");

    // Force manual confirmation through MetaMask
    console.log("\n=== DEPLOYING CONTRACT WITH MANUAL CONFIRMATION ===");
    console.log("You should see a MetaMask popup to confirm the transaction.");
    console.log("If you don't see it, check if MetaMask is unlocked and connected to Sepolia.");

    // Deploy with manual confirmation
    console.log("\nSending deployment transaction...");
    const artisanMarketplace = await ArtisanMarketplace.deploy({
      gasLimit: 5000000,
      gasPrice: gasPrice
    });

    console.log(`\nTransaction sent! Hash: ${artisanMarketplace.deploymentTransaction().hash}`);
    console.log("You can track this transaction on Sepolia Etherscan.");
    console.log(`https://sepolia.etherscan.io/tx/${artisanMarketplace.deploymentTransaction().hash}`);

    console.log("\nWaiting for transaction confirmation...");
    console.log("This may take several minutes. Please be patient and do not close this window.");

    // Wait for deployment with a longer timeout (10 minutes)
    console.log("\nWaiting for deployment to complete (timeout: 10 minutes)...");
    await artisanMarketplace.waitForDeployment({ timeout: 600000 });

    // Get the contract address
    const address = await artisanMarketplace.getAddress();
    console.log(`\n=== DEPLOYMENT SUCCESSFUL ===`);
    console.log(`ArtisanMarketplace deployed to: ${address}`);

    // Instructions for next steps
    console.log("\n=== NEXT STEPS ===");
    console.log("1. Update your .env file with the contract address:");
    console.log(`   NEXT_PUBLIC_ARTISAN_MARKETPLACE_ADDRESS=${address}`);
    console.log("2. Verify your contract on Etherscan:");
    console.log(`   npx hardhat verify --network sepolia ${address}`);
    console.log("3. Start your application:");
    console.log("   npm run dev");
  } catch (error) {
    console.error("\n=== DEPLOYMENT ERROR ===");
    console.error(error);

    // Provide helpful error messages
    if (error.message.includes("user rejected transaction")) {
      console.log("\nYou rejected the transaction in MetaMask. Please try again if you want to deploy the contract.");
    } else if (error.message.includes("timeout")) {
      console.log("\nThe deployment timed out. This doesn't necessarily mean it failed.");
      console.log("Check Sepolia Etherscan to see if your transaction was confirmed.");
      console.log("If it was confirmed, look for the contract address in the transaction details.");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\nYou don't have enough Sepolia ETH to deploy the contract.");
      console.log("Get more Sepolia ETH from a faucet like https://sepoliafaucet.com/");
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

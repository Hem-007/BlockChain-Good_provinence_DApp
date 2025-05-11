const hre = require("hardhat");

async function main() {
  console.log("Preparing ArtisanMarketplace contract deployment...");
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

    // Use a very conservative gas price (1 gwei)
    const gasPrice = hre.ethers.parseUnits("1", "gwei");
    console.log(`Using gas price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);

    // Get the contract factory
    const ArtisanMarketplace = await hre.ethers.getContractFactory("ArtisanMarketplace");
    console.log("Contract factory created");

    // Get the deployment transaction (without sending it)
    const deployTx = await ArtisanMarketplace.getDeployTransaction();

    // Set gas parameters
    deployTx.gasLimit = 5000000;
    deployTx.gasPrice = gasPrice;

    // Calculate the estimated cost
    const estimatedCost = BigInt(deployTx.gasLimit) * gasPrice;
    console.log(`Estimated deployment cost: ${hre.ethers.formatEther(estimatedCost)} ETH`);

    // Print transaction details for manual deployment
    console.log("\n=== MANUAL DEPLOYMENT INSTRUCTIONS ===");
    console.log("1. Open MetaMask and ensure you're connected to Sepolia testnet");
    console.log("2. Click 'Send' and use these parameters:");
    console.log("   - To: [Leave empty for contract deployment]");
    console.log("   - Amount: 0 ETH");
    console.log(`   - Gas Limit: ${deployTx.gasLimit.toString()}`);
    console.log(`   - Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
    console.log("3. In the 'Hex Data' field, paste this data:");
    console.log(deployTx.data);
    console.log("\n4. Review the transaction and click 'Confirm'");
    console.log("5. After the transaction is confirmed, get the contract address from the transaction receipt");
    console.log("6. Update your .env file with the new contract address:");
    console.log("   NEXT_PUBLIC_ARTISAN_MARKETPLACE_ADDRESS=your-new-contract-address");
    console.log("\n=== END OF INSTRUCTIONS ===");

  } catch (error) {
    console.error("Error preparing deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

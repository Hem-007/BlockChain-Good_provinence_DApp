const hre = require("hardhat");

async function main() {
  try {
    // Get the signer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Account address: ${deployer.address}`);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

    // Calculate required gas for deployment
    const gasLimit = BigInt(5000000);
    const gasPrice = hre.ethers.parseUnits("1", "gwei");
    const requiredGas = gasLimit * gasPrice;

    console.log(`Required gas for deployment (at 1 gwei): ${hre.ethers.formatEther(requiredGas)} ETH`);

    if (balance >= requiredGas) {
      console.log("You have enough funds for deployment!");
    } else {
      console.log("WARNING: You don't have enough funds for deployment.");
      console.log(`You need at least ${hre.ethers.formatEther(requiredGas - balance)} more ETH.`);
      console.log("Please get more Sepolia ETH from a faucet like https://sepoliafaucet.com/");
    }
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

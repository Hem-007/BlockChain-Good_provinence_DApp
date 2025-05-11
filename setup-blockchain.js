const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up blockchain development environment...');

// Install dependencies
console.log('Installing Hardhat and related dependencies...');
try {
  execSync('npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox', { stdio: 'inherit' });
  execSync('npm install --save ethers@^6.11.1 @openzeppelin/contracts', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Create directories if they don't exist
const directories = ['contracts', 'scripts', 'test'];
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Create .env.example file if it doesn't exist
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.log('Creating .env.example file...');
  const envExampleContent = `# Blockchain Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-api-key
PRIVATE_KEY=your-private-key-here

# Contract Addresses (after deployment)
NEXT_PUBLIC_ARTISAN_MARKETPLACE_ADDRESS=0x
`;
  fs.writeFileSync(envExamplePath, envExampleContent);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
}

console.log('Setup complete!');
console.log('\nNext steps:');
console.log('1. Edit your .env file with your Sepolia RPC URL and private key');
console.log('2. Compile the contracts: npm run compile');
console.log('3. Deploy to Sepolia: npm run deploy:sepolia');
console.log('4. Update your .env file with the deployed contract address');
console.log('5. Start the development server: npm run dev');

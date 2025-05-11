# ChennaiArtisanConnect Blockchain Integration

This document provides instructions on how to set up and use the blockchain integration for the ChennaiArtisanConnect platform.

## Overview

The ChennaiArtisanConnect platform now includes a real blockchain integration using:

- Solidity smart contracts for the backend
- Hardhat for development, testing, and deployment
- Ethers.js for frontend integration
- MetaMask for wallet connection and transaction signing

The smart contract (`ArtisanMarketplace.sol`) implements the following functionality:

- Artisan registration
- Product creation as NFTs
- Product purchasing
- Provenance tracking
- Product verification

## Setup Instructions

### 1. Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install --save-dev "@nomicfoundation/hardhat-chai-matchers@^2.0.0" "@nomicfoundation/hardhat-ethers@^3.0.0" "@nomicfoundation/hardhat-network-helpers@^1.0.0" "@nomicfoundation/hardhat-verify@^2.0.0" "@typechain/ethers-v6@^0.5.0" "@typechain/hardhat@^9.0.0" "@types/chai@^4.2.0" "@types/mocha@>=9.1.0" "chai@^4.2.0" "hardhat-gas-reporter@^1.0.8" "solidity-coverage@^0.8.1" "ts-node@>=8.0.0" "typechain@^8.3.0" "@openzeppelin/contracts"
```

### 2. Configure Environment

Create a `.env` file in the root directory with the following content:

```
# Blockchain Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-api-key
PRIVATE_KEY=your-private-key-here

# Contract Addresses (after deployment)
NEXT_PUBLIC_ARTISAN_MARKETPLACE_ADDRESS=0x
```

Replace `your-api-key` with your Infura or Alchemy API key, and `your-private-key-here` with your Ethereum private key (make sure it has some Sepolia ETH for deployment).

### 3. Compile the Smart Contract

```bash
npm run compile
```

### 4. Run Tests

```bash
npm run test:contracts
```

### 5. Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

After deployment, update the `NEXT_PUBLIC_ARTISAN_MARKETPLACE_ADDRESS` in your `.env` file with the deployed contract address.

### 6. Start the Development Server

```bash
npm run dev
```

## Using the DApp

### As an Artisan

1. **Connect Wallet**: Click "Connect Wallet" in the navigation bar to connect your MetaMask wallet.
2. **Register as Artisan**: Navigate to `/artisans/register` and fill out the registration form.
3. **Add Products**: After registration, go to `/dashboard/add-product` to create new products as NFTs.
4. **Manage Products**: View and manage your products in the dashboard.

### As a Customer

1. **Connect Wallet**: Click "Connect Wallet" in the navigation bar to connect your MetaMask wallet.
2. **Browse Products**: Explore available products on the homepage.
3. **Purchase Products**: Click on a product to view details and purchase it using MetaMask.
4. **View Your NFTs**: After purchasing, view your NFTs in the "My NFTs" section.

## Technical Details

### Smart Contract

The `ArtisanMarketplace.sol` contract is an ERC721-based NFT marketplace that handles:

- Artisan registration and management
- Product creation as NFTs
- Product purchases with ownership transfer
- Provenance tracking for each product
- Product verification by the marketplace owner

### Frontend Integration

The frontend interacts with the smart contract through the `contractService.ts` file, which provides:

- Wallet connection and management
- Artisan registration and profile management
- Product creation, listing, and purchasing
- NFT management and display
- Provenance tracking and verification

### Network Configuration

The DApp is configured to work with the Sepolia testnet. Users need:

- MetaMask installed and configured for Sepolia
- Some Sepolia ETH for gas fees (available from faucets)

## Troubleshooting

### MetaMask Connection Issues

- Make sure MetaMask is installed and unlocked
- Ensure you're connected to the Sepolia testnet
- Check that you have sufficient Sepolia ETH for gas fees

### Transaction Failures

- Check the console for error messages
- Ensure you have sufficient Sepolia ETH for gas
- Verify that you're connected to the correct network
- Make sure you're using the correct account in MetaMask

### Contract Deployment Issues

- Verify your `.env` file has the correct RPC URL and private key
- Ensure your account has sufficient Sepolia ETH for deployment
- Check the Hardhat configuration in `hardhat.config.js`

## Future Enhancements

- Add royalties for artisans on secondary sales
- Implement bidding functionality for auctions
- Add more detailed provenance tracking
- Enhance security with multi-signature verification
- Implement a decentralized storage solution for product images and metadata

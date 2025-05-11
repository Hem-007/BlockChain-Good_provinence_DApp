# ChennaiArtisanConnect - Blockchain-Based Artisan Marketplace

ChennaiArtisanConnect is a modern e-commerce platform designed to connect local artisans from Chennai with a global audience. It leverages blockchain technology to ensure authenticity and transparency for artisanal goods. Users can explore unique crafts, learn about the artisans, and purchase items, with each product represented as an NFT on the Sepolia test network.

## Features

- **Wallet Integration:** Connect with MetaMask on the Sepolia test network
- **Artisan Registration:** Create profiles to showcase your work
- **Artisan Dashboard:**
  - Add new products (mints an NFT via a Sepolia transaction)
  - View and manage listed products
  - Edit product details
  - Remove products from the marketplace
- **Product Marketplace:**
  - Browse authentic artisanal goods
  - View detailed product information, including artisan details
- **Product Purchase:**
  - Securely purchase products (creates a Sepolia transaction)
  - Acquire an NFT representing the purchased item
- **My NFTs:** View your collection of artisanal NFTs with transaction verification
- **Provenance Verification:** Track the history and authenticity of products
- **Responsive Design:** Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend:** Next.js 15 (App Router, Server Components, TypeScript)
- **Styling:** Tailwind CSS, ShadCN UI Components
- **Icons:** Lucide React
- **State Management:** React Context API (`WalletContext`)
- **Blockchain Interaction:**
  - MetaMask for wallet connection and transaction signing on Sepolia Testnet
  - In-memory data store with localStorage persistence
- **AI (Setup):** Genkit (Google AI) - Initialized but not yet deeply integrated

## Prerequisites

- Node.js (v18.x or later recommended)
- NPM or Yarn
- MetaMask browser extension installed and configured with a Sepolia testnet account
- Sepolia ETH for gas fees (available from [Sepolia faucets](https://sepoliafaucet.com/))

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ChennaiArtisanConnect.git
   cd ChennaiArtisanConnect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:9002`

## Usage Guide

### For Buyers

1. **Connect Your Wallet:**
   - Click "Connect Wallet" in the navigation bar
   - Approve the connection in MetaMask
   - Ensure you're on the Sepolia test network

2. **Browse Products:**
   - Explore available products on the homepage
   - Click on a product to view details

3. **Purchase a Product:**
   - Click "Buy Now" on a product detail page
   - Confirm the transaction in MetaMask
   - The NFT will be created automatically after purchase

4. **View Your NFTs:**
   - Navigate to "My NFTs" in the navigation bar
   - View your collection of purchased items
   - Each NFT includes a transaction ID for verification

### For Artisans

1. **Register as an Artisan:**
   - Connect your wallet
   - Navigate to "Become an Artisan"
   - Fill out the registration form
   - Confirm the transaction in MetaMask

2. **Access Your Dashboard:**
   - After registration, navigate to "Dashboard"
   - View your profile and products

3. **Add a Product:**
   - Click "Add Product" in your dashboard
   - Fill out the product details
   - Upload an image
   - Confirm the transaction in MetaMask

4. **Manage Products:**
   - View, edit, or remove your products from the dashboard
   - Track sales and view product provenance

## How It Works

### Blockchain Integration

- **Wallet Connection:** The application connects to MetaMask using the `window.ethereum` API
- **Transaction Signing:** Real Sepolia transactions are created and signed through MetaMask
- **Data Storage:** Products, artisans, and NFTs are stored in memory and persisted in localStorage
- **NFT Creation:** After purchase, an NFT is created with the transaction hash for verification

### Important Notes

- **MetaMask Integration:** The application now skips automatic NFT addition to MetaMask due to compatibility issues. NFTs are still created and can be viewed in the "My NFTs" page.
- **Sepolia Testnet:** Users must have their MetaMask configured for the Sepolia test network and have SepoliaETH for gas fees.
- **Data Persistence:** The application state is maintained in memory and localStorage. Refreshing the page will not lose your data, but clearing browser data will reset the application state.

## Troubleshooting

### Common Issues

1. **MetaMask Not Connecting:**
   - Ensure MetaMask is installed and unlocked
   - Check that you're on the Sepolia test network
   - Try refreshing the page

2. **Transaction Failures:**
   - Ensure you have sufficient Sepolia ETH for gas fees
   - Check MetaMask for any error messages
   - Try again with a higher gas limit

3. **NFTs Not Appearing:**
   - Navigate to "My NFTs" page to view your purchases
   - Refresh the page if NFTs don't appear immediately
   - Check that the transaction was successful in MetaMask

## Project Structure

```
src/
├── app/                  # Next.js app router pages
├── components/           # React components
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
│   ├── blockchainService.ts  # Blockchain interaction logic
│   ├── contractService.ts    # Smart contract interaction
│   ├── data.ts               # Mock data
│   └── resetStorage.ts       # Storage management
└── types/                # TypeScript type definitions
```

## Future Enhancements

- Deployment of actual smart contracts (ERC721 for NFTs, marketplace contract)
- Integration with IPFS for decentralized image and metadata storage
- Enhanced search and filtering capabilities
- User profiles and order history
- Mobile app version

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js, Tailwind CSS, and ShadCN UI
- Blockchain integration with MetaMask and Sepolia test network
- Icons from Lucide React
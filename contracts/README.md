# Smart Contract for ChennaiArtisanConnect

This directory contains the smart contract for the ChennaiArtisanConnect platform, which enables artisans to register, create products as NFTs, and sell them to customers.

## Contract Overview

The `ArtisanMarketplace.sol` contract is an ERC721-based NFT marketplace that provides the following functionality:

- **Artisan Registration**: Artisans can register with their details (name, bio, profile image)
- **Product Creation**: Registered artisans can create products as NFTs
- **Product Purchase**: Users can purchase products, transferring ownership of the NFT
- **Provenance Tracking**: Each product has a provenance history that tracks its creation, sales, and verification
- **Product Verification**: The marketplace owner can verify products for authenticity

## Contract Structure

### Main Components

1. **Structs**:
   - `Artisan`: Stores artisan details (id, name, bio, profile image)
   - `Product`: Stores product details (name, description, materials, price, etc.)
   - `ProvenanceEvent`: Stores provenance events (timestamp, event type, actor, details)

2. **Mappings**:
   - `artisans`: Maps addresses to Artisan structs
   - `products`: Maps token IDs to Product structs
   - `productProvenance`: Maps token IDs to arrays of ProvenanceEvent structs
   - `artisanIdToAddress`: Maps artisan IDs to their wallet addresses

3. **Events**:
   - `ArtisanRegistered`: Emitted when a new artisan registers
   - `ProductCreated`: Emitted when a new product is created
   - `ProductSold`: Emitted when a product is sold
   - `ProvenanceAdded`: Emitted when a new provenance event is added

### Key Functions

- `registerArtisan`: Register a new artisan
- `createProduct`: Create a new product as an NFT
- `purchaseProduct`: Purchase a product, transferring ownership
- `verifyProduct`: Verify a product (only owner)
- `getProductProvenance`: Get the provenance history of a product
- `isArtisanRegistered`: Check if an address is a registered artisan
- `getArtisanByAddress`: Get artisan details by address
- `getArtisanById`: Get artisan details by ID

## Deployment

The contract is designed to be deployed on the Sepolia testnet. To deploy:

1. Make sure you have set up your `.env` file with:
   ```
   SEPOLIA_RPC_URL=your-sepolia-rpc-url
   PRIVATE_KEY=your-private-key
   ```

2. Run the deployment script:
   ```
   npm run deploy:sepolia
   ```

3. After deployment, update the contract address in your `.env` file:
   ```
   ARTISAN_MARKETPLACE_ADDRESS=deployed-contract-address
   ```

## Integration with Frontend

The frontend interacts with the contract through the `contractService.ts` file, which provides a TypeScript interface to the contract functions. This service handles:

- Wallet connection
- Artisan registration
- Product creation and purchase
- Fetching product and artisan data
- Managing NFT assets in MetaMask

## Testing

To run the contract tests:

```
npm run test:contracts
```

The tests cover all major functionality including:
- Artisan registration
- Product creation
- Product purchase
- Product verification
- Provenance tracking

## Security Considerations

- The contract uses OpenZeppelin's ERC721URIStorage and Ownable for secure implementation
- Only registered artisans can create products
- Only the contract owner can verify products
- Funds are transferred directly to the seller when a product is purchased

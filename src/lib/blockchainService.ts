// This service simulates blockchain interactions.
// In a real DApp, this would use ethers.js or web3.js to interact with a smart contract.
"use client";

import type { Product, Artisan, ProductProvenance, NFT } from '@/types';
import { mockArtisans, mockProducts, mockProductProvenance, mockUserNfts } from './data';
import { toast } from '@/hooks/use-toast';
import {
  addProductForArtisan,
  getAllProductsFromStorage,
  getArtisanProductsFromStorage,
  updateProductPurchaseStatus
} from './resetStorage';

// Mock contract address for NFTs (Sepolia testnet)
const MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

// Simulate a delay for blockchain operations
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get data from localStorage or use mock data
const getLocalStorageData = <T>(key: string, mockData: T): T => {
  if (typeof window === 'undefined') return mockData;

  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      console.log(`Retrieved data from localStorage for key ${key}`);
      return JSON.parse(storedData) as T;
    }
  } catch (e) {
    console.error(`Error retrieving ${key} from localStorage:`, e);
  }

  // If we reach here, either there was no data or there was an error
  // Initialize the localStorage with the mock data
  try {
    localStorage.setItem(key, JSON.stringify(mockData));
    console.log(`Initialized localStorage for key ${key} with mock data`);
  } catch (storageError) {
    console.error(`Error initializing ${key} in localStorage:`, storageError);
  }

  return mockData;
};

// Helper function to save data to localStorage
const saveLocalStorageData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;

  try {
    // First, clear the existing data
    localStorage.removeItem(key);

    // Then set the new data
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Successfully saved data to localStorage for key ${key}`);
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);

    // Try with a smaller subset if it's an array (might be a storage limit issue)
    if (Array.isArray(data) && data.length > 10) {
      try {
        const reducedData = data.slice(0, 10); // Take only the first 10 items
        localStorage.setItem(key, JSON.stringify(reducedData));
        console.log(`Saved reduced dataset (10 items) to localStorage for key ${key}`);
      } catch (reducedError) {
        console.error(`Error saving reduced dataset for ${key}:`, reducedError);
      }
    }
  }
};

// Function to directly get products from localStorage - now using resetStorage.ts
const getProductsFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return mockProducts;

  const products = getAllProductsFromStorage();

  // If no products found, initialize with empty array
  if (products.length === 0) {
    // Initialize with empty array instead of mock data
    localStorage.setItem('blockchain_products', JSON.stringify([]));
    console.log("Initialized localStorage with empty products array");
    return [];
  }

  console.log("Retrieved products from localStorage, count:", products.length);
  return products;
};

// Function to directly save products to localStorage - now using resetStorage.ts
const saveProductsToStorage = (products: Product[]): void => {
  if (typeof window === 'undefined') return;

  try {
    // Use consistent key 'blockchain_products' for products
    localStorage.setItem('blockchain_products', JSON.stringify(products));
    console.log("Products saved to localStorage, count:", products.length);
  } catch (e) {
    console.error("Error saving products to localStorage:", e);

    // Try with a smaller subset if it's a storage limit issue
    if (products.length > 10) {
      try {
        const reducedData = products.slice(0, 10); // Take only the first 10 items
        localStorage.setItem('blockchain_products', JSON.stringify(reducedData));
        console.log(`Saved reduced dataset (10 products) to localStorage`);
      } catch (reducedError) {
        console.error(`Error saving reduced products dataset:`, reducedError);
      }
    }
  }
};

// EMERGENCY FIX: Direct function to add a product to an artisan
export const directAddProductToArtisan = (product: Product, artisanWallet: string): void => {
  if (typeof window === 'undefined') return;

  console.log("EMERGENCY FIX: Directly adding product to artisan:", artisanWallet);

  try {
    // Get current artisans
    const artisans: Artisan[] = getLocalStorageData('blockchain_artisans', []);

    // Find the artisan by wallet address
    let artisan = artisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());

    // If artisan doesn't exist, create one
    if (!artisan) {
      const newArtisan: Artisan = {
        id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: "Auto-registered Artisan",
        bio: "Automatically registered artisan",
        walletAddress: artisanWallet,
        profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
      };

      artisans.push(newArtisan);
      saveLocalStorageData('blockchain_artisans', artisans);
      console.log("Created new artisan:", newArtisan);
      artisan = newArtisan;
    }

    // Get current products
    const products = getProductsFromStorage();

    // Make sure the product has the correct artisanId
    product.artisanId = artisan.id;

    // Add the product
    products.push(product);

    // Save products
    saveProductsToStorage(products);

    console.log("EMERGENCY FIX: Product added successfully:", product);
    console.log("EMERGENCY FIX: Total products:", products.length);
    console.log("EMERGENCY FIX: Products for this artisan:",
      products.filter(p => p.artisanId === artisan.id).length);

    // Also save to a special emergency key for backup
    try {
      localStorage.setItem('emergency_products', JSON.stringify(products));
      localStorage.setItem('emergency_artisans', JSON.stringify(artisans));
    } catch (e) {
      console.error("Error saving emergency backup:", e);
    }
  } catch (e) {
    console.error("EMERGENCY FIX: Error adding product:", e);
  }
};

// In-memory state for products, artisans, and NFTs to simulate changes
let currentProducts: Product[] = getProductsFromStorage();
let currentArtisans: Artisan[] = getLocalStorageData('blockchain_artisans', mockArtisans);
let currentUserNfts: Record<string, NFT[]> = getLocalStorageData('blockchain_user_nfts', mockUserNfts);
let currentProductProvenance: Record<string, ProductProvenance> = getLocalStorageData('blockchain_product_provenance', mockProductProvenance);

// Use a different name for the second contract address to avoid duplicate declaration
const MOCK_NFT_MARKETPLACE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000002';


export const isArtisanRegistered = async (walletAddress: string): Promise<boolean> => {
  await simulateDelay(100);
  return currentArtisans.some(artisan => artisan.walletAddress.toLowerCase() === walletAddress.toLowerCase());
};

export const getArtisanByWalletAddress = async (walletAddress: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return currentArtisans.find(artisan => artisan.walletAddress.toLowerCase() === walletAddress.toLowerCase());
}

export const registerArtisan = async (artisanData: Omit<Artisan, 'id' | 'walletAddress'>, walletAddress: string): Promise<Artisan | null> => {
  await simulateDelay();
  const existingArtisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  if (existingArtisan) {
    toast({ title: "Registration Failed", description: "This wallet address is already registered as an artisan.", variant: "destructive" });
    return null;
  }

  const newArtisan: Artisan = {
    ...artisanData,
    id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    walletAddress: walletAddress,
  };

  // Add to in-memory array
  currentArtisans.push(newArtisan);

  // Save to localStorage
  saveLocalStorageData('blockchain_artisans', currentArtisans);
  console.log("Saved artisans to localStorage after registration, count:", currentArtisans.length);

  toast({ title: "Registration Successful", description: `Welcome, ${newArtisan.name}! You are now registered as an artisan.` });
  return newArtisan;
};

export const connectWallet = async (): Promise<string | null> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts.length > 0) {
        return accounts[0];
      }
      return null;
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      toast({ title: "Connection Error", description: error.message || "Failed to connect wallet.", variant: "destructive" });
      return null;
    }
  } else {
    toast({ title: "MetaMask Not Found", description: "Please install MetaMask to use this DApp.", variant: "destructive" });
    return null;
  }
};

export const getCurrentWallet = async (): Promise<string | null> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("Error getting current wallet:", error);
      return null;
    }
  }
  return null;
};

export const addProduct = async (
  productData: Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress' | 'artisanId'>,
  artisanWallet: string
): Promise<{ success: boolean; product?: Product; transactionHash?: string }> => {
  console.log("addProduct called with:", JSON.stringify(productData), "wallet:", artisanWallet);

  // Ensure materials is an array for consistency
  if (productData.materials && !Array.isArray(productData.materials)) {
    console.log("Converting materials to array:", productData.materials);
    productData.materials = [productData.materials];
  }

  try {
    // Get artisan details
    const artisan = await getArtisanByWalletAddress(artisanWallet);

    if (!artisan) {
      console.log("No artisan found for wallet:", artisanWallet);
      toast({
        title: "Artisan Not Found",
        description: "You need to be registered as an artisan to add products.",
        variant: "destructive"
      });
      return { success: false };
    }

    // Add the product using our new function
    const newProduct = addProductForArtisan(productData, artisan.id, artisanWallet);
    console.log("Product added:", newProduct);

    // Update the in-memory state
    currentProducts = getProductsFromStorage();

    // Double-check that the product was saved correctly
    const allSavedProducts = getProductsFromStorage();
    console.log("All products after adding:", allSavedProducts);

    if (typeof window.ethereum === 'undefined') {
      console.log("MetaMask not found");
      toast({ title: "MetaMask Not Found", description: "Please install MetaMask to perform this action.", variant: "destructive" });
      return { success: false };
    }

    // Verify the product exists in localStorage
    const productExists = allSavedProducts.some(p => p.id === newProduct.id);
    console.log("Product exists in localStorage after add:", productExists);

    if (!productExists) {
      console.error("ERROR: Product not found in localStorage after add");
      toast({ title: "Error", description: "Failed to save product. Please try again.", variant: "destructive" });
      return { success: false };
    }

    // Set a flag in sessionStorage to indicate a product was just added
    // This will be used by the products page to force a refresh
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('product_just_added', 'true');
      sessionStorage.setItem('product_added_id', newProduct.id);
      console.log("Set product_just_added flag in sessionStorage");

      // CRITICAL FIX: Ensure the product is saved to localStorage
      try {
        // Get current products from localStorage
        const storedProducts = localStorage.getItem('blockchain_products');
        let products = [];

        if (storedProducts) {
          products = JSON.parse(storedProducts);
        }

        // Check if the product already exists
        const productExists = products.some((p: any) => p.id === newProduct.id);

        if (!productExists) {
          // Add the product to the array
          products.push(newProduct);

          // Save back to localStorage
          localStorage.setItem('blockchain_products', JSON.stringify(products));
          console.log("CRITICAL FIX: Manually added product to localStorage");
        }
      } catch (e) {
        console.error("CRITICAL FIX: Error ensuring product is in localStorage:", e);
      }
    }

    // Create provenance record
    currentProductProvenance[newProduct.id] = {
      productId: newProduct.id,
      history: [
        {
          event: 'Created by Artisan',
          timestamp: newProduct.creationDate,
          actorAddress: artisanWallet,
          details: `Initial creation of ${newProduct.name}`
        },
        {
          event: 'Listed for Sale',
          timestamp: new Date().toISOString(),
          actorAddress: artisanWallet,
          details: `Price set at ${newProduct.price} ETH`
        },
      ]
    };

    // Save provenance to localStorage
    saveLocalStorageData('blockchain_product_provenance', currentProductProvenance);

    // Now handle the blockchain transaction
    const transactionParameters = {
      to: MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS,
      from: artisanWallet,
      data: '0x00',
    };

    try {
      toast({ title: "Transaction Pending", description: "Please confirm the transaction in MetaMask to mint your product." });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      }) as string;

      console.log("Transaction hash:", txHash);

      // Simulate transaction mining delay
      await simulateDelay(2000);

      // Update the product with the transaction hash
      const productIndex = currentProducts.findIndex(p => p.id === newProduct.id);
      if (productIndex >= 0) {
        currentProductProvenance[newProduct.id].history[0].details += `. Tx: ${txHash.substring(0,10)}...`;
        // Save updated provenance to localStorage
        saveLocalStorageData('blockchain_product_provenance', currentProductProvenance);
      }

      toast({ title: "Product Added & Minted", description: `${newProduct.name} has been listed. Tx: ${txHash.substring(0,10)}...` });
      console.log("Product successfully added and minted");

      return { success: true, product: newProduct, transactionHash: txHash };

    } catch (error: any) {
      console.error("Error during simulated product minting transaction:", error);
      if (error.code === 4001) { // User rejected the transaction
        toast({ title: "Transaction Cancelled", description: "You cancelled the product minting transaction.", variant: "destructive" });
      } else {
        toast({ title: "Minting Failed", description: error.message || "Could not mint the product.", variant: "destructive" });
      }
      return { success: false };
    }
  } catch (error: any) {
    console.error("Error adding product:", error);
    toast({ title: "Error", description: "Failed to add product: " + (error.message || "Unknown error"), variant: "destructive" });
    return { success: false };
  }
};


export const updateProduct = async (productId: string, productData: Partial<Product>, artisanWallet: string): Promise<Product | null> => {
  await simulateDelay();

  // Ensure materials is an array for consistency
  if (productData.materials && !Array.isArray(productData.materials)) {
    console.log("Converting materials to array in updateProduct:", productData.materials);
    productData.materials = [productData.materials];
  }

  const productIndex = currentProducts.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    toast({ title: "Error", description: "Product not found.", variant: "destructive" });
    return null;
  }
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());
  if (!artisan || currentProducts[productIndex].artisanId !== artisan.id) {
     toast({ title: "Error", description: "Unauthorized to edit this product.", variant: "destructive" });
    return null;
  }

  currentProducts[productIndex] = { ...currentProducts[productIndex], ...productData };

  if (currentProductProvenance[productId]) {
    currentProductProvenance[productId].history.push(
      { event: 'Product Updated', timestamp: new Date().toISOString(), actorAddress: artisanWallet, details: `Details of ${currentProducts[productIndex].name} updated.` }
    );
  }

  toast({ title: "Product Updated", description: `${currentProducts[productIndex].name} has been successfully updated (simulated).` });
  return currentProducts[productIndex];
};

export const removeProduct = async (productId: string, artisanWallet: string): Promise<boolean> => {
  await simulateDelay();
  const productIndex = currentProducts.findIndex(p => p.id === productId);
   if (productIndex === -1) {
    toast({ title: "Error", description: "Product not found.", variant: "destructive" });
    return false;
  }
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());
  if (!artisan || currentProducts[productIndex].artisanId !== artisan.id) {
     toast({ title: "Error", description: "Unauthorized to remove this product.", variant: "destructive" });
    return false;
  }

  currentProducts.splice(productIndex, 1);
  delete currentProductProvenance[productId];

  toast({ title: "Product Removed", description: `Product has been successfully removed (simulated).` });
  return true;
};

export const purchaseProduct = async (
  productId: string,
  buyerAddress: string,
  priceInEth: number
): Promise<{ success: boolean; transactionHash?: string }> => {
  console.log("Purchase product called for product ID:", productId, "buyer:", buyerAddress);

  // Refresh products from localStorage first to ensure we have the latest data
  currentProducts = getProductsFromStorage();

  const productIndex = currentProducts.findIndex(p => p.id === productId);
  console.log("Product index:", productIndex, "Product found:", productIndex !== -1);

  if (productIndex === -1 || currentProducts[productIndex].isSold) {
    toast({ title: "Purchase Failed", description: "Product not available or already sold.", variant: "destructive" });
    return { success: false };
  }

  if (typeof window.ethereum === 'undefined') {
    toast({ title: "MetaMask Not Found", description: "Please install MetaMask to perform this action.", variant: "destructive" });
    return { success: false };
  }

  const product = currentProducts[productIndex];
  console.log("Product to purchase:", product);

  const artisan = currentArtisans.find(a => a.id === product.artisanId);
  console.log("Artisan found:", artisan);

  const priceInWei = BigInt(Math.round(priceInEth * 1e18)); // More robust conversion

  const transactionParameters = {
    to: MOCK_NFT_MARKETPLACE_CONTRACT_ADDRESS, // Mock contract address
    from: buyerAddress,
    value: '0x' + priceInWei.toString(16),
    data: '0x00', // Valid empty data field (just a single byte),
  };

  try {
    toast({ title: "Transaction Pending", description: "Please confirm the transaction in MetaMask to purchase." });
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    }) as string;

    console.log("Transaction hash received:", txHash);

    // Simulate transaction mining delay
    await simulateDelay(2000);

    // Generate a numeric ID for the product to use as tokenId
    // Use a simple numeric ID based on the product number or timestamp
    const match = product.id.match(/\d+/);
    const numericId = match ? match[0] : Math.floor(Date.now() / 1000).toString();
    console.log("Generated numeric ID for NFT:", numericId);

    const newNft: NFT = {
      tokenId: numericId, // Use a numeric ID that will work with MetaMask
      contractAddress: MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS, // The NFT contract address
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      artisanName: artisan?.name || 'Unknown Artisan',
      transactionHash: txHash, // Add the transaction hash to the NFT
    };
    console.log("Created new NFT object:", newNft);

    // Refresh NFTs from localStorage first
    currentUserNfts = getLocalStorageData('blockchain_user_nfts', currentUserNfts);

    // Initialize array for this user if it doesn't exist
    if (!currentUserNfts[buyerAddress.toLowerCase()]) {
      currentUserNfts[buyerAddress.toLowerCase()] = [];
    }

    // Add the new NFT to the user's collection
    currentUserNfts[buyerAddress.toLowerCase()].push(newNft);
    console.log("Added NFT to user's collection. New count:", currentUserNfts[buyerAddress.toLowerCase()].length);

    // Save NFTs to localStorage
    saveLocalStorageData('blockchain_user_nfts', currentUserNfts);
    console.log("Saved user NFTs to localStorage");

    // CRITICAL FIX: Also add this NFT as a product to ensure it shows up in the products list
    try {
      // Create a product from the NFT
      // Make sure to preserve the original image URL format (base64 or URL)
      const imageUrl = product.imageUrl.startsWith('data:')
        ? product.imageUrl  // Keep base64 image as is
        : newNft.imageUrl || product.imageUrl;

      const nftProduct: Product = {
        id: newNft.tokenId || `product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: newNft.name || "Purchased Product",
        description: newNft.description || "No description available",
        materials: ["Unknown"],
        artisanId: product.artisanId || "unknown",
        creationDate: new Date().toISOString(),
        imageUrl: imageUrl,
        price: product.price,
        isVerified: product.isVerified || false,
        isSold: true,
        ownerAddress: buyerAddress
      };

      // Get current products
      const storedProducts = localStorage.getItem('blockchain_products');
      let products: Product[] = [];

      if (storedProducts) {
        products = JSON.parse(storedProducts);
      }

      // Check if the product already exists
      const productExists = products.some((p: any) => p.id === nftProduct.id);

      if (!productExists) {
        // Add the product to the array
        products.push(nftProduct);

        // Save back to localStorage
        localStorage.setItem('blockchain_products', JSON.stringify(products));
        console.log("CRITICAL FIX: Added NFT as product to localStorage");
      }
    } catch (e) {
      console.error("CRITICAL FIX: Error adding NFT as product:", e);
    }

    // Verify the NFT was saved correctly
    const savedNfts = getLocalStorageData<Record<string, NFT[]>>('blockchain_user_nfts', {});
    console.log("Verified NFTs in localStorage:",
      savedNfts[buyerAddress.toLowerCase()] ? savedNfts[buyerAddress.toLowerCase()].length : 0);

    // Update product status using our new function
    const updateSuccess = updateProductPurchaseStatus(productId, buyerAddress);
    console.log("Updated product purchase status:", updateSuccess);

    if (updateSuccess) {
      // Update in-memory state
      currentProducts = getProductsFromStorage();
      console.log("Updated in-memory products after purchase");
    }

    if (currentProductProvenance[productId]) {
      currentProductProvenance[productId].history.push(
        { event: 'Sold', timestamp: new Date().toISOString(), actorAddress: buyerAddress, details: `Purchased by ${buyerAddress.substring(0,6)}... Tx: ${txHash.substring(0,10)}...` }
      );
    } else {
      currentProductProvenance[productId] = {
        productId: productId,
        history: [
          { event: 'Sold', timestamp: new Date().toISOString(), actorAddress: buyerAddress, details: `Purchased by ${buyerAddress.substring(0,6)}... Tx: ${txHash.substring(0,10)}...` }
        ]
      };
    }

    // Save updated provenance to localStorage
    saveLocalStorageData('blockchain_product_provenance', currentProductProvenance);

    // Log the NFT details for debugging
    console.log("NFT created:", {
      name: newNft.name,
      tokenId: newNft.tokenId,
      contractAddress: newNft.contractAddress,
      imageUrl: newNft.imageUrl,
      transactionHash: newNft.transactionHash
    });

    // Call watchAssetInWallet which now just shows a success message
    await watchAssetInWallet(newNft);

    toast({ title: "Purchase Successful!", description: `You now own ${product.name}. Tx: ${txHash.substring(0,10)}...` });
    return { success: true, transactionHash: txHash };

  } catch (error: any) {
    console.error("Error during simulated purchase transaction:", error);
    if (error.code === 4001) { // User rejected the transaction
      toast({ title: "Transaction Cancelled", description: "You cancelled the purchase transaction.", variant: "destructive" });
    } else {
      toast({ title: "Purchase Failed", description: error.message || "Could not complete the purchase.", variant: "destructive" });
    }
    return { success: false };
  }
};


export const getProductById = async (productId: string): Promise<Product | undefined> => {
  console.log("Getting product by ID:", productId);
  await simulateDelay(200);

  // Refresh from localStorage first using our direct storage function
  currentProducts = getProductsFromStorage();

  const product = currentProducts.find(p => p.id === productId);
  console.log("Found product:", product);

  return product;
};

export const getAllProducts = async (): Promise<Product[]> => {
  console.log("Getting all products");
  await simulateDelay(300);

  // Refresh from localStorage first using our direct storage function
  currentProducts = getProductsFromStorage();
  console.log("Retrieved products from localStorage:", currentProducts.length);

  // Return a mix of sold and unsold for demo purposes, or filter as needed
  return [...currentProducts].sort((a,b) => (a.isSold ? 1 : 0) - (b.isSold ? 1 : 0) || new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
};

export const getProductsByArtisan = async (artisanWallet: string): Promise<Product[]> => {
  console.log("getProductsByArtisan called with wallet:", artisanWallet);
  await simulateDelay(300);

  // Get artisan details
  const artisan = await getArtisanByWalletAddress(artisanWallet);

  if (!artisan) {
    console.log("No artisan found for wallet:", artisanWallet);

    // If no artisan is found, create one automatically
    const newArtisan: Artisan = {
      id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: "Auto-registered Artisan",
      bio: "Automatically registered artisan",
      walletAddress: artisanWallet,
      profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
    };

    // Add to in-memory array
    currentArtisans.push(newArtisan);

    // Save to localStorage
    saveLocalStorageData('blockchain_artisans', currentArtisans);
    console.log("Created new artisan:", newArtisan);

    // Return empty array since this is a new artisan with no products
    return [];
  }

  console.log("Found artisan:", artisan.name, "with ID:", artisan.id);

  // Get products for this artisan using our new function
  const artisanProducts = getArtisanProductsFromStorage(artisan.id);
  console.log("Found products for artisan:", artisanProducts.length);

  // Sort by creation date (newest first)
  return artisanProducts.sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
}

export const getProductProvenance = async (productId: string): Promise<ProductProvenance | null> => {
  console.log("Getting provenance for product:", productId);
  await simulateDelay(500);

  // Refresh from localStorage first
  currentProductProvenance = getLocalStorageData('blockchain_product_provenance', currentProductProvenance);

  const provenance = currentProductProvenance[productId] || null;
  console.log("Found provenance:", provenance);

  return provenance;
};

export const getUserNfts = async (userAddress: string): Promise<NFT[]> => {
  console.log("Getting NFTs for user:", userAddress);
  await simulateDelay(300);

  // Refresh from localStorage first
  currentUserNfts = getLocalStorageData('blockchain_user_nfts', currentUserNfts);

  // Log all user NFT collections for debugging
  console.log("All user NFT collections:", Object.keys(currentUserNfts));

  // Normalize the address to lowercase for consistent lookup
  const normalizedAddress = userAddress.toLowerCase();
  console.log("Looking for NFTs with normalized address:", normalizedAddress);

  // Check if we have NFTs for this user
  if (!currentUserNfts[normalizedAddress]) {
    console.log("No NFT collection found for this user, initializing empty array");
    currentUserNfts[normalizedAddress] = [];
    // Save the initialized empty array
    saveLocalStorageData('blockchain_user_nfts', currentUserNfts);
  }

  const nfts = currentUserNfts[normalizedAddress] || [];
  console.log("Found NFTs for user:", nfts.length);

  // Log each NFT for debugging
  if (nfts.length > 0) {
    nfts.forEach((nft, index) => {
      console.log(`NFT ${index + 1}:`, nft.name, "Token ID:", nft.tokenId);
    });
  }

  return JSON.parse(JSON.stringify(nfts)); // Return a deep copy to prevent mutation
};

export const watchAssetInWallet = async (nft: NFT): Promise<boolean> => {
  // Skip automatic addition to MetaMask due to compatibility issues
  // Instead, just show a success message
  console.log("Skipping automatic addition to MetaMask due to compatibility issues");
  console.log("NFT details:", {
    name: nft.name,
    tokenId: nft.tokenId,
    contractAddress: nft.contractAddress,
    imageUrl: nft.imageUrl,
    transactionHash: nft.transactionHash
  });

  // Show a success message
  toast({
    title: "NFT Created Successfully",
    description: `Your NFT for ${nft.name} has been created and can be viewed in the 'My NFTs' page.`,
    variant: "default"
  });

  // Return true to indicate success (even though we didn't actually add to MetaMask)
  // This prevents additional error messages in the calling code
  return true;
};


export const getArtisanDetails = async (artisanId: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return currentArtisans.find(a => a.id === artisanId);
};

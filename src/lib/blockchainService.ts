// This service simulates blockchain interactions.
// In a real DApp, this would use ethers.js or web3.js to interact with a smart contract.
"use client";

import type { Product, Artisan, ProductProvenance, NFT } from '@/types';
import { mockArtisans, mockProducts, mockProductProvenance, mockUserNfts } from './data';
import { toast } from '@/hooks/use-toast';

// Simulate a delay for blockchain operations
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const ETH_TO_WEI = BigInt("1000000000000000000"); // 10^18

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

// Function to directly get products from localStorage
const getProductsFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return mockProducts;

  try {
    // Use consistent key 'blockchain_products' for products
    const storedProducts = localStorage.getItem('blockchain_products');
    if (storedProducts) {
      console.log("Retrieved products from localStorage, count:", JSON.parse(storedProducts).length);
      return JSON.parse(storedProducts);
    }
  } catch (e) {
    console.error("Error getting products from localStorage:", e);
  }

  // Initialize with mock data if nothing in storage
  localStorage.setItem('blockchain_products', JSON.stringify(mockProducts));
  console.log("Initialized localStorage with mock products, count:", mockProducts.length);
  return mockProducts;
};

// Function to directly save products to localStorage
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
    const artisans = getLocalStorageData('blockchain_artisans', []);

    // Find the artisan by wallet address
    let artisan = artisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());

    // If artisan doesn't exist, create one
    if (!artisan) {
      artisan = {
        id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: "Auto-registered Artisan",
        bio: "Automatically registered artisan",
        walletAddress: artisanWallet,
        profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
      };

      artisans.push(artisan);
      saveLocalStorageData('blockchain_artisans', artisans);
      console.log("Created new artisan:", artisan);
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

const MOCK_PRODUCT_REGISTRY_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
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

  // Create a unique ID for the product
  const productId = `product-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  console.log("Generated product ID:", productId);

  // Create the product object
  const newProduct: Product = {
    ...productData,
    id: productId,
    creationDate: new Date().toISOString(),
    artisanId: "", // Will be set by directAddProductToArtisan
    isSold: false,
    ownerAddress: artisanWallet
  };

  console.log("Created product object, now using emergency direct add function");

  // EMERGENCY FIX: Use the direct function to add the product
  directAddProductToArtisan(newProduct, artisanWallet);

  // Also update the in-memory state
  currentProducts = getProductsFromStorage();
  currentArtisans = getLocalStorageData('blockchain_artisans', currentArtisans);

  // Find the artisan (should exist now)
  const artisan = currentArtisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());

  if (!artisan) {
    console.error("CRITICAL ERROR: Artisan not found after direct add");
    toast({ title: "Error", description: "Failed to create artisan. Please try again.", variant: "destructive" });
    return { success: false };
  }

  if (typeof window.ethereum === 'undefined') {
    console.log("MetaMask not found");
    toast({ title: "MetaMask Not Found", description: "Please install MetaMask to perform this action.", variant: "destructive" });
    return { success: false };
  }

  // Product should already be added by directAddProductToArtisan
  // Double-check that the product was saved correctly
  const savedProducts = getProductsFromStorage();
  const productExists = savedProducts.some(p => p.id === newProduct.id);
  console.log("Product exists in localStorage after direct add:", productExists);

  if (!productExists) {
    console.error("CRITICAL ERROR: Product not found in localStorage after direct add");
    toast({ title: "Error", description: "Failed to save product. Please try again.", variant: "destructive" });
    return { success: false };
  }

  // Verify that the product is associated with the artisan
  const artisanProducts = savedProducts.filter(p => p.artisanId === artisan.id);
  console.log(`Products associated with artisan ${artisan.id}:`, artisanProducts.length);

  // Log the details of the first few artisan products
  if (artisanProducts.length > 0) {
    console.log("Artisan products:", artisanProducts.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      artisanId: p.artisanId
    })));
  }

  // Set a flag in sessionStorage to indicate a product was just added
  // This will be used by the products page to force a refresh
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('product_just_added', 'true');
    sessionStorage.setItem('product_added_id', newProduct.id);
    console.log("Set product_just_added flag in sessionStorage");
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
};


export const updateProduct = async (productId: string, productData: Partial<Product>, artisanWallet: string): Promise<Product | null> => {
  await simulateDelay();
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

    // Verify the NFT was saved correctly
    const savedNfts = getLocalStorageData('blockchain_user_nfts', {});
    console.log("Verified NFTs in localStorage:",
      savedNfts[buyerAddress.toLowerCase()] ? savedNfts[buyerAddress.toLowerCase()].length : 0);

    // Update product status
    currentProducts[productIndex].isSold = true;
    currentProducts[productIndex].ownerAddress = buyerAddress;
    console.log("Updated product status to sold, new owner:", buyerAddress);

    // Save updated products to localStorage using our dedicated function
    saveProductsToStorage(currentProducts);
    console.log("Saved updated products to localStorage");

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

    // Automatically try to add the NFT to MetaMask
    try {
      toast({ title: "Adding NFT to MetaMask", description: "Attempting to add your new NFT to MetaMask..." });

      // Small delay to ensure the transaction is complete
      await simulateDelay(1000);

      // Create a short symbol (max 11 chars) for MetaMask
      let symbol = 'NFT';
      if (newNft.tokenId) {
        // Get a short version of the tokenId (max 7 chars)
        const shortId = newNft.tokenId.length > 7 ?
          newNft.tokenId.substring(0, 7) :
          newNft.tokenId;
        symbol = `NFT-${shortId}`;
      }

      // Make sure symbol is no longer than 11 characters total
      if (symbol.length > 11) {
        symbol = symbol.substring(0, 11);
      }

      console.log("Using symbol:", symbol, "for NFT:", newNft.name);

      // Try to add the NFT to MetaMask as an ERC20 token (more compatible with test networks)
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Using ERC20 instead of ERC721 for better compatibility
          options: {
            address: newNft.contractAddress,
            symbol: symbol,
            decimals: 0,
            image: newNft.imageUrl,
            name: newNft.name,
          },
        },
      });

      if (wasAdded) {
        toast({ title: "NFT Added to MetaMask", description: `${newNft.name} has been added to your MetaMask wallet.` });
      } else {
        toast({
          title: "NFT Not Added",
          description: "The NFT was not added to MetaMask. You can try adding it manually from the 'My NFTs' page.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error adding NFT to MetaMask:", error);
      toast({
        title: "NFT Not Added",
        description: "Could not add the NFT to MetaMask automatically. You can try adding it manually from the 'My NFTs' page.",
        variant: "default"
      });
    }

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
  console.log("EMERGENCY FIX: getProductsByArtisan called with wallet:", artisanWallet);

  // First check if we have emergency backup data
  let products: Product[] = [];
  let artisans: Artisan[] = [];

  try {
    // Try to get data from emergency backup first
    const emergencyProducts = localStorage.getItem('emergency_products');
    const emergencyArtisans = localStorage.getItem('emergency_artisans');

    if (emergencyProducts && emergencyArtisans) {
      products = JSON.parse(emergencyProducts);
      artisans = JSON.parse(emergencyArtisans);
      console.log("EMERGENCY FIX: Using emergency backup data");
    } else {
      // Fall back to normal storage
      products = getProductsFromStorage();
      artisans = getLocalStorageData('blockchain_artisans', []);
      console.log("EMERGENCY FIX: Using normal storage data");
    }
  } catch (e) {
    console.error("EMERGENCY FIX: Error getting data:", e);
    // Fall back to normal storage
    products = getProductsFromStorage();
    artisans = getLocalStorageData('blockchain_artisans', []);
  }

  console.log("EMERGENCY FIX: Total products:", products.length);
  console.log("EMERGENCY FIX: Total artisans:", artisans.length);

  // Find the artisan by wallet address
  let artisan = artisans.find(a => a.walletAddress.toLowerCase() === artisanWallet.toLowerCase());

  if (!artisan) {
    console.log("EMERGENCY FIX: No artisan found for wallet:", artisanWallet);

    // If no artisan is found, create one automatically
    const newArtisan: Artisan = {
      id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: "Auto-registered Artisan",
      bio: "Automatically registered artisan",
      walletAddress: artisanWallet,
      profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
    };

    // Add to both arrays
    artisans.push(newArtisan);
    currentArtisans.push(newArtisan);

    // Save to both storages
    saveLocalStorageData('blockchain_artisans', artisans);
    localStorage.setItem('emergency_artisans', JSON.stringify(artisans));

    console.log("EMERGENCY FIX: Created new artisan:", newArtisan);

    artisan = newArtisan;
  }

  console.log("EMERGENCY FIX: Found artisan:", artisan);

  // Get products for this artisan
  const artisanProducts = products.filter(p => p.artisanId === artisan.id);
  console.log("EMERGENCY FIX: Found products for artisan:", artisanProducts.length);

  // Log the artisan ID we're filtering by
  console.log("EMERGENCY FIX: Filtering products by artisanId:", artisan.id);

  // Log all products with their artisanId for debugging
  console.log("EMERGENCY FIX: All products with artisanIds:", products.map(p => ({
    id: p.id,
    name: p.name,
    artisanId: p.artisanId
  })));

  // Also update the in-memory state
  currentProducts = products;
  currentArtisans = artisans;

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
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    try {
      await simulateDelay(500); // Keep a small delay

      // First, make sure we're on the Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia testnet

      if (chainId !== SEPOLIA_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Please switch to the Sepolia test network in MetaMask to add this NFT.",
          variant: "destructive"
        });

        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });

          // Wait a moment for the network switch to complete
          await simulateDelay(1000);
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: 'Sepolia Test Network',
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    nativeCurrency: {
                      name: 'SepoliaETH',
                      symbol: 'SEP',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });

              // Wait a moment for the network addition to complete
              await simulateDelay(1000);
            } catch (addError) {
              console.error("Failed to add Sepolia network:", addError);
              toast({
                title: "Network Error",
                description: "Failed to add Sepolia network to MetaMask.",
                variant: "destructive"
              });
              return false;
            }
          } else {
            console.error("Failed to switch to Sepolia network:", switchError);
            toast({
              title: "Network Error",
              description: "Failed to switch to Sepolia network.",
              variant: "destructive"
            });
            return false;
          }
        }
      }

      // For NFTs, MetaMask expects a numeric tokenId
      // If the tokenId is already numeric, use it directly
      // Otherwise, extract numeric part or use a simple number
      let tokenId = nft.tokenId;

      // If the tokenId is not already a number, try to extract a numeric part
      if (isNaN(Number(tokenId))) {
        const match = tokenId.match(/\d+/);
        if (match) {
          tokenId = match[0]; // Use the first numeric part found
        } else {
          // If no numeric part, use a simple number (1)
          tokenId = "1";
        }
      }

      console.log("Using tokenId:", tokenId, "for NFT:", nft.name);

      // Create a short symbol (max 11 chars) for MetaMask
      let symbol = 'NFT';
      if (tokenId) {
        // Get a short version of the tokenId (max 7 chars)
        const shortId = tokenId.length > 7 ?
          tokenId.substring(0, 7) :
          tokenId;
        symbol = `NFT-${shortId}`;
      }

      // Make sure symbol is no longer than 11 characters total
      if (symbol.length > 11) {
        symbol = symbol.substring(0, 11);
      }

      console.log("Using symbol:", symbol, "for NFT:", nft.name);

      // Use ERC20 token type instead of ERC721 for better compatibility with test networks
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Using ERC20 instead of ERC721 for better compatibility
          options: {
            address: nft.contractAddress,
            symbol: symbol,
            decimals: 0,
            image: nft.imageUrl,
            name: nft.name,
          },
        },
      });

      if (wasAdded) {
        toast({ title: "NFT Added to Wallet", description: `${nft.name} should now be visible in your MetaMask wallet.` });
        return true;
      } else {
        // This else block might not always be hit if the user cancels, as it might throw an error instead.
        toast({ title: "NFT Not Added", description: "Could not add the NFT to your wallet. The request may have been cancelled or failed.", variant: "default" });
        return false;
      }
    } catch (error: any) {
      console.error('Error watching asset (raw):', error);

      let toastTitle = "Failed to Add NFT";
      let toastDescription = "An unknown error occurred while trying to add the NFT to your wallet.";

      if (error && typeof error === 'object') {
        if (error.code === 4001) { // User rejected the request
          toastTitle = "Request Cancelled";
          toastDescription = "You cancelled the request to add the NFT to your wallet.";
        } else if (error.message && typeof error.message === 'string' && error.message.trim() !== '') {
          // Use the error message if available and not empty
          toastDescription = error.message;
        } else if (Object.keys(error).length === 0 && error.constructor === Object) {
          // Handle cases where error is an empty object {}
          toastDescription = "The wallet provider returned an unspecified error. This can happen if the token ID format is not supported or if the asset is already being watched.";
        } else {
          // Try to stringify other object errors, but be cautious
          try {
            const errStr = JSON.stringify(error);
            if (errStr !== '{}') { // Avoid just "{}"
                 toastDescription = `An unexpected error occurred: ${errStr.substring(0, 100)}${errStr.length > 100 ? '...' : ''}`;
            } else {
                 toastDescription = "The wallet provider returned an unspecified error object. Please try again.";
            }
          } catch (e) {
            // Fallback if stringification fails
            toastDescription = "A non-descript error object was returned by the wallet provider. Please try again.";
          }
        }
      } else if (typeof error === 'string' && error.trim() !== '') {
        // Handle plain string errors
        toastDescription = error;
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "destructive"
      });
      return false;
    }
  } else {
     toast({ title: "MetaMask Not Found", description: "Please install and activate MetaMask to use this feature.", variant: "destructive" });
    return false;
  }
};


export const getArtisanDetails = async (artisanId: string): Promise<Artisan | undefined> => {
  await simulateDelay(100);
  return currentArtisans.find(a => a.id === artisanId);
};

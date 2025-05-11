import { toast } from "@/hooks/use-toast";
import { mockProducts } from "./data";
import type { Product, Artisan } from "@/types";

/**
 * Clears the product list from localStorage and initializes it with an empty array
 */
export const clearProductList = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Remove all product-related keys
    localStorage.removeItem('blockchain_products');
    localStorage.removeItem('emergency_products');
    localStorage.removeItem('products_data');
    localStorage.removeItem('products');
    localStorage.removeItem('cached_products');
    localStorage.removeItem('cached_products_timestamp');

    // Initialize with empty array
    localStorage.setItem('blockchain_products', JSON.stringify([]));

    console.log("Product list cleared from localStorage");
    toast({
      title: "Products Cleared",
      description: "All products have been removed from the system."
    });
  } catch (e) {
    console.error("Error clearing product list from localStorage:", e);
    toast({
      title: "Error",
      description: "Failed to clear product list.",
      variant: "destructive"
    });
  }
};

/**
 * Adds a product to the localStorage for a specific artisan
 */
export const addProductForArtisan = (
  productData: Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress' | 'artisanId'>,
  artisanId: string,
  artisanWallet: string
): Product => {
  if (typeof window === 'undefined') throw new Error("Cannot add product: window is undefined");

  // Ensure materials is an array for consistency
  if (productData.materials && !Array.isArray(productData.materials)) {
    console.log("Converting materials to array in addProductForArtisan:", productData.materials);
    productData.materials = [productData.materials];
  }

  // Create a unique ID for the product
  const productId = `product-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // Create the product object
  const newProduct: Product = {
    ...productData,
    id: productId,
    creationDate: new Date().toISOString(),
    artisanId: artisanId,
    isSold: false,
    ownerAddress: artisanWallet
  };

  try {
    // Get current products
    const storedProducts = localStorage.getItem('blockchain_products');
    const products: Product[] = storedProducts ? JSON.parse(storedProducts) : [];

    // Add new product
    products.push(newProduct);

    // Save back to localStorage
    localStorage.setItem('blockchain_products', JSON.stringify(products));
    console.log("Product added to localStorage:", newProduct);

    return newProduct;
  } catch (e) {
    console.error("Error adding product to localStorage:", e);
    throw new Error("Failed to add product to localStorage");
  }
};

/**
 * Gets all products from localStorage
 */
export const getAllProductsFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedProducts = localStorage.getItem('blockchain_products');
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }
  } catch (e) {
    console.error("Error getting products from localStorage:", e);
  }

  return [];
};

/**
 * Gets products for a specific artisan from localStorage
 */
export const getArtisanProductsFromStorage = (artisanId: string): Product[] => {
  const allProducts = getAllProductsFromStorage();
  return allProducts.filter(product => product.artisanId === artisanId);
};

/**
 * Updates the product purchase status
 */
export const updateProductPurchaseStatus = (
  productId: string,
  buyerAddress: string
): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const storedProducts = localStorage.getItem('blockchain_products');
    if (!storedProducts) return false;

    const products: Product[] = JSON.parse(storedProducts);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) return false;

    // Update product status
    products[productIndex].isSold = true;
    products[productIndex].ownerAddress = buyerAddress;

    // Save back to localStorage
    localStorage.setItem('blockchain_products', JSON.stringify(products));
    console.log("Product purchase status updated:", products[productIndex]);

    return true;
  } catch (e) {
    console.error("Error updating product purchase status:", e);
    return false;
  }
};

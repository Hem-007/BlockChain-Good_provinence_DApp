"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { getProductsByArtisan, removeProduct as blockchainRemoveProduct } from '@/lib/blockchainService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Trash2, PlusCircle, PackageSearch, Loader2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Use AlertTitle from ui/alert


export default function ArtisanProductsPage() {
  const { account, artisanProfile, isLoading: walletLoading } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justAddedProduct, setJustAddedProduct] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchArtisanProducts = async () => {
    if (account) {
      setIsLoadingProducts(true);
      setError(null);
      try {
        console.log("Fetching products for account:", account);
        const fetchedProducts = await getProductsByArtisan(account);
        console.log("Fetched products:", fetchedProducts);
        setProducts(fetchedProducts);
      } catch (e) {
        console.error("Error fetching products:", e);
        setError("Failed to load your products.");
      } finally {
        setIsLoadingProducts(false);
      }
    } else {
      console.log("No account available to fetch products");
    }
  };

  // EMERGENCY FIX: Function to force clear localStorage and reload
  const forceResetAndReload = () => {
    if (typeof window !== 'undefined') {
      // Keep a backup of the data
      const products = localStorage.getItem('blockchain_products');
      const artisans = localStorage.getItem('blockchain_artisans');

      // Save to emergency backup
      if (products) localStorage.setItem('emergency_products', products);
      if (artisans) localStorage.setItem('emergency_artisans', artisans);

      toast({
        title: "Emergency Reset",
        description: "Forcing data reload. Please wait...",
      });

      // Force reload the page
      window.location.reload();
    }
  };

  useEffect(() => {
    console.log("EMERGENCY FIX: Dashboard products page - wallet state:", { account, artisanProfile, walletLoading });

    // Check if we just added a product (from sessionStorage)
    const productJustAdded = typeof window !== 'undefined' && sessionStorage.getItem('product_just_added') === 'true';
    const productAddedId = typeof window !== 'undefined' && sessionStorage.getItem('product_added_id');

    if (productJustAdded && productAddedId) {
      console.log("EMERGENCY FIX: Product was just added with ID:", productAddedId);
      // Set the state to show a notification
      setJustAddedProduct(productAddedId);
      // Clear the flag so we don't keep refreshing
      sessionStorage.removeItem('product_just_added');

      // Show a toast notification
      toast({
        title: "Product Added Successfully",
        description: "Your new product has been added to the marketplace.",
        variant: "default"
      });
    }

    if (!walletLoading && account) {
      console.log("EMERGENCY FIX: Wallet connected, fetching products");

      // EMERGENCY FIX: Force multiple refreshes with delays
      fetchArtisanProducts(); // Immediate fetch

      // Schedule multiple fetches with increasing delays
      const delays = [500, 1000, 2000, 3000, 5000];
      delays.forEach(delay => {
        setTimeout(() => {
          console.log(`EMERGENCY FIX: Fetching products after ${delay}ms delay`);
          fetchArtisanProducts();
        }, delay);
      });
    } else if (!walletLoading && !account) {
      console.log("Wallet not connected");
      setIsLoadingProducts(false);
    }

    // Add a refresh interval to periodically check for new products
    const intervalId = setInterval(() => {
      if (account) {
        console.log("EMERGENCY FIX: Refreshing products list");
        fetchArtisanProducts();
      }
    }, 2000); // Refresh every 2 seconds (more frequent for emergency fix)

    // Also refresh when the URL changes (e.g., when redirected from add product page)
    const handleRouteChange = () => {
      if (account) {
        console.log("URL changed, refreshing products");
        fetchArtisanProducts();
      }
    };

    // Listen for URL changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      clearInterval(intervalId); // Clean up interval
      window.removeEventListener('popstate', handleRouteChange); // Clean up event listener
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, walletLoading]);

  const handleRemoveProduct = async (productId: string) => {
    if (!account) return;
    const originalProducts = [...products];
    setProducts(products.filter(p => p.id !== productId)); // Optimistic update

    const success = await blockchainRemoveProduct(productId, account);
    if (success) {
      toast({ title: "Product Removed", description: "The product has been successfully removed (simulated)." });
      fetchArtisanProducts(); // Re-fetch to confirm
    } else {
      toast({ title: "Error", description: "Failed to remove product (simulated).", variant: "destructive" });
      setProducts(originalProducts); // Revert optimistic update
    }
  };

  if (walletLoading || isLoadingProducts) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Products</h1>
          <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</Button>
        </div>
        <Card><CardContent className="p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></CardContent></Card>
      </div>
    );
  }

  if (error) {
     return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* EMERGENCY FIX: Add emergency notification */}
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-1 rounded-full mr-2">
            <Info className="h-4 w-4 text-yellow-600" />
          </div>
          <AlertDescription className="font-medium">
            If your products don't appear, please try the "Force Reset" button. We've implemented an emergency fix to ensure your products are saved correctly.
          </AlertDescription>
        </div>
      </Alert>

      {justAddedProduct && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <div className="flex items-center">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <PlusCircle className="h-4 w-4 text-green-600" />
            </div>
            <AlertDescription className="font-medium">
              Your product was successfully added to the marketplace!
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">My Products</h1>
            <p className="text-muted-foreground">Manage your listed artisanal items.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsLoadingProducts(true);
              fetchArtisanProducts().finally(() => setIsLoadingProducts(false));
            }}
            title="Refresh product list"
          >
            <RefreshCw size={18} className={isLoadingProducts ? "animate-spin" : ""} />
          </Button>

          {/* EMERGENCY FIX: Add emergency reset button */}
          <Button
            variant="destructive"
            onClick={forceResetAndReload}
            title="Emergency reset - use if products don't appear"
          >
            <AlertCircle size={18} className="mr-2" /> Force Reset
          </Button>

          <Button asChild>
            <Link href="/dashboard/add-product">
              <PlusCircle size={18} className="mr-2" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="text-center py-12 shadow-sm">
          <CardHeader>
            <PackageSearch size={48} className="mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Products Listed Yet</CardTitle>
            <CardDescription className="text-muted-foreground">
              Start by adding your unique creations to the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/dashboard/add-product">
                <PlusCircle size={20} className="mr-2" /> Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Price (ETH)</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className={`hover:bg-muted/20 ${product.id === justAddedProduct ? 'bg-green-50' : ''}`}
                  >
                    <TableCell className="hidden sm:table-cell p-2">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={60}
                        height={40}
                        className="rounded-md object-cover aspect-[3/2]"
                        data-ai-hint="product thumbnail"
                      />
                    </TableCell>
                    <TableCell className="font-medium py-3 px-4">
                        <Link href={`/products/${product.id}`} className="hover:underline" title={product.name}>
                            {product.name.length > 40 ? product.name.substring(0,37) + '...' : product.name}
                        </Link>
                        {product.id === justAddedProduct && (
                          <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-200">
                            New
                          </Badge>
                        )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3 px-4">{product.price}</TableCell>
                    <TableCell className="hidden lg:table-cell py-3 px-4">
                      {product.isSold ? (
                        <Badge variant="outline" className="border-green-500 text-green-600">Sold</Badge>
                      ) : (
                        <Badge variant="secondary">Listed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 py-3 px-4">
                      <Button variant="ghost" size="icon" asChild title="Edit Product">
                        <Link href={`/dashboard/edit-product/${product.id}`}>
                          <Edit3 size={18} />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Remove Product">
                            <Trash2 size={18} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove the product
                              listing (simulated).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveProduct(product.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

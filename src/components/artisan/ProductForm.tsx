"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import type { Product } from '@/types';
import { useWallet } from "@/contexts/WalletContext";
import { addProduct, updateProduct as blockchainUpdateProduct } from "@/lib/contractService"; // Aliased to avoid name clash
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { isArtisanRegistered, registerArtisan } from "@/lib/contractService";

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
  materials: z.string().min(3, { message: "Materials must be at least 3 characters." }),
  imageUrl: z.union([
    z.string().url({ message: "Please enter a valid image URL (e.g., picsum.photos)." }),
    z.instanceof(File, { message: "Please upload a valid image file." }),
    z.null()
  ]).optional(),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }).min(0.00001, {message: "Price must be greater than 0."}),
  isVerified: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product; // For editing
}

export default function ProductForm({ product }: ProductFormProps) {
  const { account } = useWallet();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<'idle' | 'confirm_transaction' | 'processing' | 'success' | 'error'>('idle');
  const [isArtisan, setIsArtisan] = useState<boolean | null>(null);

  // Check if the connected wallet is registered as an artisan
  useEffect(() => {
    const checkArtisanStatus = async () => {
      if (account) {
        try {
          console.log("Checking if wallet is registered as artisan:", account);
          const registered = await isArtisanRegistered(account);
          console.log("Artisan registration status:", registered);
          setIsArtisan(registered);

          // If not registered, register automatically for demo purposes
          if (!registered) {
            console.log("Wallet not registered as artisan, registering now...");
            try {
              const result = await registerArtisan({
                name: "Demo Artisan",
                bio: "Automatically registered artisan for demo purposes",
                profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
              }, account);

              if (result.success) {
                console.log("Artisan registered successfully:", result);
                setIsArtisan(true);
                toast({ title: "Artisan Registered", description: "Your wallet has been registered as an artisan for demo purposes." });
              } else {
                console.error("Failed to register artisan:", result);
              }
            } catch (regError) {
              console.error("Error registering artisan:", regError);
            }
          }
        } catch (error) {
          console.error("Error checking artisan status:", error);
        }
      }
    };

    checkArtisanStatus();
  }, [account, toast]);

  const defaultValues: Partial<ProductFormValues> = product
    ? {
        name: product.name,
        description: product.description,
        materials: Array.isArray(product.materials) ? product.materials.join(', ') : '',
        imageUrl: product.imageUrl,
        price: product.price,
        isVerified: product.isVerified,
      }
    : {
        name: "",
        description: "",
        materials: "",
        imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`, // Default placeholder
        price: 0.01,
        isVerified: false,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ProductFormValues) {
    console.log("Form submitted with data:", data);
    console.log("Current account:", account);
    console.log("Is artisan:", isArtisan);

    if (!account) {
      toast({ title: "Error", description: "Wallet not connected or artisan not identified.", variant: "destructive" });
      return;
    }

    // Check if the user is registered as an artisan
    if (isArtisan === false) {
      toast({ title: "Not Registered", description: "You need to be registered as an artisan to add products. Registering automatically...", variant: "default" });
      try {
        const result = await registerArtisan({
          name: "Demo Artisan",
          bio: "Automatically registered artisan for demo purposes",
          profileImage: `https://picsum.photos/seed/${Date.now()}/200/200`
        }, account);

        if (!result.success) {
          toast({ title: "Registration Failed", description: "Could not register you as an artisan. Please try again.", variant: "destructive" });
          return;
        }

        setIsArtisan(true);
        toast({ title: "Registration Successful", description: "You have been registered as an artisan. Now adding your product..." });
      } catch (regError) {
        console.error("Error registering artisan:", regError);
        toast({ title: "Registration Error", description: "An error occurred while registering you as an artisan.", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStep('confirm_transaction');

    try {
      // Handle image upload if it's a File object
      let imageUrl = data.imageUrl;

      if (data.imageUrl instanceof File) {
        imageUrl = URL.createObjectURL(data.imageUrl);
        toast({ title: "Image Processing", description: "Simulating image upload..." });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (!data.imageUrl) {
        imageUrl = `https://picsum.photos/seed/${Date.now()}/600/400`;
      }

      if (product) {
        setSubmitStep('processing');

        // Convert materials string to array
        const materialsArray = data.materials.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        const updatedProductData: Partial<Product> = {
          name: data.name,
          description: data.description,
          materials: materialsArray,
          imageUrl: imageUrl as string,
          price: data.price,
          isVerified: data.isVerified
        };

        const result = await blockchainUpdateProduct(product.id, updatedProductData, account);

        if (result && result.success) {
          setSubmitStep('success');
          toast({ title: "Success", description: "Product updated successfully." });
          router.push("/dashboard/products");
          router.refresh();
        } else {
          setSubmitStep('error');
          toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
        }
      } else {
        // Convert materials string to array
        const materialsArray = data.materials.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        const newProductData = {
          name: data.name,
          description: data.description,
          materials: materialsArray,
          imageUrl: imageUrl as string,
          price: data.price,
          isVerified: data.isVerified || false,
        };

        console.log("Preparing to add product with data:", newProductData);

        try {
          setSubmitStep('confirm_transaction');
          const result = await addProduct(
            newProductData as Omit<Product, 'id' | 'creationDate' | 'isSold' | 'ownerAddress' | 'artisanId'>,
            account
          );

          if (result.success && result.product) {
            setSubmitStep('processing');
            toast({
              title: "Product Created",
              description: `Transaction submitted. Your product is being minted.`
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            setSubmitStep('success');
            toast({
              title: "Success",
              description: `Product "${result.product.name}" added successfully.`
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.href = `/dashboard/products?t=${Date.now()}`;
          } else {
            setSubmitStep('error');
            toast({
              title: "Error",
              description: "Failed to add product. Please try again.",
              variant: "destructive"
            });
          }
        } catch (innerError) {
          console.error("Error during product addition:", innerError);
          setSubmitStep('error');
          toast({
            title: "Error",
            description: "Failed to add product due to an unexpected error.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      setSubmitStep('error');
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getButtonText = () => {
    if (product) { // Editing
      if (isSubmitting) return 'Saving...';
      return 'Save Changes';
    }
    // Adding new product
    if (isSubmitting) {
      if (submitStep === 'confirm_transaction') return 'Confirm in Wallet...';
      if (submitStep === 'processing') return 'Minting Product...';
      return 'Adding...';
    }
    return 'Add Product & Mint NFT';
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          {product ? "Edit Product Details" : "List New Artisanal Product"}
        </CardTitle>
        <CardDescription>
            {product ? "Update the information for your existing product." : "Describe your unique creation and mint it as an NFT on the marketplace (simulated Sepolia transaction)."}
        </CardDescription>
        {isArtisan === false && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-800">
            <p className="text-sm font-medium">You are not registered as an artisan yet.</p>
            <p className="text-xs">Don't worry - you'll be automatically registered when you submit the form.</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Handcrafted Terracotta Vase" {...field} />
                  </FormControl>
                  <FormDescription>The official name of your artisanal product.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product in detail, its story, inspiration, and uniqueness."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials Used</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Terracotta Clay, Natural Dyes, Silk Thread" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of primary materials.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={(file) => {
                        if (file) {
                          field.onChange(file);
                        } else if (typeof field.value === 'string') {
                          // If removing a file but there was a URL before, revert to the URL
                          field.onChange(field.value);
                        } else {
                          // If removing and there was no URL, set to default placeholder
                          field.onChange(`https://picsum.photos/seed/${Date.now()}/600/400`);
                        }
                      }}
                      buttonText="Upload Product Image"
                      description="Drag and drop an image, or click to browse (max 5MB)"
                      className="h-[200px]"
                    />
                  </FormControl>
                  <FormDescription>Upload an image of your product or use a URL. If you don't have an image, a placeholder will be used.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (in ETH)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.00001" placeholder="0.05" {...field} />
                  </FormControl>
                  <FormDescription>Set the price for your product in ETH. This will be used for the Sepolia testnet transaction.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isVerified"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isVerified">
                      Mark as Verified Authentic
                    </FormLabel>
                    <FormDescription>
                      Check this if the product has undergone a special verification process (simulated). Verified items may gain more trust.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button
                type="submit"
                className="w-full h-12 text-md"
                disabled={isSubmitting || submitStep === 'success'}
            >
              {(isSubmitting) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {product ? <Save className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
              {getButtonText()}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


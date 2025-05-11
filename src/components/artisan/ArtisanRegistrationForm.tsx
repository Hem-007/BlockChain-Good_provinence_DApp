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
import { useWallet } from "@/contexts/WalletContext";
import { registerArtisan } from "@/lib/contractService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

const artisanFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(50),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }).max(500),
  profileImage: z.string().url({ message: "Please enter a valid image URL (e.g., from picsum.photos)." }).optional().or(z.literal('')),
});

type ArtisanFormValues = z.infer<typeof artisanFormSchema>;

export default function ArtisanRegistrationForm() {
  const { account, refreshArtisanProfile } = useWallet();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ArtisanFormValues>({
    resolver: zodResolver(artisanFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      profileImage: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: ArtisanFormValues) {
    if (!account) {
      toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Submitting artisan registration form");
      const artisanData = {
        name: data.name,
        bio: data.bio,
        profileImage: data.profileImage || `https://picsum.photos/seed/${encodeURIComponent(data.name)}/200/200`, // Default placeholder if empty
      };

      // Set local storage immediately for better UX
      const localStorageKey = `artisan_registered_${account.toLowerCase()}`;
      localStorage.setItem(localStorageKey, 'true');

      // Store artisan details in local storage
      const artisanDetails = {
        id: `artisan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: data.name,
        bio: data.bio,
        profileImage: data.profileImage || `https://picsum.photos/seed/${encodeURIComponent(data.name)}/200/200`,
        walletAddress: account
      };
      localStorage.setItem(`artisan_details_${account.toLowerCase()}`, JSON.stringify(artisanDetails));

      console.log("Set local storage for immediate feedback");

      // Call the registration function
      const result = await registerArtisan(artisanData, account);

      if (result.success) {
        console.log("Registration successful:", result);
        toast({ title: "Registration Successful", description: "You are now registered as an artisan!" });

        // Update the wallet context
        await refreshArtisanProfile();

        // Redirect to dashboard
        console.log("Redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.log("Registration failed:", result);
        // The registerArtisan function should handle its own error toasts
        localStorage.removeItem(localStorageKey);
        localStorage.removeItem(`artisan_details_${account.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Artisan registration error:", error);
      toast({ title: "Error", description: "An unexpected error occurred during registration.", variant: "destructive" });

      // Clean up local storage on error
      localStorage.removeItem(`artisan_registered_${account.toLowerCase()}`);
      localStorage.removeItem(`artisan_details_${account.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader className="text-center">
        <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">Become an Artisan</CardTitle>
        <CardDescription className="text-muted-foreground">
          Join our community of talented artisans. Share your craft with the world.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name / Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chennai Crafts Collective" {...field} />
                  </FormControl>
                  <FormDescription>This name will be displayed publicly.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your craft, passion, and experience."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A brief introduction for your artisan profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/your-photo.jpg" {...field} />
                  </FormControl>
                  <FormDescription>A link to your profile picture. If left blank, a placeholder will be used. Use picsum.photos for testing.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Registering..." : "Register as Artisan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

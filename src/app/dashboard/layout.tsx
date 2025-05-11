"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import DashboardSidebarNav from '@/components/layout/DashboardSidebarNav';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account, isArtisan, isLoading, refreshArtisanProfile } = useWallet();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      console.log("Dashboard layout - checking status:", { account, isArtisan, isLoading });

      // Only proceed if we're not already loading
      if (!isLoading) {
        if (!account) {
          console.log("No account connected, redirecting to home");
          router.replace('/');
        } else if (!isArtisan) {
          // Check local storage first for immediate feedback
          const localStorageKey = `artisan_registered_${account.toLowerCase()}`;
          const isRegisteredLocally = typeof window !== 'undefined' ?
            window.localStorage.getItem(localStorageKey) === 'true' :
            false;

          if (isRegisteredLocally) {
            console.log("Found local registration, refreshing artisan profile");
            // If registered in local storage, refresh the profile from blockchain
            // but only once to prevent continuous refreshing
            if (!window.localStorage.getItem('profile_refresh_in_progress')) {
              window.localStorage.setItem('profile_refresh_in_progress', 'true');
              await refreshArtisanProfile();
              window.localStorage.removeItem('profile_refresh_in_progress');
            }
          } else {
            console.log("Not an artisan, redirecting to home");
            router.replace('/');
          }
        }
      }
    };

    // Only run this effect once when the component mounts
    checkStatus();

    // This is a cleanup function that runs when the component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('profile_refresh_in_progress');
      }
    };
  }, [account, isArtisan, isLoading, router, refreshArtisanProfile]);

  // Check if we're registered in local storage for immediate feedback
  const isRegisteredLocally = account && typeof window !== 'undefined' ?
    window.localStorage.getItem(`artisan_registered_${account.toLowerCase()}`) === 'true' :
    false;

  if (isLoading || !account || (!isArtisan && !isRegisteredLocally)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verifying artisan status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--navbar-height,80px))]"> {/* Adjust height based on actual Navbar height */}
      <DashboardSidebarNav />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  );
}

// Add this to your globals.css or a style tag in this layout if needed
// :root { --navbar-height: 80px; /* Or your actual navbar height */ }
// This is usually better handled if Navbar height is consistent and known.
// For this example, assuming a rough height and that the main app layout's padding handles the top space.

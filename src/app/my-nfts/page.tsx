"use client";

import { useWallet } from '@/contexts/WalletContext';
import type { NFT } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Gem, ExternalLink, Info, ImageOff, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge'; // Ensure Badge is imported

export default function MyNftsPage() {
  const { account, userNfts, isLoading, connect, refreshNfts } = useWallet();

  if (isLoading && !account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your NFT collection...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
         <Gem size={64} className="text-primary opacity-50 mb-6" />
        <h1 className="text-2xl font-semibold mb-3">View Your NFTs</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Connect your wallet to see the unique artisanal NFTs you've collected.
          Each NFT represents an authentic piece from Chennai's finest artisans.
        </p>
        <Button onClick={connect} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (userNfts.length === 0) {
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
         <Gem size={64} className="text-primary opacity-50 mb-6" />
        <h1 className="text-2xl font-semibold mb-3">Your NFT Collection is Empty</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven't acquired any artisanal NFTs yet. Explore our marketplace to find unique, verifiable items.
        </p>
        <Button asChild size="lg">
          <Link href="/">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Gem size={30} className="mr-3" /> My NFT Collection
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshNfts()}
            disabled={isLoading}
            title="Refresh NFT collection"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
            Refresh
          </Button>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {userNfts.length} Item{userNfts.length === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle>Simulated NFTs</AlertTitle>
        <AlertDescription>
          This page displays your simulated NFT collection. Each NFT includes a transaction ID for verification. Due to MetaMask limitations, NFTs are not automatically added to your wallet.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userNfts.map((nft) => (
          <Card key={nft.tokenId} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="p-0 relative aspect-video">
              {nft.imageUrl ? (
                <Image
                  src={nft.imageUrl}
                  alt={nft.name}
                  fill
                  className="object-cover"
                  data-ai-hint="nft image"
                  unoptimized={nft.imageUrl?.startsWith('data:')} // Don't optimize base64 images
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageOff size={48} className="text-muted-foreground" />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold mb-1 truncate" title={nft.name}>{nft.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mb-1">Artisan: {nft.artisanName}</CardDescription>
              <p className="text-xs text-muted-foreground truncate mb-3" title={nft.description}>{nft.description}</p>
              <p className="text-xs text-muted-foreground">Token ID: <span className="font-mono break-all">{nft.tokenId}</span></p>
              <p className="text-xs text-muted-foreground">Contract: <span className="font-mono break-all">{nft.contractAddress.substring(0,6)}...{nft.contractAddress.substring(nft.contractAddress.length-4)}</span></p>
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Transaction Verification:</p>
                <div className="flex items-center">
                  <span className="text-xs font-mono text-muted-foreground truncate" title={nft.transactionHash || "No transaction hash available"}>
                    {nft.transactionHash
                      ? `${nft.transactionHash.substring(0,10)}...${nft.transactionHash.substring(nft.transactionHash.length-8)}`
                      : "Not available"
                    }
                  </span>
                  {nft.transactionHash && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1"
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${nft.transactionHash}`, '_blank')}
                      title="View transaction on Etherscan"
                    >
                      <ExternalLink size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

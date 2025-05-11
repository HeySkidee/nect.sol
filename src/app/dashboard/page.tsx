'use client';

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  FileIcon, 
  ImageIcon, 
  VideoIcon, 
  AudioWaveformIcon, 
  ArchiveIcon, 
  CodeIcon, 
  FileTextIcon, 
  Pencil 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product, AnalyticsData } from "@/types";

// Define the CategoryIcons object
const CategoryIcons = {
  IMAGE: ImageIcon,
  VIDEO: VideoIcon,
  AUDIO: AudioWaveformIcon,
  DOCUMENT: FileTextIcon,
  SOFTWARE: CodeIcon,
  ARCHIVE: ArchiveIcon,
  OTHER: FileIcon,
} as const;

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) return;
      
      try {
        const res = await fetch('/api/analytics/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            creatorPublicKey: publicKey.toString()
          })
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Please connect your wallet to view your dashboard</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Left Side - Products */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Your Products</h2>
        
        {/* Grid of Product Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Create Product Card */}
          <Link href="/create">
            <Card className="h-64 group cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="flex flex-col items-center justify-center h-full w-full">
                <div className="rounded-full bg-blue-100 p-4 mb-4 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300">
                  <PlusCircle className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-xl font-semibold text-gray-800 mb-2">Create Product</span>
                <span className="text-sm text-gray-500">Add a new digital product</span>
              </CardContent>
            </Card>
          </Link>

          {/* Product Cards */}
          {data.products.allProducts
            .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
            .map((product) => (
              <Card 
                key={product.id}
                className="h-64 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <div className="flex h-full">
                  {/* Left side - Image/Icon */}
                  <div className="w-1/3 border-r border-gray-100 relative">
                    {(product.bannerUrl || product.imageUrl) ? (
                      <img 
                        src={product.bannerUrl || product.imageUrl} 
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                        {(() => {
                          const Icon = CategoryIcons[product.category as keyof typeof CategoryIcons] || FileIcon;
                          return (
                            <>
                              <Icon className="h-12 w-12 text-gray-300 mb-2" />
                              <span className="text-xs text-gray-400 text-center break-all line-clamp-2">
                                {product.fileType}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right side - Content */}
                  <div className="w-2/3 p-4 flex flex-col">
                    <div className="mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/product/${product.id}/edit`);
                          }}
                          className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          {
                            'bg-green-100 text-green-700': product.visibility === 'PUBLIC',
                            'bg-yellow-100 text-yellow-700': product.visibility === 'PRIVATE',
                            'bg-blue-100 text-blue-700': product.visibility === 'UNLISTED'
                          }
                        )}>
                          {product.visibility.charAt(0) + product.visibility.slice(1).toLowerCase()}
                        </span>
                        {product.category && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{product.sales} sales</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(product.releaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Right Side - Analytics */}
      <div className="w-1/2 bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Analytics</h2>
        
        {/* Revenue and Sales */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data.revenue.total.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.sales.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Downloads and Customers */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.downloads.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.downloads.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Returning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.customers.returning}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-xl font-bold">${data.revenue.today.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sales</p>
              <p className="text-xl font-bold">{data.sales.today}</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.products.topSelling.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">#{index + 1}</span>
                    <Link 
                      href={`/product/${product.id}`}
                      className="font-medium hover:text-blue-800 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </div>
                  <span className="text-sm text-gray-600">{product.sales} sales</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
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
  Pencil,
  Github,
  Twitter,
  Youtube
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product, AnalyticsData } from "@/types";
import Image from "next/image";

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

const backgroundColors = [
  'from-[#f7fa3e] to-[#dbfa51]',
  'from-[#3ffd7e] to-[#00ff40]',
  'from-fuchsia-300 to-fuchsia-400',
  'from-[#EE2B69] to-[#FF6B6B]',
];

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
    <>
      <div className="w-[97%] mx-auto">
        <div className="bg-white rounded-3xl border-2 border-[#dddddd] overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)]">
            {/* Left Side - Products */}
            <div className="lg:w-1/2 p-8 overflow-y-auto">
              <h2 className="text-4xl font-bold mb-8">Your Products</h2>
              
              {/* Grid of Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {/* Create Product Card */}
                <Link href="/create">
                  <div className="bg-white border-[5px] border-black rounded-[22px] p-8 hover:shadow-[8px_8px_0px_0px_#EE2B69] transition-all h-full">
                    <div className="size-16 rounded-full bg-[#EE2B69] flex items-center justify-center mb-6">
                      <PlusCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold mb-2">Create Product</h3>
                    <p className="text-gray-600 text-2xl">Add a new digital product to your store</p>
                  </div>
                </Link>

                {/* Product Cards */}
                {data.products.allProducts
                  .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
                  .map((product, index) => (
                    <div 
                      key={product.id}
                      className="bg-white border-[5px] border-black rounded-[22px] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      {/* Product Image/Icon */}
                      <div className="aspect-[4/3] w-full relative">
                        {product.bannerUrl ? (
                          <img 
                            src={product.bannerUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${backgroundColors[index % backgroundColors.length]}`}>
                            {(() => {
                              const Icon = CategoryIcons[product.category as keyof typeof CategoryIcons] || FileIcon;
                              return (
                                <>
                                  <Icon className="h-20 w-20 text-black/80" />
                                  <span className="text-base text-black/80 mt-3 font-medium">{product.category}</span>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-3xl font-bold line-clamp-none mb-4">{product.name}</h3>

                        <div className="flex flex-wrap gap-2 mb-4 -ml-1">
                          <span className={cn(
                            "text-sm px-3 py-1.5 rounded-full font-bold uppercase",
                            {
                              'bg-green-100 text-green-700': product.visibility === 'PUBLIC',
                              'bg-yellow-100 text-yellow-700': product.visibility === 'PRIVATE',
                              'bg-blue-100 text-blue-700': product.visibility === 'UNLISTED'
                            }
                          )}>
                            {product.visibility.charAt(0) + product.visibility.slice(1).toLowerCase()}
                          </span>
                          <span className="text-sm px-3 py-1.5 rounded-full bg-[#f7fa3e] text-black font-medium">
                            {product.category}
                          </span>
                        </div>

                        <div className="flex items-end justify-between mt-auto">
                          <div className="space-y-1">
                            <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                            <p className="text-md text-gray-500">{product.sales} sales</p>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/product/${product.id}/edit`);
                              }}
                              className="cursor-pointer text-base font-bold px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-[#EE2B69] hover:text-white flex items-center gap-2 transition-all transform hover:scale-105 group"
                            >
                              <Pencil className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                              Edit
                            </button>
                            <div className="text-md text-gray-400">
                              {new Date(product.releaseDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right Side - Analytics */}
            <div className="lg:w-1/2 bg-gray-50 p-8 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#dddddd] h-full">
              <h2 className="text-4xl font-bold mb-6">Analytics</h2>
              
              {/* Revenue and Sales */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Total Revenue</h3>
                  <p className="text-4xl font-bold">${data.revenue.total.toFixed(2)}</p>
                </div>

                <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Total Sales</h3>
                  <p className="text-4xl font-bold">{data.sales.total}</p>
                </div>
              </div>

              {/* Downloads and Customers */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Downloads</h3>
                  <p className="text-3xl font-bold">{data.downloads.total}</p>
                </div>

                <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Pending</h3>
                  <p className="text-3xl font-bold">{data.downloads.pending}</p>
                </div>

                <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Returning</h3>
                  <p className="text-3xl font-bold">{data.customers.returning}</p>
                </div>
              </div>

              {/* Today's Performance */}
              <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all mb-6">
                <h3 className="text-2xl font-bold mb-6">Today's Performance</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-lg text-gray-600 mb-2">Revenue</p>
                    <p className="text-3xl font-bold">${data.revenue.today.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-lg text-gray-600 mb-2">Sales</p>
                    <p className="text-3xl font-bold">{data.sales.today}</p>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white border-[5px] border-black rounded-[22px] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h3 className="text-2xl font-bold mb-6">Top Products</h3>
                <div className="space-y-4">
                  {data.products.topSelling.slice(0, 3).map((product, index) => (
                    <Link 
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-xl font-medium group-hover:text-[#EE2B69] transition-colors">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-lg font-medium">{product.sales} sales</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white rounded-3xl border-2 border-[#dddddd] p-8 mb-8">
          <div className="flex flex-col gap-8">
            {/* CTA Section */}
            <div className="bg-[#f7fa3e] px-10 py-8 rounded-3xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-4">
                  <h2 className="text-5xl font-bold text-black">Start Shopping Now</h2>
                  <p className="text-black/80 text-xl max-w-2xl">
                    Experience the future of digital commerce on Solana
                    <br />
                    secure, decentralized, and fee-free transactions for creators and buyers.
                  </p>
                  <Link href="/marketplace">
                    <button className="bg-black text-white px-8 py-4 rounded-[10px] font-medium text-2xl cursor-pointer hover:bg-fuchsia-300 hover:text-black transition-colors">
                      Go to Marketplace
                    </button>
                  </Link>
                </div>
                <div className="w-full max-w-xs">
                  <div className="aspect-square rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Image 
                      src="/nect-logo.png" 
                      alt="NECT" 
                      width={500} 
                      height={500}
                      className="w-full h-auto" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Links and Social */}
         
          </div>
        </footer>
      </div>
    </>
  );
} 
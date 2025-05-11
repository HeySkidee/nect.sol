'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, ArchiveIcon, CodeIcon, FileTextIcon } from 'lucide-react';

const CategoryIcons = {
  IMAGE: ImageIcon,
  VIDEO: VideoIcon,
  AUDIO: AudioWaveformIcon,
  DOCUMENT: FileTextIcon,
  SOFTWARE: CodeIcon,
  ARCHIVE: ArchiveIcon,
  OTHER: FileIcon,
} as const;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  fileType: string;
  bannerUrl: string | null;
  category: keyof typeof CategoryIcons;
  creator: {
    publicKey: string;
  };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/public');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="flex gap-2">
          {/* Add filter/sort controls here if needed */}
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-full max-w-sm mx-auto space-y-4">
            <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No products available</h3>
              <p className="text-gray-500">Check back later for new products</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300"
              onClick={() => router.push(`/product/${product.id}`)}
            >
              <div className="aspect-video w-full relative overflow-hidden">
                {product.bannerUrl ? (
                  <img 
                    src={product.bannerUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    {(() => {
                      const Icon = CategoryIcons[product.category] || FileIcon;
                      return (
                        <>
                          <Icon className="h-12 w-12 text-gray-400" />
                          <span className="text-sm text-gray-500 mt-2">{product.category}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
                >
                  {product.category}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </CardContent>

              <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-800">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  {product.fileType}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
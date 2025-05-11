'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, ArchiveIcon, CodeIcon, FileTextIcon, Search, ShoppingBag, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

const backgroundColors = [
  'from-[#f7fa3e] to-[#dbfa51]',
  'from-fuchsia-300 to-fuchsia-200',
  'from-[#3ffd7e] to-[#00ff40]',
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const categories = ["ALL", ...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || activeCategory === "ALL" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="w-[97%] mx-auto my-6">
        <div className="bg-white p-8 rounded-3xl border-2 border-[#dddddd]">
          <h1 className="text-4xl font-bold mb-8">Marketplace</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border-[5px] border-black rounded-[22px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="aspect-[4/3] bg-gray-100 animate-pulse rounded-xl" />
                <div className="mt-4">
                  <div className="h-8 bg-gray-100 rounded-full w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-full mb-4 animate-pulse" />
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded-full w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[97%] mx-auto my-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#dddddd]">
        <div className="flex flex-col gap-6">
          {/* Header with search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-10 w-10 text-[#EE2B69]" />
              <h1 className="text-5xl font-bold">Marketplace</h1>
            </div>
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search digital goods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 pr-12 text-lg rounded-full border-2 border-[#dddddd] focus:outline-none focus:border-[#f7fa3e] transition-colors"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category === activeCategory ? null : category)}
                className={`px-6 py-2.5 rounded-full text-base font-medium transition-all ${
                  category === activeCategory
                    ? "bg-[#f7fa3e] text-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl">
              <div className="w-full max-w-sm mx-auto space-y-4">
                <FileIcon className="mx-auto h-16 w-16 text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">No products found</h3>
                  <p className="text-gray-500 text-lg">Try adjusting your search terms</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white border-[5px] border-black rounded-[22px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-[#EE2B69] hover:shadow-[8px_8px_0px_0px_#EE2B69] transition-all duration-500 hover:bg-white/90 cursor-pointer"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {/* Header with category */}
                  {/* <div className="mb-5">
                    <span className="text-base font-medium bg-[#f7fa3e] px-4 py-2 rounded-full group-hover:bg-white">
                      {product.category}
                    </span>
                  </div> */}

                  {/* Image Section */}
                  <div className="aspect-[4/3] w-full relative rounded-xl overflow-hidden">
                    {product.bannerUrl ? (
                      <img
                        src={product.bannerUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${backgroundColors[index % backgroundColors.length]}`}>
                        {(() => {
                          const Icon = CategoryIcons[product.category] || FileIcon;
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

                  {/* Content Section */}
                  <div className="mt-4">
                    <h2 className="text-3xl font-bold mb-2 line-clamp-1">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 text-xl mb-4 line-clamp-2">
                      {product.description || "No description available"}
                    </p>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="px-5 py-2.5 rounded-full bg-[#f7fa3e] text-black font-medium text-base">
                      {product.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured section */}
          <div className="mt-8 bg-[#f7fa3e] px-10 py-8 rounded-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-black">Sell Your Digital Goods</h2>
                <p className="text-black/80 text-xl max-w-xl">
                  No platform fees. No middlemen. Just pure value exchange!
                </p>
                <Link href="/create">
                  <button className="bg-black text-white px-8 py-4 rounded-[10px] font-medium text-2xl cursor-pointer hover:bg-fuchsia-300 hover:text-black transition-colors">
                    Start Selling
                  </button>
                </Link>
              </div>
              <div className="w-full max-w-xs">
                <div className="aspect-square rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <Image src="/nect-logo.png" alt="Sell" width={500} height={500} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
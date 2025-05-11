'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import toast from 'react-hot-toast';
import FileUpload from '@/components/FileUpload';

type FileCategory = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'SOFTWARE' | 'ARCHIVE' | 'OTHER';
type Visibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
type UploadType = 'CENTRALIZED' | 'DECENTRALIZED';

// FileUpload component props type
interface FileUploadProps {
  endpoint: string;
  value: string;
  category: FileCategory;
  onChange: (url: string, fileType?: string) => void;
}

// Helper function to detect file category
const detectFileCategory = (fileType: string): FileCategory => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoTypes = ['mp4', 'webm', 'avi', 'mov'];
  const audioTypes = ['mp3', 'wav', 'ogg'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt'];
  const softwareTypes = ['exe', 'dmg', 'app'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar'];

  const type = fileType.toLowerCase().replace('.', '');

  if (imageTypes.includes(type)) return 'IMAGE';
  if (videoTypes.includes(type)) return 'VIDEO';
  if (audioTypes.includes(type)) return 'AUDIO';
  if (documentTypes.includes(type)) return 'DOCUMENT';
  if (softwareTypes.includes(type)) return 'SOFTWARE';
  if (archiveTypes.includes(type)) return 'ARCHIVE';
  return 'OTHER';
};

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  fileUrl: string;
  fileType: string;
  bannerUrl: string | null;
  category: FileCategory;
  visibility: Visibility;
  isUnlimitedStock: boolean;
  stockQuantity: number | null;
  oneTimeDownload: boolean;
  uploadType: UploadType;
  creator: {
    publicKey: string;
  };
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isUnlimitedStock: true,
    stockQuantity: null as number | null,
    category: 'OTHER' as FileCategory,
    visibility: 'PUBLIC' as Visibility,
    oneTimeDownload: true,
    uploadType: 'CENTRALIZED' as UploadType,
    fileUrl: '',
    bannerUrl: '',
    fileType: ''
  });

  // Fetch SOL price
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then(res => res.json())
      .then(data => setSolPrice(data.solana.usd))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        
        // Initialize form data with product data
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          isUnlimitedStock: data.isUnlimitedStock,
          stockQuantity: data.stockQuantity,
          category: data.category,
          visibility: data.visibility,
          oneTimeDownload: data.oneTimeDownload,
          uploadType: data.uploadType,
          fileUrl: data.fileUrl,
          bannerUrl: data.bannerUrl || '',
          fileType: data.fileType
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Check if user is the owner
  useEffect(() => {
    if (product && publicKey && product.creator.publicKey !== publicKey.toString()) {
      toast.error('You are not authorized to edit this product');
      router.push(`/product/${id}`);
    }
  }, [product, publicKey, router, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      toast.error('Please upload a file first');
      return;
    }

    try {
      const response = await fetch(`/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockQuantity: formData.isUnlimitedStock ? null : formData.stockQuantity
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      router.push(`/product/${id}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Please connect your wallet first</h1>
        <WalletMultiButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-lg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (optional)</label>
          <textarea
            className="w-full p-2 border rounded-lg min-h-[200px]"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Banner Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Banner Image (optional)
            <span className="text-gray-500 text-xs ml-2">Recommended size: 1200x630px</span>
          </label>
          <FileUpload
            endpoint="mediaUploader"
            value={formData.bannerUrl}
            category="IMAGE"
            onChange={(url) => {
              setFormData(prev => ({
                ...prev,
                bannerUrl: url
              }));
            }}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Product File *</label>
          <FileUpload
            endpoint="mediaUploader"
            value={formData.fileUrl}
            category={formData.category}
            onChange={(url, fileType) => {
              const category = detectFileCategory(fileType);
              setFormData(prev => ({
                ...prev,
                fileUrl: url,
                fileType,
                category
              }));
            }}
          />
          {formData.fileUrl && (
            <p className="text-sm text-green-600 mt-2">
              Current file: {formData.fileType} file
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Price (USD) *</label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            className="w-full p-2 border rounded-lg"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Enter price in USD"
          />
          {solPrice && formData.price && (
            <div className="mt-2 text-sm text-gray-600">
              ≈ {(Number(formData.price) / solPrice).toFixed(4)} SOL
            </div>
          )}
        </div>

        {/* Stock Management */}
        <div>
          <label className="block text-sm font-medium mb-2">Stock</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isUnlimitedStock}
                onChange={() => setFormData({
                  ...formData,
                  isUnlimitedStock: true,
                  stockQuantity: null
                })}
                className="rounded"
              />
              <span>Unlimited</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!formData.isUnlimitedStock}
                  onChange={() => setFormData({
                    ...formData,
                    isUnlimitedStock: false,
                    stockQuantity: formData.stockQuantity || 1
                  })}
                  className="rounded"
                />
                <span>Limited</span>
              </label>

              <input
                type="number"
                min="1"
                className={`w-24 p-2 border rounded-lg ml-2 ${formData.isUnlimitedStock ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                value={formData.isUnlimitedStock ? '' : (formData.stockQuantity ?? '')}
                onChange={(e) => setFormData({
                  ...formData,
                  stockQuantity: e.target.value ? parseInt(e.target.value) : null
                })}
                disabled={formData.isUnlimitedStock}
                placeholder="Quantity"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-2">Visibility</label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="public"
                name="visibility"
                value="PUBLIC"
                checked={formData.visibility === 'PUBLIC'}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Visibility })}
                className="w-4 h-4"
              />
              <label htmlFor="public" className="flex flex-col">
                <span className="font-medium">Public</span>
                <span className="text-sm text-gray-500">Your product will be visible to everyone and listed in the Marketplace</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="unlisted"
                name="visibility"
                value="UNLISTED"
                checked={formData.visibility === 'UNLISTED'}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Visibility })}
                className="w-4 h-4"
              />
              <label htmlFor="unlisted" className="flex flex-col">
                <span className="font-medium">Unlisted</span>
                <span className="text-sm text-gray-500">Your product won't appear in the marketplace but can be accessed by anyone with the link</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="private"
                name="visibility"
                value="PRIVATE"
                checked={formData.visibility === 'PRIVATE'}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Visibility })}
                className="w-4 h-4"
              />
              <label htmlFor="private" className="flex flex-col">
                <span className="font-medium">Private</span>
                <span className="text-sm text-gray-500">Your product won't be visible and the link won't work</span>
              </label>
            </div>
          </div>
        </div>

        {/* Upload Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="uploadType"
                value="CENTRALIZED"
                checked={formData.uploadType === 'CENTRALIZED'}
                onChange={(e) => setFormData({ ...formData, uploadType: e.target.value as UploadType })}
              />
              Centralized upload (faster)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="uploadType"
                value="DECENTRALIZED"
                checked={formData.uploadType === 'DECENTRALIZED'}
                onChange={(e) => setFormData({ ...formData, uploadType: e.target.value as UploadType })}
              />
              Decentralized upload (slower)
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 
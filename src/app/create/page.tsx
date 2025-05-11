'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import FileUpload from '@/components/FileUpload'; 
import { useRouter } from 'next/navigation';
import { 
  FileIcon, 
  ImageIcon, 
  VideoIcon, 
  AudioWaveformIcon, 
  ArchiveIcon, 
  CodeIcon, 
  FileTextIcon 
} from 'lucide-react';
import type { CreateProductFormData, FileCategory, UploadType, Visibility } from '@/types';

const CategoryIcons = {
  IMAGE: ImageIcon,
  VIDEO: VideoIcon,
  AUDIO: AudioWaveformIcon,
  DOCUMENT: FileTextIcon,
  SOFTWARE: CodeIcon,
  ARCHIVE: ArchiveIcon,
  OTHER: FileIcon,
} as const;

export default function Create() {
  const { connected } = useWallet();
  const [formData, setFormData] = useState<CreateProductFormData>({
    name: '',
    description: '',
    price: '',
    isUnlimitedStock: true,
    stockQuantity: null,
    fileType: '',
    category: 'OTHER',
    visibility: 'PUBLIC',
    oneTimeDownload: true,
    uploadType: 'CENTRALIZED',
    fileUrl: '',
    bannerUrl: '',
  });

  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error('Error fetching SOL price:', error);
      }
    };
    fetchSolPrice();
  }, []);

  const detectFileCategory = (fileType: string): FileCategory => {
    const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const videoTypes = ['.mp4', '.webm', '.avi', '.mov', '.mkv'];
    const audioTypes = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
    const documentTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md', '.epub'];
    const softwareTypes = ['.exe', '.dmg', '.app', '.apk', '.ipa'];
    const archiveTypes = ['.zip', '.rar', '.7z', '.tar', '.gz'];

    const type = fileType.toLowerCase();

    if (imageTypes.some(ext => type.endsWith(ext.replace('.', '')))) return 'IMAGE';
    if (videoTypes.some(ext => type.endsWith(ext.replace('.', '')))) return 'VIDEO';
    if (audioTypes.some(ext => type.endsWith(ext.replace('.', '')))) return 'AUDIO';
    if (documentTypes.some(ext => type.endsWith(ext.replace('.', '')))) return 'DOCUMENT';
    if (softwareTypes.some(ext => type.endsWith(ext.replace('.', '')))) return 'SOFTWARE';
    if (archiveTypes.some(ext => type.endsWith(ext.replace('.', '')))) return 'ARCHIVE';
    return 'OTHER';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      alert('Please upload a file first');
      return;
    }

    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const product = await response.json();
      router.push(`/product/${product.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Product</h1>

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
            onChange={(url: string) => {
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

          <FileUpload
            endpoint="mediaUploader"
            value={formData.fileUrl}
            category={formData.category}
            uploadType={formData.uploadType}
            onChange={(url: string, fileType: string) => {
              const category = detectFileCategory(fileType);
              setFormData(prev => ({
                ...prev,
                fileUrl: url,
                fileType,
                category
              }));
            }}
          />
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

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-2">Stock</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isUnlimited}
                onChange={() => {
                  setIsUnlimited(true);
                  setFormData({
                    ...formData,
                    isUnlimitedStock: true,
                    stockQuantity: null
                  });
                }}
                className="rounded"
              />
              <span>Unlimited</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!isUnlimited}
                  onChange={() => {
                    setIsUnlimited(false);
                    setFormData({
                      ...formData,
                      isUnlimitedStock: false,
                      stockQuantity: 1
                    });
                  }}
                  className="rounded"
                />
                <span>Limited</span>
              </label>

              <input
                type="number"
                min="1"
                className={`w-24 p-2 border rounded-lg ml-2 ${isUnlimited ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                value={isUnlimited ? '' : (formData.stockQuantity ?? '')}
                onChange={(e) => setFormData({
                  ...formData,
                  stockQuantity: e.target.value ? parseInt(e.target.value) : null
                })}
                disabled={isUnlimited}
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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Product
        </button>
      </form>
    </div>
  );
} 
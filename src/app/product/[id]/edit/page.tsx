'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  FileIcon,
  ImageIcon,
  VideoIcon,
  AudioWaveformIcon,
  ArchiveIcon,
  CodeIcon,
  FileTextIcon,
  Loader2,
  Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreatePageFileUpload from '@/components/CreatePageFileUpload';
import type { FileCategory, Visibility, UploadType } from '@/types';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
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

    if (isBannerUploading) {
      toast.error('Please wait for banner image to finish uploading');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockQuantity: formData.isUnlimitedStock ? null : formData.stockQuantity,
          fileUrl: formData.fileUrl,
          fileType: formData.fileType
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All your changes will be lost.')) {
      router.back();
    }
  };

  const resetFileUpload = () => {
    setFormData(prev => ({
      ...prev,
      fileUrl: '',
      fileType: '',
      category: 'OTHER'
    }));
  };

  const resetBannerUpload = () => {
    setFormData(prev => ({
      ...prev,
      bannerUrl: ''
    }));
  };

  const handleFileUpload = (url: string, fileType?: string, fileName?: string) => {
    if (!url) {
      resetFileUpload();
      return;
    }

    // Extract file extension from fileName or URL if fileType is not provided
    let detectedFileType = fileType;
    if (!detectedFileType && fileName) {
      detectedFileType = fileName.split('.').pop() || '';
    } else if (!detectedFileType) {
      detectedFileType = url.split('.').pop()?.split('?')[0] || '';
    }

    const category = detectFileCategory(detectedFileType);
    
    setFormData(prev => ({
      ...prev,
      fileUrl: url,
      fileType: detectedFileType,
      category
    }));
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
    <div className="w-[97%] mx-auto my-10">
      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#dddddd]">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-[#EE2B69] rounded-3xl p-14 text-center text-white">
            <h1 className="text-5xl font-black tracking-tight mb-4">
              Update Your Product Details
            </h1>
          </div>

          {/* Form */}
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white border-[5px] border-black rounded-[22px] p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-xl font-bold mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-4 border-2 border-black rounded-2xl text-lg focus:outline-none focus:border-[#EE2B69]"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xl font-bold mb-2">Description (optional)</label>
                  <textarea
                    className="w-full p-4 border-2 border-black rounded-2xl text-lg min-h-[200px] focus:outline-none focus:border-[#EE2B69]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Banner Image Upload */}
                <div>
                  <label className="block text-xl font-bold mb-2">
                    Banner Image (optional)
                    <span className="text-gray-500 text-base ml-2">Recommended size: 1200x630px</span>
                  </label>
                  <CreatePageFileUpload
                    endpoint="imageUploader"
                    value={formData.bannerUrl}
                    category="IMAGE"
                    onChange={(url) => {
                      if (!url) {
                        resetBannerUpload();
                        return;
                      }
                      setFormData(prev => ({
                        ...prev,
                        bannerUrl: url
                      }));
                    }}
                    onBeginUpload={() => {
                      setIsBannerUploading(true);
                    }}
                    onUploadError={(error) => {
                      setIsBannerUploading(false);
                      if (error.message.includes('100MB')) {
                        toast.error(error.message, {
                          duration: 4000,
                          position: 'top-center',
                          style: {
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontSize: '1.25rem',
                            padding: '24px 32px',
                            fontWeight: '600',
                            minWidth: '400px',
                            textAlign: 'center',
                            borderRadius: '12px',
                            border: '2px solid #dc2626'
                          },
                          icon: '⚠️'
                        });
                      } else {
                        toast.error("Failed to upload file. Please try again.", {
                          style: {
                            fontSize: '1.125rem',
                            padding: '16px',
                          }
                        });
                      }
                    }}
                    onClientUploadComplete={() => {
                      setIsBannerUploading(false);
                    }}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xl font-bold mb-2">Product File *</label>
                  <CreatePageFileUpload
                    endpoint="mediaUploader"
                    value={formData.fileUrl}
                    category={formData.category}
                    onChange={handleFileUpload}
                    onUploadError={(error) => {
                      if (error.message.includes('100MB')) {
                        toast.error(error.message, {
                          duration: 4000,
                          position: 'top-center',
                          style: {
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontSize: '1.25rem',
                            padding: '24px 32px',
                            fontWeight: '600',
                            minWidth: '400px',
                            textAlign: 'center',
                            borderRadius: '12px',
                            border: '2px solid #dc2626'
                          },
                          icon: '⚠️'
                        });
                      } else {
                        toast.error("Failed to upload file. Please try again.", {
                          style: {
                            fontSize: '1.125rem',
                            padding: '16px',
                          }
                        });
                      }
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
                  <label className="block text-xl font-bold mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    className="w-full p-4 border-2 border-black rounded-2xl text-lg focus:outline-none focus:border-[#EE2B69]"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price in USD"
                  />
                  {solPrice && formData.price && (
                    <div className="mt-2 text-lg text-gray-600">
                      ≈ {(Number(formData.price) / solPrice).toFixed(4)} SOL
                    </div>
                  )}
                </div>

                {/* Stock Management */}
                <div>
                  <label className="block text-xl font-bold mb-2">Stock</label>
                  <div className="flex items-center gap-6 flex-col sm:flex-row">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isUnlimitedStock}
                        onChange={() => setFormData({
                          ...formData,
                          isUnlimitedStock: true,
                          stockQuantity: null
                        })}
                        className="rounded-lg border-2 border-black w-6 h-6 cursor-pointer"
                      />
                      <span className="text-lg">Unlimited</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!formData.isUnlimitedStock}
                          onChange={() => setFormData({
                            ...formData,
                            isUnlimitedStock: false,
                            stockQuantity: formData.stockQuantity || 1
                          })}
                          className="rounded-lg border-2 border-black w-6 h-6 cursor-pointer"
                        />
                        <span className="text-lg">Limited</span>
                      </label>

                      <input
                        type="number"
                        min="1"
                        className={`w-32 p-4 border-2 border-black rounded-2xl text-lg ml-2 focus:outline-none focus:border-[#EE2B69] ${formData.isUnlimitedStock ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'cursor-text'
                          }`}
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
                  <label className="block text-xl font-bold mb-4">Visibility</label>
                  <div className="space-y-4">
                    {[
                      {
                        id: 'public',
                        value: 'PUBLIC',
                        title: 'Public',
                        description: 'Your product will be visible to everyone and listed in the Marketplace'
                      },
                      {
                        id: 'unlisted',
                        value: 'UNLISTED',
                        title: 'Unlisted',
                        description: 'Your product won\'t appear in the marketplace but can be accessed by anyone with the link'
                      },
                      {
                        id: 'private',
                        value: 'PRIVATE',
                        title: 'Private',
                        description: 'Your product won\'t be visible and the link won\'t work'
                      }
                    ].map(option => (
                      <div key={option.id} className="flex items-center gap-3 p-4 border-2 border-black rounded-2xl hover:border-[#EE2B69] transition-colors cursor-pointer">
                        <input
                          type="radio"
                          id={option.id}
                          name="visibility"
                          value={option.value}
                          checked={formData.visibility === option.value}
                          onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Visibility })}
                          className="w-6 h-6 cursor-pointer"
                        />
                        <label htmlFor={option.id} className="flex flex-col cursor-pointer w-full">
                          <span className="text-lg font-bold">{option.title}</span>
                          <span className="text-gray-600">{option.description}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Type */}
                <div>
                  <label className="block text-xl font-bold mb-4">Upload Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadType"
                        value="CENTRALIZED"
                        checked={formData.uploadType === 'CENTRALIZED'}
                        onChange={(e) => setFormData({ ...formData, uploadType: e.target.value as UploadType })}
                        className="w-6 h-6 cursor-pointer"
                      />
                      <span className="text-lg">Centralized upload (faster)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadType"
                        value="DECENTRALIZED"
                        checked={formData.uploadType === 'DECENTRALIZED'}
                        onChange={(e) => setFormData({ ...formData, uploadType: e.target.value as UploadType })}
                        className="w-6 h-6 cursor-pointer"
                      />
                      <span className="text-lg">Decentralized upload (slower)</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 text-gray-700 text-xl font-bold py-4 px-8 rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#EE2B69] text-white text-xl font-bold py-4 px-8 rounded-2xl hover:bg-[#EE2B69]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Pencil className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
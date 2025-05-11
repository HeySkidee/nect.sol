'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { 
  FileIcon,
  ImageIcon,
  VideoIcon,
  AudioWaveformIcon,
  ArchiveIcon,
  CodeIcon,
  FileTextIcon,
  Zap, 
  Shield, 
  Wallet,
  Loader2,
} from 'lucide-react';
import type { CreateProductFormData, FileCategory, UploadType, Visibility } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import CreatePageFileUpload from '@/components/CreatePageFileUpload';
import FileUpload from '@/components/FileUpload';
import ImageUpload from '@/components/ImageUpload';
import { toast } from 'react-hot-toast';

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
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
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

    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All your changes will be lost.')) {
      router.push('/marketplace');
    }
  };

  const resetFileUpload = () => {
    setIsFileSelected(false);
    setFormData(prev => ({
      ...prev,
      fileUrl: '',
      fileType: '',
      category: 'OTHER'
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

  return (
    <>
      <div className="w-[97%] mx-auto my-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#dddddd]">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-[#EE2B69] rounded-3xl p-16 text-center text-white">
              <h1 className="text-7xl font-black tracking-tight mb-4">
                SELL YOUR DIGITAL GOODS
              </h1>
              <p className="text-2xl font-medium max-w-3xl mx-auto">
                Submit Files, Set Your Price, and Start Earning in Minutes.
              </p>

              {/* File Upload Section */}
              <div className="max-w-4xl mx-auto mt-12">
                {isFileSelected && !formData.fileUrl && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-blue-700 text-lg">
                      Your file is being uploaded. Meanwhile, you can start filling out the form below.
                    </p>
                  </div>
                )}
                {formData.fileUrl && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-green-700 text-lg">
                      File uploaded successfully! Please fill out the form below to complete your listing.
                    </p>
                  </div>
                )}

                <CreatePageFileUpload
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
                    setIsFileSelected(!!url);
                  }}
                  onBeginUpload={() => {
                    setIsFileSelected(true);
                  }}
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
                    setIsFileSelected(false);
                  }}
                />
              </div>
            </div>

            {/* Show form when file is selected or uploaded */}
            {isFileSelected && (
              <div className="max-w-4xl mx-auto">
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
                      <ImageUpload
                        endpoint="imageUploader"
                        value={formData.bannerUrl}
                        onChange={(url: string) => {
                          setFormData(prev => ({
                            ...prev,
                            bannerUrl: url
                          }));
                        }}
                      />
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

                    {/* Stock */}
                    <div>
                      <label className="block text-xl font-bold mb-2">Stock</label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
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
                            className="rounded-lg border-2 border-black w-6 h-6 cursor-pointer"
                          />
                          <span className="text-lg">Unlimited</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
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
                              className="rounded-lg border-2 border-black w-6 h-6 cursor-pointer"
                            />
                            <span className="text-lg">Limited</span>
                          </label>

                          <input
                            type="number"
                            min="1"
                            className={`w-32 p-4 border-2 border-black rounded-2xl text-lg ml-2 focus:outline-none focus:border-[#EE2B69] ${
                              isUnlimited ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'cursor-text'
                            }`}
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
                        ].map((option) => (
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
                            Creating...
                          </>
                        ) : (
                          'Create Product'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Feature Cards and CTA Section - Only show when no file is selected */}
            {!isFileSelected && (
              <>
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FeatureCard 
                    title="Instant Delivery"
                    description="Buyers get immediate access to files after payment"
                    icon={<Zap className="size-8 text-white" />}
                  />
                  <FeatureCard 
                    title="Secure Payments"
                    description="Safe transactions via Solana blockchain"
                    icon={<Shield className="size-8 text-white" />}
                  />
                  <FeatureCard 
                    title="Zero Platform Fees"
                    description="Keep 100% of what you earn"
                    icon={<Wallet className="size-8 text-white" />}
                  />
                </div>

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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FileType({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
      <Icon className="size-5" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white border-[5px] border-black rounded-[22px] p-8 hover:shadow-[8px_8px_0px_0px_#EE2B69] transition-all">
      <div className="size-16 rounded-full bg-[#EE2B69] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-lg">{description}</p>
    </div>
  );
} 
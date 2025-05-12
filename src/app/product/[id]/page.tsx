'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FileIcon, ImageIcon, VideoIcon, AudioWaveformIcon, ArchiveIcon, CodeIcon, FileTextIcon, Pencil } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { encodeURL } from '@solana/pay';
import { QRCodeSVG } from 'qrcode.react';
import BigNumber from 'bignumber.js';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import DownloadModal from '@/components/DownloadModal';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    fileUrl: string;
    fileType: string;
    bannerUrl: string | null;
    category: string;
    visibility: string;
    isUnlimitedStock: boolean;
    stockQuantity: number | null;
    oneTimeDownload: boolean;
    uploadType: string;
    createdAt: string;
    updatedAt: string;
    creator: {
        publicKey: string;
    };
}

const CategoryIcons = {
    IMAGE: ImageIcon,
    VIDEO: VideoIcon,
    AUDIO: AudioWaveformIcon,
    DOCUMENT: FileTextIcon,
    SOFTWARE: CodeIcon,
    ARCHIVE: ArchiveIcon,
    OTHER: FileIcon,
} as const;

export default function ProductPage() {
    const { publicKey, sendTransaction } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [qrReference, setQrReference] = useState<string | null>(null);
    const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
    const [showQRDrawer, setShowQRDrawer] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadInfo, setDownloadInfo] = useState<{
        token: string;
        fileName: string;
        fileType: string;
    } | null>(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/product/${params.id}`);
                if (!response.ok) {
                    throw new Error('Product not found');
                }
                const data = await response.json();
                setProduct(data);

                // Fetch SOL price
                const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const priceData = await priceRes.json();
                setSolPrice(priceData.solana.usd);

                // Generate Solana Pay QR code
                if (data.creator.publicKey) {
                    const rawSolAmount = data.price / priceData.solana.usd;
                    const solAmount = Number(rawSolAmount.toFixed(4));
                    
                    // Generate unique reference
                    const reference = new Uint8Array(32);
                    window.crypto.getRandomValues(reference);
                    const referencePublicKey = new PublicKey(reference);
                    const referenceString = referencePublicKey.toString();
                    
                    const url = encodeURL({
                        recipient: new PublicKey(data.creator.publicKey),
                        amount: new BigNumber(solAmount),
                        reference: referencePublicKey,
                        label: "Nect",
                        message: `Purchase ${data.name}`,
                    });

                    setQrCode(url.toString());
                    setQrReference(referenceString);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err instanceof Error ? err.message : 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    const handlePayment = async () => {
        if (!publicKey || !product || !solPrice) {
            toast.error('Please connect your wallet first');
            return;
        }

        const toastId = toast.loading('Preparing transaction...');

        try {
            setIsProcessing(true);

            // Calculate SOL amount
            const solAmount = product.price / solPrice;
            const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);

            // Create connection
            const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com');
            
            // Create transaction
            const transaction = new Transaction();
            
            // Add transfer instruction
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(product.creator.publicKey),
                    lamports,
                })
            );

            // Send transaction
            const signature = await sendTransaction(transaction, connection);
            console.log('Transaction sent:', signature);

            // Wait for confirmation using getSignatureStatus
            let status = await connection.getSignatureStatus(signature);
            let retries = 30;
            while (retries > 0 && !status.value?.confirmationStatus) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                status = await connection.getSignatureStatus(signature);
                retries--;
            }

            if (!status.value?.confirmationStatus) {
                throw new Error('Transaction failed to confirm');
            }

            // Record purchase
            const purchaseResponse = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product.id,
                    signature,
                    amount: lamports,
                }),
            });

            if (!purchaseResponse.ok) {
                const errorData = await purchaseResponse.json();
                throw new Error(errorData.error || 'Failed to record purchase');
            }

            const purchaseData = await purchaseResponse.json();

            // Get download information
            const downloadResponse = await fetch(`/api/download/${purchaseData.downloadToken}`);
            if (!downloadResponse.ok) {
                throw new Error('Failed to get download link');
            }

            const downloadData = await downloadResponse.json();
            setDownloadInfo({
                token: purchaseData.downloadToken,
                fileName: downloadData.fileName,
                fileType: downloadData.fileType
            });
            
            // Update stock quantity in UI
            if (!product.isUnlimitedStock && product.stockQuantity !== null) {
                setProduct(prev => prev ? {
                    ...prev,
                    stockQuantity: prev.stockQuantity !== null ? prev.stockQuantity - 1 : null
                } : null);
            }

            toast.success('Purchase successful!', { id: toastId });
            setShowDownloadModal(true);
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Payment failed. Please try again.', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="w-[97%] mx-auto mt-10">
                <div className="bg-white p-8 rounded-3xl border-2 border-[#dddddd] min-h-[calc(100vh-8rem)]">
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#f7fa3e]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="w-[97%] mx-auto mt-10">
                <div className="bg-white p-8 rounded-3xl border-2 border-[#dddddd] min-h-[calc(100vh-8rem)]">
                    <div className="flex flex-col items-center justify-center h-full">
                        <h1 className="text-4xl font-bold text-red-500 mb-4">
                            {error || 'Product not found'}
                        </h1>
                        <p className="text-xl text-gray-600">
                            The product you're looking for might have been removed or is private.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const solAmount = solPrice ? (product.price / solPrice).toFixed(4) : '...';
    const IconComponent = CategoryIcons[product.category as keyof typeof CategoryIcons] || FileIcon;

    return (
        <div className="w-[97%] mx-auto mt-10 pb-12">
            <div className="bg-white rounded-3xl border-2 border-[#dddddd] overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                    {/* Product Preview */}
                    <div className="aspect-[4/3] w-full relative rounded-2xl overflow-hidden border-[5px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {product.bannerUrl ? (
                            <img 
                                src={product.bannerUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f7fa3e] to-[#dbfa51]">
                                <IconComponent className="w-32 h-32 mb-4 text-black/80" />
                                <span className="text-2xl font-medium text-black/80">{product.category}</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <h1 className="text-6xl font-bold mb-6">{product.name}</h1>
                        
                        {product.description && (
                            <p className="text-2xl text-gray-600 mb-8">{product.description}</p>
                        )}

                        <div className="flex items-baseline mb-8">
                            <span className="text-4xl font-bold">${product.price}</span>
                            <span className="text-2xl text-gray-500 ml-3">({solAmount} SOL)</span>
                        </div>

                        {/* Stock Info */}
                        <div className="mb-8">
                            {product.isUnlimitedStock ? (
                                <span className="bg-[#3ffd7e] text-black px-6 py-2.5 rounded-full text-lg font-medium">
                                    ∞ Unlimited stock
                                </span>
                            ) : (
                                <span className={`${
                                    product.stockQuantity === 0 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-[#3ffd7e] text-black'
                                } px-6 py-2.5 rounded-full text-lg font-medium`}>
                                    {product.stockQuantity} left in stock
                                </span>
                            )}
                        </div>

                        {/* Payment Button */}
                        <div className="flex gap-4">
                            <Drawer open={showPaymentDrawer} onOpenChange={setShowPaymentDrawer}>
                                <DrawerTrigger asChild>
                                    <button
                                        className={`bg-black cursor-pointer text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-fuchsia-300 hover:text-black transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${publicKey && product.creator.publicKey === publicKey.toString() ? 'w-[70%]' : 'w-full'}`}
                                        disabled={(!product.isUnlimitedStock && product.stockQuantity === 0) || isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Buy Now'}
                                    </button>
                                </DrawerTrigger>
                                <DrawerContent side="bottom" className="fixed bottom-0 left-0 right-0 h-[90vh] sm:h-[50vh] rounded-t-[30px] border-t-0">
                                    <div className="mx-auto w-full max-w-4xl flex items-center justify-center flex-col">
                                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 mt-4" />
                                        <DrawerHeader className="text-center pb-4 sm:pb-8">
                                            <DrawerTitle className="text-3xl sm:text-5xl font-bold mb-3">Choose Payment Method</DrawerTitle>
                                        </DrawerHeader>
                                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center py-4 px-4">
                                            {/* Wallet Payment */}
                                            <div
                                                className="flex flex-col items-center justify-center bg-white border-[5px] border-black rounded-[22px] p-4 sm:p-6 w-full sm:w-[45%] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 hover:-translate-y-1 cursor-pointer"
                                                onClick={() => {
                                                    setShowPaymentDrawer(false);
                                                    handlePayment();
                                                }}
                                            >
                                                <WalletMultiButton className="w-12 h-12 sm:w-16 sm:h-16 mb-6 sm:mb-9" />
                                                <span className="font-bold text-2xl sm:text-3xl text-center mb-2 mt-3">Wallet</span>
                                                <span className="text-sm sm:text-base text-gray-600 text-center">Connect & pay directly with your wallet</span>
                                                <div className="mt-4 bg-[#f7fa3e] px-4 py-2 rounded-full text-sm font-medium">
                                                    Recommended
                                                </div>
                                            </div>
                                            {/* QR Payment */}
                                            <div
                                                className="flex flex-col items-center justify-center bg-white border-[5px] border-black rounded-[22px] p-4 sm:p-6 w-full sm:w-[45%] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 hover:-translate-y-1 cursor-pointer"
                                                onClick={() => {
                                                    setShowPaymentDrawer(false);
                                                    setTimeout(() => setShowQRDrawer(true), 200);
                                                }}
                                            >
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 flex items-center justify-center">
                                                    <QRCodeSVG value={qrCode} size={48} className="sm:hidden" />
                                                    <QRCodeSVG value={qrCode} size={56} className="hidden sm:block" />
                                                </div>
                                                <span className="font-bold text-2xl sm:text-3xl text-center mb-2">Solana Pay</span>
                                                <span className="text-sm sm:text-base text-gray-600 text-center">Scan QR code with your mobile wallet</span>
                                                <div className="mt-4 bg-fuchsia-200 px-4 py-2 rounded-full text-sm font-medium">
                                                    Mobile friendly
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>

                            {/* Edit Button for Creator */}
                            {publicKey && product.creator.publicKey === publicKey.toString() && (
                                <Link 
                                    href={`/product/${product.id}/edit`}
                                    className="bg-black text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-fuchsia-300 hover:text-black transition-colors flex items-center gap-2 w-[30%] justify-center"
                                >
                                    <Pencil className="h-6 w-6" />
                                    <span>Edit</span>
                                </Link>
                            )}
                        </div>

                        {/* QR Code Drawer */}
                        <Drawer open={showQRDrawer} onOpenChange={setShowQRDrawer}>
                            <DrawerContent side="bottom" className="fixed bottom-0 left-0 right-0 h-[90vh] sm:h-[50vh] rounded-t-[30px] border-t-0">
                                <div className="mx-auto w-full max-w-2xl">
                                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 mt-4" />
                                    <DrawerHeader className="text-center pb-2">
                                        <DrawerTitle className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-3">Scan & Pay</DrawerTitle>
                                        <p className="text-lg sm:text-xl text-gray-600">Use your mobile wallet (ex: phantom app) to complete the payment</p>
                                    </DrawerHeader>
                                    <div className="flex justify-center py-4">
                                        <div className="bg-white border-[5px] border-black rounded-[22px] p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-colors">
                                            <QRCodeSVG value={qrCode} size={200} className="sm:hidden" />
                                            <QRCodeSVG value={qrCode} size={240} className="hidden sm:block" />
                                        </div>
                                    </div>
                                </div>
                            </DrawerContent>
                        </Drawer>

                        {/* Additional Info */}
                        <div className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-500 text-lg">Category</span>
                                <span className="text-xl font-medium">{product.category}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-500 text-lg">File Type</span>
                                <span className="text-xl font-medium">{product.fileType}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-500 text-lg">Download Type</span>
                                <span className="text-xl font-medium">{product.oneTimeDownload ? 'One-time' : 'Unlimited'}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-500 text-lg">Storage</span>
                                <span className="text-xl font-medium">{product.uploadType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured section / Footer */}
            <div className="mt-12 bg-[#f7fa3e] px-10 py-8 rounded-3xl">
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

            {showDownloadModal && downloadInfo && (
                <DownloadModal
                    isOpen={showDownloadModal}
                    onClose={() => setShowDownloadModal(false)}
                    downloadToken={downloadInfo.token}
                    fileName={downloadInfo.fileName}
                    fileType={downloadInfo.fileType}
                />
            )}
        </div>
    );
} 
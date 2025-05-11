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
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold text-red-500 mb-4">
                    {error || 'Product not found'}
                </h1>
                <p className="text-gray-600">
                    The product you're looking for might have been removed or is private.
                </p>
            </div>
        );
    }

    const solAmount = solPrice ? (product.price / solPrice).toFixed(4) : '...';
    const IconComponent = CategoryIcons[product.category as keyof typeof CategoryIcons] || FileIcon;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Toaster position="top-center" />
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Product Preview */}
                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                    {product.bannerUrl ? (
                        <img 
                            src={product.bannerUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <IconComponent className="w-24 h-24 mb-2" />
                            <span className="text-lg">{product.category} File</span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    
                    {product.description && (
                        <p className="text-gray-600 mb-6">{product.description}</p>
                    )}

                    <div className="flex items-baseline mb-6">
                        <span className="text-2xl font-bold">${product.price}</span>
                        <span className="text-gray-500 ml-2">({solAmount} SOL)</span>
                    </div>

                    {/* Edit Button for Creator */}
                    {publicKey && product.creator.publicKey === publicKey.toString() && (
                        <Link 
                            href={`/product/${product.id}/edit`}
                            className="fixed bottom-6 right-6 bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300 flex items-center gap-2"
                        >
                            <Pencil className="h-5 w-5" />
                            <span>Edit Product</span>
                        </Link>
                    )}

                    {/* Stock Info */}
                    <div className="mb-6">
                        {product.isUnlimitedStock ? (
                            <span className="text-emerald-600">∞ Unlimited stock</span>
                        ) : (
                            <span className={`${product.stockQuantity === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {product.stockQuantity} left in stock
                            </span>
                        )}
                    </div>

                    {/* Payment Options */}
                    <Drawer open={showPaymentDrawer} onOpenChange={setShowPaymentDrawer}>
                        <DrawerTrigger asChild>
                            <button
                                className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-300 text-lg font-semibold w-full"
                                disabled={(!product.isUnlimitedStock && product.stockQuantity === 0) || isProcessing}
                            >
                                Buy Now
                            </button>
                        </DrawerTrigger>
                        <DrawerContent side="bottom" aria-describedby={undefined}>
                            <DrawerHeader>
                                <DrawerTitle>Choose Payment Method</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex gap-8 w-full justify-center py-4">
                                {/* Wallet Payment */}
                                <div
                                    className="flex flex-col items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded-xl p-6 w-40 h-40 transition-colors shadow group cursor-pointer"
                                    onClick={() => {
                                        setShowPaymentDrawer(false);
                                        handlePayment();
                                    }}
                                >
                                    <WalletMultiButton className="w-12 h-12 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold text-lg">Pay via Wallet</span>
                                    <span className="text-xs text-gray-500 mt-1">Phantom, Solflare, etc.</span>
                                </div>
                                {/* QR Payment */}
                                <div
                                    className="flex flex-col items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded-xl p-6 w-40 h-40 transition-colors shadow group cursor-pointer"
                                    onClick={() => {
                                        setShowPaymentDrawer(false);
                                        setTimeout(() => setShowQRDrawer(true), 200);
                                    }}
                                >
                                    <QRCodeSVG value={qrCode} size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold text-lg">Solana Pay</span>
                                    <span className="text-xs text-gray-500 mt-1">Scan with mobile wallet</span>
                                </div>
                            </div>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <button className="w-full py-2 rounded bg-gray-200">Cancel</button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    {/* QR Code Drawer */}
                    <Drawer open={showQRDrawer} onOpenChange={setShowQRDrawer}>
                        <DrawerContent side="bottom" aria-describedby={undefined}>
                            <DrawerHeader>
                                <DrawerTitle>Scan to Pay with Solana Pay</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex justify-center py-4">
                                <QRCodeSVG value={qrCode} size={200} />
                            </div>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <button className="w-full py-2 rounded bg-gray-200">Close</button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Category:</span> {product.category}
                        </div>
                        <div>
                            <span className="font-medium">File Type:</span> {product.fileType}
                        </div>
                        <div>
                            <span className="font-medium">Download Type:</span> {product.oneTimeDownload ? 'One-time' : 'Unlimited'}
                        </div>
                        <div>
                            <span className="font-medium">Storage:</span> {product.uploadType}
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
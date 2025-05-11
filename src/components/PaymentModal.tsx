'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createQR, encodeURL } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    price: number;
    creatorPublicKey: string;
    onSuccess: (downloadToken: string) => void;
}

export default function PaymentModal({ isOpen, onClose, productId, price, creatorPublicKey, onSuccess }: PaymentModalProps) {
    // TODO: Implement dynamic Solana Pay QR code generation
    // - Generate unique reference for each transaction
    // - Create dynamic QR code with unique payment link
    // - Implement real-time payment status tracking
    // - Handle payment confirmation and download token generation
    // - Add timeout and QR code refresh functionality
    // - Implement webhook for payment notifications
    // - Add fallback payment methods
    const { publicKey, sendTransaction } = useWallet();
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'qr'>('wallet');
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch SOL price
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
            .then(res => res.json())
            .then(data => setSolPrice(data.solana.usd))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (paymentMethod === 'qr' && solPrice) {
            const solAmount = price / solPrice;
            const reference = new Uint8Array(32);
            window.crypto.getRandomValues(reference);
            const referencePublicKey = new PublicKey(reference);

            const url = encodeURL({
                recipient: new PublicKey(creatorPublicKey),
                amount: new BigNumber(solAmount),
                reference: referencePublicKey,
                label: "Nect",
                message: `Purchase product ${productId}`,
            });

            setQrCodeUrl(url.toString());

            // Poll for payment completion
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/purchase/check/${referencePublicKey.toBase58()}`);
                    const data = await response.json();
                    
                    if (data.status === 'complete' && data.purchase) {
                        clearInterval(interval);
                        onSuccess(data.purchase.downloadToken);
                        onClose();
                    }
                } catch (error) {
                    console.error('Error checking payment:', error);
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [paymentMethod, solPrice, productId, creatorPublicKey, onSuccess, onClose, price]);

    const handleDirectPayment = async () => {
        if (!publicKey || !solPrice) return;

        setIsProcessing(true);
        setError(null);

        try {
            const solAmount = price / solPrice;
            const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);

            const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
            
            // Get latest blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(creatorPublicKey),
                    lamports,
                })
            );

            // Set recent blockhash and sign
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signature = await sendTransaction(transaction, connection);
            
            // Wait for confirmation
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            if (confirmation.value.err) {
                throw new Error('Transaction failed');
            }

            const purchaseResponse = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    signature,
                    amount: lamports,
                }),
            });

            if (!purchaseResponse.ok) {
                const errorData = await purchaseResponse.json();
                throw new Error(errorData.error || 'Failed to process purchase');
            }

            const purchaseData = await purchaseResponse.json();
            onSuccess(purchaseData.downloadToken);
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
            setError(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Complete Purchase</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span>Price:</span>
                        <span>${price.toFixed(2)}</span>
                    </div>
                    {solPrice && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Amount in SOL:</span>
                            <span>≈ {(price / solPrice).toFixed(4)} SOL</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <button
                            className={`flex-1 py-2 px-4 rounded ${
                                paymentMethod === 'wallet' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                            onClick={() => setPaymentMethod('wallet')}
                        >
                            Wallet
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 rounded ${
                                paymentMethod === 'qr' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                            onClick={() => setPaymentMethod('qr')}
                        >
                            QR Code
                        </button>
                    </div>

                    {paymentMethod === 'wallet' ? (
                        <div className="space-y-4">
                            {!publicKey ? (
                                <WalletMultiButton className="w-full" />
                            ) : (
                                <button
                                    onClick={handleDirectPayment}
                                    disabled={isProcessing}
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : 'Pay Now'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            {qrCodeUrl && (
                                <QRCodeSVG
                                    value={qrCodeUrl}
                                    size={256}
                                    level="H"
                                    includeMargin
                                />
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 px-4 border border-gray-300 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
} 
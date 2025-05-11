'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { prisma } from "@/lib/prisma";

function Navbar() {
    const { connected, publicKey } = useWallet();
    const router = useRouter();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Handle initial load
    useEffect(() => {
        if (!sessionStorage.getItem('sessionStarted')) {
            sessionStorage.setItem('sessionStarted', 'true');
        }
        setInitialLoadComplete(true);
    }, []);

    useEffect(() => {
        if (!initialLoadComplete) return;

        const handleWalletConnection = async () => {
            if (connected && publicKey) {
                // Create/update user
                await fetch("/api/user", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ publicKey: publicKey.toString() })
                });

                // Check if this wallet has connected before
                const hasConnectedBefore = localStorage.getItem(`wallet_${publicKey.toString()}_connected`);
                
                if (!hasConnectedBefore) {
                    // Mark this wallet as having connected
                    localStorage.setItem(`wallet_${publicKey.toString()}_connected`, 'true');
                    // Redirect to dashboard
                    router.push("/dashboard");
                }
            }
        };

        handleWalletConnection();
    }, [connected, publicKey, router, initialLoadComplete]);

    // Clear connection status on disconnect
    useEffect(() => {
        if (!connected && publicKey) {
            localStorage.removeItem(`wallet_${publicKey.toString()}_connected`);
        }
    }, [connected, publicKey]);
    
    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="text-2xl font-bold text-emerald-800">
                        Nect
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/marketplace" 
                            className="px-4 py-2 text-gray-700 hover:text-emerald-800 font-medium transition-colors"
                        >
                            Marketplace
                        </Link>
                        
                        {connected && (
                            <Link 
                                href="/dashboard" 
                                className="px-4 py-2 text-gray-700 hover:text-emerald-800 font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                        
                        <WalletMultiButton className="!bg-emerald-800 hover:!bg-emerald-700 transition-colors" />
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

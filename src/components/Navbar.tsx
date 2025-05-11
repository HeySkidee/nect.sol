'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { prisma } from "@/lib/prisma";
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton with ssr disabled
const WalletMultiButtonDynamic = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false }
);

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
        <nav className="sticky top-6 z-50 py-2 pb-2.5 bg-white w-[97%] mx-auto mb-12 rounded-2xl border-[#dddddd] border-2 ">
            <div className="px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    NECT
                </Link>

                <div className="flex items-center gap-6 font-medium">
                    <Link href="/create" className="text-lg hover:text-blue-500 transition-colors">
                        START SELLING
                    </Link>
                    <Link href="/marketplace" className="text-lg hover:text-blue-500 transition-colors">
                        MARKETPLACE
                    </Link>
                    <Link href="https://youtube.com" className="text-lg hover:text-blue-500 transition-colors">
                        WATCH DEMO
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    {connected && (
                        <Link
                            href="/dashboard"
                            className="text-lg font-medium hover:text-blue-500 transition-colors"
                        >
                            Dashboard
                        </Link>
                    )}
                    <WalletMultiButtonDynamic />
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

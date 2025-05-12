'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import NavModal from "./NavModal";

// Dynamically import WalletMultiButton with ssr disabled
const WalletMultiButtonDynamic = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false }
);

function Navbar() {
    const { connected, publicKey } = useWallet();
    const router = useRouter();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                await fetch("/api/user", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ publicKey: publicKey.toString() })
                });

                const hasConnectedBefore = localStorage.getItem(`wallet_${publicKey.toString()}_connected`);

                if (!hasConnectedBefore) {
                    localStorage.setItem(`wallet_${publicKey.toString()}_connected`, 'true');
                    router.push("/dashboard");
                }
            }
        };

        handleWalletConnection();
    }, [connected, publicKey, router, initialLoadComplete]);

    useEffect(() => {
        if (!connected && publicKey) {
            localStorage.removeItem(`wallet_${publicKey.toString()}_connected`);
        }
    }, [connected, publicKey]);

    return (
        <>
            <nav className="sticky top-6 z-50 py-2 pb-2.5 bg-white w-[97%] mx-auto mb-0 sm:mb-12 rounded-2xl border-[#dddddd] border-2">
                <div className="px-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold flex items-center gap-2 group">
                        <Image
                            src="/nect-logo.png"
                            alt="NECT"
                            width={35}
                            height={35}
                            className="transform transition-transform duration-300 group-hover:scale-110"
                        />
                        <span className="text-2xl font-bold">NECT</span>
                    </Link>

                    <div className="hidden lg:flex justify-center items-center font-medium">
                        <Link href="/create" className="text-lg px-6 py-2.5 rounded-full transition-all duration-300 hover:bg-fuchsia-300 hover:text-black">
                            START SELLING
                        </Link>
                        <Link href="/marketplace" className="text-lg px-6 py-2.5 rounded-full transition-all duration-300 hover:bg-fuchsia-300 hover:text-black">   
                            MARKETPLACE
                        </Link>
                        <Link href="https://youtube.com" className="text-lg px-6 py-2.5 rounded-full transition-all duration-300 hover:bg-fuchsia-300 hover:text-black">
                            WATCH DEMO
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-3.5">
                        {connected && (
                            <Link
                                href="/dashboard"
                                className="text-lg font-medium px-6 py-2.5 rounded-full bg-[#f7fa3e] text-black hover:bg-yellow-300 transition-all duration-300 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                                Dashboard
                            </Link>
                        )}
                        <WalletMultiButtonDynamic />
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden p-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            <NavModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}

export default Navbar;
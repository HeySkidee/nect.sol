'use client';

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false }
);

interface NavModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NavModal({ isOpen, onClose }: NavModalProps) {
    const { connected } = useWallet();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            
            {/* Modal content */}
            <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-4xl p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center gap-6">
                    <Link 
                        href="/create" 
                        className="w-full text-center text-2xl font-bold py-4 rounded-full bg-[#3ffd7e] hover:bg-[#00ff40] transition-colors"
                        onClick={onClose}
                    >
                        START SELLING
                    </Link>
                    
                    <Link 
                        href="/marketplace" 
                        className="w-full text-center text-2xl font-bold py-4 rounded-full bg-fuchsia-300 hover:bg-fuchsia-400 transition-colors"
                        onClick={onClose}
                    >
                        MARKETPLACE
                    </Link>
                    
                    <Link 
                        href="https://youtube.com" 
                        className="w-full text-center text-2xl font-bold py-4 rounded-full bg-[#f7fa3e] hover:bg-[#dbfa51] transition-colors"
                        onClick={onClose}
                    >
                        WATCH DEMO
                    </Link>

                    {connected && (
                        <Link
                            href="/dashboard"
                            className="w-full text-center text-2xl font-bold py-4 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                            onClick={onClose}
                        >
                            DASHBOARD
                        </Link>
                    )}

                    <div className="mt-4">
                        <WalletMultiButtonDynamic />
                    </div>
                </div>
            </div>
        </div>
    );
} 
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
                        className="w-full text-center text-2xl font-bold py-4 rounded-full bg-[#3ffd7e] hover:bg-[#00ff40] transition-colors flex items-center justify-center gap-3"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        START SELLING
                    </Link>
                    
                    <Link 
                        href="/marketplace" 
                        className="w-full text-center text-2xl font-bold py-4 rounded-full bg-fuchsia-300 hover:bg-fuchsia-400 transition-colors flex items-center justify-center gap-3"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        MARKETPLACE
                    </Link>
                    
                    <Link 
                        href="https://youtube.com" 
                        className="w-full text-center text-2xl font-bold py-4 rounded-full bg-[#f7fa3e] hover:bg-[#dbfa51] transition-colors flex items-center justify-center gap-3"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                        WATCH DEMO
                    </Link>

                    {connected && (
                        <Link
                            href="/dashboard"
                            className="w-full text-center text-2xl font-bold py-4 rounded-full bg-[#f7fa3e] hover:bg-[#dbfa51] transition-colors flex items-center justify-center gap-3"
                            onClick={onClose}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
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
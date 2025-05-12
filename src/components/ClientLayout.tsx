'use client';

import WalletContextProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WalletContextProvider>
      {mounted && (
        <>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </>
      )}
      <Toaster />
    </WalletContextProvider>
  );
} 
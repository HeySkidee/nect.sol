'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
      </body>
    </html>
  );
}

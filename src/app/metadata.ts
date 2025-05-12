import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | NECT - Digital Marketplace',
    default: 'NECT - Buy & Sell Digital Goods Anonymously',
  },
  description: 'NECT is a decentralized marketplace for digital goods. Buy and sell digital assets anonymously with Solana. No platform fees, no middlemen, just pure value exchange.',
  keywords: ['digital marketplace', 'solana', 'nft', 'digital goods', 'anonymous', 'decentralized', 'web3'],
  authors: [{ name: 'NECT' }],
  creator: 'NECT',
  publisher: 'NECT',
  robots: 'index, follow',
  icons: {
    icon: '/nect-logo.png',
    shortcut: '/nect-logo.png',
    apple: '/nect-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nect-sol.vercel.app',
    siteName: 'NECT',
    title: 'NECT - Buy & Sell Digital Goods Anonymously',
    description: 'NECT is a decentralized marketplace for digital goods. Buy and sell digital assets anonymously with Solana. No platform fees, no middlemen, just pure value exchange.',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'NECT - Digital Marketplace Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NECT - Buy & Sell Digital Goods Anonymously',
    description: 'Buy and sell digital assets anonymously with Solana. No platform fees, no middlemen, just pure value exchange.',
    images: ['/preview.png'],
    creator: '@nect_xyz'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#f7fa3e',
}; 
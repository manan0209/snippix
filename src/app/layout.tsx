import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://snippixbymnn.vercel.app"),
  title: "Snippix - Code Art Generator with Steganographic Embedding",
  description: "Generate pixel art from source code with LSB steganographic embedding. Hide code within pixel data, optional encryption, and browser-compatible extraction.",
  keywords: [
    "code art generator",
    "pixel art", 
    "steganography",
    "LSB encoding",
    "code embedding",
    "pixel steganography",
    "code to art",
    "encryption",
    "Next.js",
    "TypeScript",
    "canvas",
    "browser steganography",
    "developer tools",
  ],
  openGraph: {
    title: "Snippix - Code Art Generator with Steganographic Embedding",
    description: "Generate pixel art from source code with LSB steganographic embedding. Hide code within pixel data, optional encryption, and browser-compatible extraction.",
    url: "https://snippixbymnn.vercel.app/",
    siteName: "Snippix",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Snippix - Code Art Generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snippix - Code Art Generator with Steganographic Embedding", 
    description: "Generate pixel art from source code with LSB steganographic embedding. Hide code within pixel data, optional encryption, and browser-compatible extraction.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

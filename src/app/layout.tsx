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
  metadataBase: new URL("https://snippix.vercel.app"),
  title: "Snippix: Code Art Generator",
  description: "Transform your code snippets into beautiful, retro pixel art patterns. Secure, customizable, and shareable art cards for developers.",
  keywords: [
    "code art",
    "pixel art", 
    "code to art",
    "steganography",
    "secure code sharing",
    "Next.js",
    "React",
    "TypeScript",
    "developer tools",
    "art generator",
  ],
  openGraph: {
    title: "Snippix: Code Art Generator",
    description: "Transform your code snippets into beautiful, retro pixel art patterns. Secure, customizable, and shareable art cards for developers.",
    url: "https://snippix.vercel.app/",
    siteName: "Snippix",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Snippix Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snippix: Code Art Generator", 
    description: "Transform your code snippets into beautiful, retro pixel art patterns. Secure, customizable, and shareable art cards for developers.",
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

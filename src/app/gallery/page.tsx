"use client";

import { useState } from 'react';
import { DEFAULT_PALETTE, type Palette, PALETTES } from '@/lib/palettes';
import Link from 'next/link';

export default function GalleryPage() {
  const [selectedPalette, setSelectedPalette] = useState<Palette>(DEFAULT_PALETTE);

  const handlePaletteChange = () => {
    const currentIndex = PALETTES.findIndex(p => p.name === selectedPalette.name);
    const nextIndex = (currentIndex + 1) % PALETTES.length;
    setSelectedPalette(PALETTES[nextIndex]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#1a1a1a] to-[#18181b] font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYjVlODUzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="text-center py-12 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-[#18181b]/80 backdrop-blur-sm border border-[#b5e853]/20 rounded-lg text-[#b5e853] text-sm font-mono hover:border-[#b5e853]/40 hover:bg-[#b5e853]/5 transition-all group"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Art Mode
              </Link>

              <div className="flex gap-3">
                <Link
                  href="/math"
                  className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 rounded-lg text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Math Mode
                </Link>

                <button
                  onClick={handlePaletteChange}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/10 border-2 border-[#8b5cf6]/40 rounded-full text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 transition-all group relative shadow-lg hover:shadow-[#8b5cf6]/20"
                  title={`Click to change palette (${PALETTES.length} available)`}
                >
                  <div className="flex gap-1">
                    {selectedPalette.colors.slice(0, 3).map((color, i) => (
                      <div 
                        key={i}
                        className="w-2 h-2 rounded-full border border-white/20" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {selectedPalette.name}
                  <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="relative">
              <h1 className="text-6xl lg:text-8xl font-extrabold text-[#b5e853] drop-shadow-2xl tracking-widest uppercase mb-6 relative">
                Art Gallery
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#8b5cf6] rounded-full animate-pulse"></div>
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-[#b5e853] font-medium max-w-4xl mx-auto leading-relaxed opacity-90 mb-4">
              Discover and share beautiful pixel art created by the Snippix community
            </p>
            <p className="text-lg text-[#b5e853]/70 font-mono max-w-2xl mx-auto">
              Where creativity meets community. Every artwork tells a story.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <span className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full text-[#8b5cf6] text-sm font-mono">
                🎨 Community Art
              </span>
              <span className="px-4 py-2 bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-sm font-mono">
                ❤️ Favorites
              </span>
              <span className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full text-[#8b5cf6] text-sm font-mono">
                🔗 Sharing
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-4 pb-12">
          <div className="w-full max-w-6xl">
            {/* Coming Soon Section */}
            <section className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-12 shadow-2xl text-center">
              <div className="max-w-2xl mx-auto">
                <div className="text-6xl mb-6">
                  🚧
                </div>
                <h2 className="text-3xl font-bold text-[#b5e853] mb-6 tracking-widest uppercase">
                  Gallery Coming Soon
                </h2>
                <p className="text-lg text-[#b5e853]/80 leading-relaxed mb-8">
                  We&apos;re building an amazing community gallery where you can:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-6">
                    <div className="text-3xl mb-3">🎨</div>
                    <h3 className="text-[#8b5cf6] font-bold mb-2">Share Your Art</h3>
                    <p className="text-[#8b5cf6]/70 text-sm">
                      Upload and showcase your pixel art creations to the community
                    </p>
                  </div>

                  <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-6">
                    <div className="text-3xl mb-3">❤️</div>
                    <h3 className="text-[#8b5cf6] font-bold mb-2">Like & Heart</h3>
                    <p className="text-[#8b5cf6]/70 text-sm">
                      Show appreciation for amazing artwork with hearts and reactions
                    </p>
                  </div>

                  <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-6">
                    <div className="text-3xl mb-3">💬</div>
                    <h3 className="text-[#8b5cf6] font-bold mb-2">Social Sharing</h3>
                    <p className="text-[#8b5cf6]/70 text-sm">
                      Share artwork to Twitter, Discord, and other platforms
                    </p>
                  </div>

                  <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-6">
                    <div className="text-3xl mb-3">🔍</div>
                    <h3 className="text-[#8b5cf6] font-bold mb-2">Discover & Browse</h3>
                    <p className="text-[#8b5cf6]/70 text-sm">
                      Explore artwork by palette, style, and community favorites
                    </p>
                  </div>
                </div>

                <div className="bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-lg p-6 mb-8">
                  <h3 className="text-[#b5e853] font-bold mb-3 flex items-center justify-center gap-2">
                    <span className="text-xl">🚀</span>
                    In Development
                  </h3>
                  <p className="text-[#b5e853]/80 text-sm mb-4">
                    The gallery is currently being built with these amazing features:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="px-3 py-1 bg-[#b5e853]/20 rounded-full text-[#b5e853]">Vercel KV Storage</span>
                    <span className="px-3 py-1 bg-[#b5e853]/20 rounded-full text-[#b5e853]">Community Moderation</span>
                    <span className="px-3 py-1 bg-[#b5e853]/20 rounded-full text-[#b5e853]">Advanced Filtering</span>
                    <span className="px-3 py-1 bg-[#b5e853]/20 rounded-full text-[#b5e853]">Mobile Responsive</span>
                  </div>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-lg font-mono hover:bg-[#7c3aed] transition-all shadow-lg hover:shadow-[#8b5cf6]/30 group"
                >
                  <span>Create Art Now</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 px-4 border-t border-[#282828]/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-[#b5e853] text-sm">
              <Link href="/" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                Art Mode
              </Link>
              <Link href="/math" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                Math Mode
              </Link>
              <a href="https://github.com/manan0209/snippix" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                GitHub
              </a>
            </div>
            
            <div className="mb-4 text-xs text-[#b5e853]/70 space-y-1">
              <p>
                <span className="px-2 py-1 bg-[#8b5cf6]/10 rounded text-[#8b5cf6]">Gallery</span> coming soon
              </p>
            </div>
            
            <p className="text-[#b5e853] text-sm opacity-60">
              Made with <span className="text-red-400">love</span> for Hack Club Summer of Code · 2025
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

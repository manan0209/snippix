"use client";

import { useState } from 'react';
import MathCanvas from '@/components/MathCanvas';
import { DEFAULT_PALETTE, type Palette, PALETTES } from '@/lib/palettes';
import Link from 'next/link';

export default function MathPage() {
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

            {/* Title */}
            <div className="relative">
              <h1 className="text-6xl lg:text-8xl font-extrabold text-[#b5e853] drop-shadow-2xl tracking-widest uppercase mb-6 relative">
                Math Mode
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#8b5cf6] rounded-full animate-pulse"></div>
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-[#b5e853] font-medium max-w-4xl mx-auto leading-relaxed opacity-90 mb-4">
              Transform mathematical equations into stunning animated visualizations
            </p>
            <p className="text-lg text-[#b5e853]/70 font-mono max-w-2xl mx-auto">
              Where mathematics meets art. Every equation becomes a masterpiece.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <span className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full text-[#8b5cf6] text-sm font-mono">
                📊 Graphing
              </span>
              <span className="px-4 py-2 bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-sm font-mono">
                🎬 Animation
              </span>
              <span className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full text-[#8b5cf6] text-sm font-mono">
                💾 Export
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-4 pb-12">
          <div className="w-full max-w-5xl">
            <section className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-[#b5e853] mb-6 tracking-widest uppercase text-center">
                Mathematical Visualization
              </h2>
              
              <MathCanvas palette={selectedPalette.colors} />
            </section>

            {/* Quick Guide */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-4">
                <h3 className="text-[#b5e853] font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Quick Start
                </h3>
                <p className="text-[#b5e853]/70 text-sm">
                  Choose a function type, enter an equation, and watch it come to life with animation.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-4">
                <h3 className="text-[#b5e853] font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">📐</span>
                  Function Types
                </h3>
                <p className="text-[#b5e853]/70 text-sm">
                  Trigonometric, polynomial, exponential, logarithmic, parametric, and polar equations.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-4">
                <h3 className="text-[#b5e853] font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  Animation
                </h3>
                <p className="text-[#b5e853]/70 text-sm">
                  Use the "time" variable to create time-based animations and export as PNG.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 px-4 border-t border-[#282828]/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-[#b5e853] text-sm">
              <Link href="/" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                Art Mode
              </Link>
              <Link href="/gallery" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                Gallery (Coming Soon)
              </Link>
              <a href="https://github.com/manan0209/snippix" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                GitHub
              </a>
            </div>
            
            <div className="mb-4 text-xs text-[#b5e853]/70 space-y-1">
              <p>
                <span className="px-2 py-1 bg-[#8b5cf6]/10 rounded text-[#8b5cf6]">Math</span> visualization engine
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

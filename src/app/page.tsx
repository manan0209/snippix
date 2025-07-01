"use client";

import ArtCanvas from "@/components/ArtCanvas";
import CodeInput from "@/components/CodeInput";
import DecodeArtModal from "@/components/DecodeArtModal";
import DownloadButton from "@/components/DownloadButton";
import { type ArtConfig } from "@/lib/artGenerator";
import { type Palette } from "@/lib/palettes";
import { useRef, useState } from "react";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export default function Home() {
  const [submitted, setSubmitted] = useState<{
    code: string;
    palette: Palette;
    pixelSize: number;
  } | null>(null);
  const [isDecodeModalOpen, setIsDecodeModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCodeSubmit = (code: string, palette: Palette, pixelSize: number) => {
    setSubmitted({ code, palette, pixelSize });
  };

  const handleCodeDecoded = (code: string) => {
    // You could auto-fill the code input or show it in a modal
    console.log('Decoded code:', code);
    // For now, just log it. In the future, you might want to update the code input
  };

  const artConfig: ArtConfig | null = submitted ? {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    pixelSize: submitted.pixelSize,
    colors: submitted.palette.colors,
  } : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#1a1a1a] to-[#18181b] font-mono">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYjVlODUzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="text-center py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl lg:text-8xl font-extrabold text-[#b5e853] drop-shadow-2xl tracking-widest uppercase mb-4">
              Snippix
            </h1>
            <p className="text-xl lg:text-2xl text-[#b5e853] font-medium max-w-3xl mx-auto leading-relaxed opacity-90">
              Transform your code into stunning pixel art. Every snippet becomes unique, beautiful, and shareable.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <span className="px-4 py-2 bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-sm font-mono">
                Any Language
              </span>
              <span className="px-4 py-2 bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-sm font-mono">
                Customizable Art
              </span>
              <span className="px-4 py-2 bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-sm font-mono">
                PNG Download
              </span>
              <button
                onClick={() => setIsDecodeModalOpen(true)}
                className="px-4 py-2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 rounded-full text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/30 transition-colors"
              >
                (upcoming): Decode Art
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-4 pb-12">
          <div className="w-full max-w-6xl space-y-12">
            {/* Code Input Section */}
            <section>
              <CodeInput onSubmit={handleCodeSubmit} />
            </section>

            {/* Generated Art Section */}
            {submitted && artConfig && (
              <section className="text-center">
                <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-[#b5e853] mb-6 tracking-widest uppercase">
                    Your Pixel Art
                  </h2>
                  
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <ArtCanvas 
                        ref={canvasRef}
                        code={submitted.code}
                        config={artConfig}
                      />
                      
                      {/* Code info overlay */}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-left">
                        <div className="text-[#b5e853] text-xs font-mono space-y-1">
                          <div>{submitted.code.length} chars</div>
                          <div>{submitted.code.split('\n').length} lines</div>
                          <div>{submitted.palette.name}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center">
                      <DownloadButton 
                        canvasRef={canvasRef}
                        filename="snippix-art.png"
                      />
                      <button
                        onClick={() => handleCodeSubmit(submitted.code, submitted.palette, submitted.pixelSize)}
                        className="px-6 py-3 border border-[#b5e853] text-[#b5e853] rounded-lg font-mono tracking-widest uppercase hover:bg-[#b5e853] hover:text-[#18181b] transition-colors"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 px-4 border-t border-[#282828]/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-[#b5e853] text-sm">
              <a href="https://github.com/manan0209" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                GitHub
              </a>
              <a href="https://hackclub.com/" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
                Hack Club
              </a>
            </div>
            
            {/* Version info */}
            <div className="mb-4 text-xs text-[#b5e853]/70 space-y-1">
              <p>
                <span className="px-2 py-1 bg-[#b5e853]/10 rounded">v1.0</span> Simple & Awesome Code Art Generator
              </p>
              <p>
                <span className="px-2 py-1 bg-[#8b5cf6]/10 rounded text-[#8b5cf6]">v2.0 Coming Soon</span> Code Embedding & Encryption
              </p>
            </div>
            
            <p className="text-[#b5e853] text-sm opacity-60">
              Made with <span className="text-pink-400">♥</span> for Hack Club Summer of Code · 2025
            </p>
          </div>
        </footer>
      </div>

      {/* Decode Modal */}
      <DecodeArtModal
        isOpen={isDecodeModalOpen}
        onClose={() => setIsDecodeModalOpen(false)}
        onCodeDecoded={handleCodeDecoded}
      />
    </div>
  );
}

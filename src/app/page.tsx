"use client";

import ArtCanvas from "@/components/ArtCanvas";
import CodeInput from "@/components/CodeInput";
import DecodeArtModal from "@/components/DecodeArtModal";
import DownloadButton from "@/components/DownloadButton";
import { type ArtConfig } from "@/lib/artGenerator";
import { DEFAULT_PALETTE, type Palette, PALETTES } from "@/lib/palettes";
import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const OPTIMAL_PIXEL_SIZE = 12; // Optimal size for art generation (doesn't affect embedding)

export default function Home() {
  const [submitted, setSubmitted] = useState<{
    code: string;
    palette: Palette;
  } | null>(null);
  const [isDecodeModalOpen, setIsDecodeModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enableEmbedding, setEnableEmbedding] = useState(true);
  const [useEncryption, setUseEncryption] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [heartCount, setHeartCount] = useState(0);
  const [personalHearts, setPersonalHearts] = useState(0);
  const [isHeartLoading, setIsHeartLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load global heart count and personal count on component mount
  useEffect(() => {
    // Load personal count from localStorage
    const savedPersonalHearts = localStorage.getItem('snippix-personal-hearts');
    if (savedPersonalHearts) {
      setPersonalHearts(parseInt(savedPersonalHearts, 10) || 0);
    }

    // Load global count from API
    fetchGlobalHearts();
  }, []);

  const fetchGlobalHearts = async () => {
    try {
      const response = await fetch('/api/hearts');
      const data = await response.json();
      setHeartCount(data.count || 0);
    } catch {
      console.log('Could not fetch global hearts');
      setHeartCount(42); // Fallback number
    }
  };

  const handleHeartClick = async () => {
    if (isHeartLoading) return;
    
    setIsHeartLoading(true);
    
    try {
      // Increment global count via API
      const response = await fetch('/api/hearts', { method: 'POST' });
      const data = await response.json();
      setHeartCount(data.count || heartCount + 1);
      
      // Increment personal count locally
      const newPersonalCount = personalHearts + 1;
      setPersonalHearts(newPersonalCount);
      localStorage.setItem('snippix-personal-hearts', newPersonalCount.toString());
      
    } catch {
      console.log('Could not increment hearts');
      // Fallback to local increment
      setHeartCount(prev => prev + 1);
      const newPersonalCount = personalHearts + 1;
      setPersonalHearts(newPersonalCount);
      localStorage.setItem('snippix-personal-hearts', newPersonalCount.toString());
    } finally {
      setIsHeartLoading(false);
    }
  };

  const handleCodeSubmit = async (code: string) => {
    setIsGenerating(true);
    setSubmitted({ code, palette: selectedPalette });
    setTimeout(() => setIsGenerating(false), 100);
  };

  // Update art when palette changes if code is already submitted
  const handlePaletteChange = () => {
    const currentIndex = PALETTES.findIndex(p => p.name === selectedPalette.name);
    const nextIndex = (currentIndex + 1) % PALETTES.length;
    const newPalette = PALETTES[nextIndex];
    setSelectedPalette(newPalette);
    
    // If we have submitted code, update the art with the new palette
    if (submitted) {
      setSubmitted({ ...submitted, palette: newPalette });
    }
  };

  const handleCodeDecoded = (code: string) => {
    console.log('Decoded code:', code);
  };

  const artConfig: ArtConfig | null = submitted ? {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    pixelSize: OPTIMAL_PIXEL_SIZE,
    colors: submitted.palette.colors,
  } : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#1a1a1a] to-[#18181b] font-mono">
     <div className="fixed top-4 left-4 z-50">
          <a
            href="https://github.com/manan0209/snippix"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-[#18181b]/80 backdrop-blur-sm border border-[#b5e853]/20 rounded-lg text-[#b5e853] text-xs font-mono hover:border-[#b5e853]/40 hover:bg-[#b5e853]/5 transition-all group"
          >
            <svg 
              className="w-4 h-4 fill-current" 
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="group-hover:text-[#d6ff7f] transition-colors">Star on GitHub</span>
            <svg 
              className="w-3 h-3 fill-current opacity-60 group-hover:opacity-100 transition-opacity" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </a>
        </div>
        
        {/* Global Heart Counter */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleHeartClick}
            disabled={isHeartLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[#18181b]/80 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-400 text-xs font-mono hover:border-red-400/60 hover:bg-red-400/5 transition-all group disabled:opacity-50"
            title={`Global community love: ${heartCount.toLocaleString()} hearts! You've given ${personalHearts} hearts.`}
          >
            <svg 
              className={`w-4 h-4 fill-current group-hover:scale-110 transition-transform ${isHeartLoading ? 'animate-pulse' : ''}`}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <div className="flex flex-col items-start leading-tight">
              <span className="group-hover:text-red-300 transition-colors font-bold">
                {heartCount.toLocaleString()}
              </span>
              {personalHearts > 0 && (
                <span className="text-[10px] text-red-400/70">
                  You: {personalHearts}
                </span>
              )}
            </div>
          </button>
        </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYjVlODUzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="text-center py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <h1 className="text-7xl lg:text-9xl font-extrabold text-[#b5e853] drop-shadow-2xl tracking-widest uppercase mb-6 relative">
                Snippix
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#b5e853] rounded-full animate-pulse"></div>
              </h1>
            </div>
            <p className="text-2xl lg:text-3xl text-[#b5e853] font-medium max-w-4xl mx-auto leading-relaxed opacity-90 mb-4">
              Transform your code into stunning pixel art with hidden code embedding and encryption
            </p>
            <p className="text-lg text-[#b5e853]/70 font-mono max-w-2xl mx-auto">
              Where art meets cryptography. Every snippet becomes a masterpiece.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={handlePaletteChange}
                className="px-4 py-2 bg-[#8b5cf6]/10 border-2 border-[#8b5cf6]/40 rounded-full text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 transition-all group relative shadow-lg hover:shadow-[#8b5cf6]/20"
                title={`Click to change palette (${PALETTES.length} available)`}
              >
                <span className="flex items-center gap-2">
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
                </span>
              </button>
              <span className="px-4 py-2 bg-[#b5e853]/10 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-sm font-mono">
                Code Art
              </span>
              <button
                onClick={() => setEnableEmbedding(!enableEmbedding)}
                className={`px-4 py-2 border-2 rounded-full text-sm font-mono transition-all shadow-lg ${
                  enableEmbedding 
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#8b5cf6] shadow-[#8b5cf6]/20'  
                    : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/40 text-[#8b5cf6] hover:bg-[#8b5cf6]/15 hover:border-[#8b5cf6]/60 hover:shadow-[#8b5cf6]/20'
                }`}
              >
                {enableEmbedding ? 'Embedding ON' : 'Hide your code'}
              </button>
              <button
                onClick={() => {
                  if (!enableEmbedding) {
                    setEnableEmbedding(true);
                  }
                  setUseEncryption(!useEncryption);
                  if (!useEncryption) {
                    setShowKeyInput(true);
                  } else {
                    setShowKeyInput(false);
                    setEncryptionKey('');
                  }
                }}
                className={`px-4 py-2 border-2 rounded-full text-sm font-mono transition-all shadow-lg ${
                  useEncryption 
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#8b5cf6] shadow-[#8b5cf6]/20' 
                    : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/40 text-[#8b5cf6] hover:bg-[#8b5cf6]/15 hover:border-[#8b5cf6]/60 hover:shadow-[#8b5cf6]/20'
                }`}
              >
                {useEncryption ? '🔐 Encrypted' : '🔐 Encrypt'}
              </button>
              <button
                onClick={() => setIsDecodeModalOpen(true)}
                className="px-4 py-2 bg-[#8b5cf6]/10 border-2 border-[#8b5cf6]/40 rounded-full text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 transition-all shadow-lg hover:shadow-[#8b5cf6]/20"
              >
                🔓 Decode Art
              </button>
            </div>
            
            {showKeyInput && useEncryption && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-[#18181b]/80 backdrop-blur-sm border border-[#8b5cf6]/30 rounded-lg p-4">
                  <label className="block text-[#8b5cf6] text-sm font-mono mb-2 font-medium">
                    🗝️ Encryption key
                  </label>
                  <input
                    type="password"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    placeholder="Enter a key to encrypt data..."
                    className="w-full bg-[#0a0a0a] border border-[#8b5cf6]/30 rounded-lg px-4 py-3 text-[#8b5cf6] text-sm focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 font-mono transition-all"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setShowKeyInput(false);
                      }}
                      className="flex-1 px-3 py-2 bg-[#8b5cf6] text-white rounded font-mono text-sm hover:bg-[#7c3aed] transition-colors"
                    >
                      Set Key
                    </button>
                    <button
                      onClick={() => {
                        setUseEncryption(false);
                        setShowKeyInput(false);
                        setEncryptionKey('');
                      }}
                      className="px-3 py-2 border border-[#8b5cf6]/30 text-[#8b5cf6] rounded font-mono text-sm hover:bg-[#8b5cf6]/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-[#8b5cf6]/70 mt-2 font-mono">
                    💡 Remember and share this key with the receiver - you&apos;ll need it to decode your art later
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 pb-12">
          <div className="w-full max-w-6xl space-y-12">
            <section>
              <CodeInput onSubmit={handleCodeSubmit} submitted={!!submitted} />
            </section>

            {submitted && artConfig && (
              <section className="text-center">
                <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-[#b5e853] mb-6 tracking-widest uppercase">
                    Your Pixel Art
                  </h2>
                  
                  <div className="flex flex-col items-center space-y-6">
                    {isGenerating && (
                      <div className="flex flex-col items-center gap-3 text-[#8b5cf6] font-mono">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin w-5 h-5 border-2 border-[#8b5cf6] border-t-transparent rounded-full"></div>
                          <span>
                            {enableEmbedding ? 'Generating art with embedded code...' : 'Generating art...'}
                          </span>
                        </div>
                        {enableEmbedding && submitted && submitted.code.length > 50000 && (
                          <div className="text-sm text-[#8b5cf6]/70">
                            Large content detected - this may take a moment...
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="relative">
                      <ArtCanvas 
                        ref={canvasRef}
                        code={submitted.code}
                        config={artConfig}
                        embedOptions={enableEmbedding ? {
                          useEncryption: useEncryption && encryptionKey.length > 0,
                          encryptionKey: useEncryption ? encryptionKey : undefined
                        } : undefined}
                      />
                      
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-left">
                        <div className="text-[#b5e853] text-xs font-mono space-y-1">
                          <div>{submitted.code.length} chars</div>
                          <div>{submitted.code.split('\n').length} lines</div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: submitted.palette.colors[0] }}
                            />
                            {submitted.palette.name}
                          </div>
                        </div>
                      </div>

                      {isGenerating && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <div className="text-center text-[#b5e853]">
                            <div className="text-4xl mb-4 animate-pulse">...</div>
                            <div className="font-mono text-lg">
                              {enableEmbedding ? 'Embedding code...' : 'Generating art...'}
                            </div>
                            <div className="text-sm opacity-70 mt-2">
                              {enableEmbedding && useEncryption ? 'Encrypting & hiding code' : 'Creating pixel patterns'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center">
                      <DownloadButton 
                        canvasRef={canvasRef}
                        filename="snippixbymnn.png"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>

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
            
            <div className="mb-4 text-xs text-[#b5e853]/70 space-y-1">
              <p>
                <span className="px-2 py-1 bg-[#8b5cf6]/10 rounded text-[#8b5cf6]">Encrypt</span> data into images
              </p>
            </div>
            
            <p className="text-[#b5e853] text-sm opacity-60">
              Made with <span className="text-red-400">love</span> for Hack Club Summer of Code · 2025
            </p>
          </div>
        </footer>
      </div>

      <DecodeArtModal
        isOpen={isDecodeModalOpen}
        onClose={() => setIsDecodeModalOpen(false)}
        onCodeDecoded={handleCodeDecoded}
      />
    </div>
  );
}

"use client";

import ArtCanvas from "@/components/ArtCanvas";
import ArtAnimation3D from "@/components/ArtAnimation3D";
import CodeInput from "@/components/CodeInput";
import DecodeArtModal from "@/components/DecodeArtModal";
import DownloadButton from "@/components/DownloadButton";
import ShareToGalleryButton from "@/components/ShareToGalleryButton";
import { type ArtConfig } from "@/lib/artGenerator";
import { DEFAULT_PALETTE, type Palette, PALETTES } from "@/lib/palettes";
import { useEffect, useRef, useState } from "react";
import Link from 'next/link';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const OPTIMAL_PIXEL_SIZE = 12; // Optimal size for art generation (doesn't affect embedding)

// Version system for resetting personal counts globally
const HEARTS_VERSION = "v2"; // Change this to reset everyone's personal counts
const HEARTS_KEY = `snippix-personal-hearts-${HEARTS_VERSION}`;
const EASTER_EGG_KEY = `snippix-easter-egg-clicks-${HEARTS_VERSION}`;

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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load global heart count and personal count on component mount
  useEffect(() => {
    // Load personal count from localStorage with version
    const savedPersonalHearts = localStorage.getItem(HEARTS_KEY);
    if (savedPersonalHearts) {
      setPersonalHearts(parseInt(savedPersonalHearts, 10) || 0);
    }

    // Load easter egg clicks from localStorage with version
    const savedEasterEggClicks = localStorage.getItem(EASTER_EGG_KEY);
    if (savedEasterEggClicks) {
      setEasterEggClicks(parseInt(savedEasterEggClicks, 10) || 0);
    }

    // Clean up old localStorage entries from previous versions
    ['snippix-personal-hearts', 'snippix-easter-egg-clicks', 'snippix-personal-hearts-v1', 'snippix-easter-egg-clicks-v1'].forEach(oldKey => {
      if (oldKey !== HEARTS_KEY && oldKey !== EASTER_EGG_KEY) {
        localStorage.removeItem(oldKey);
      }
    });

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
      localStorage.setItem(HEARTS_KEY, newPersonalCount.toString());

      // Easter egg logic - track total clicks
      const newEasterEggClicks = easterEggClicks + 1;
      setEasterEggClicks(newEasterEggClicks);
      localStorage.setItem(EASTER_EGG_KEY, newEasterEggClicks.toString());

      // Show easter egg after 3 clicks
      if (newEasterEggClicks === 3) {
        setShowEasterEgg(true);
        // Auto-hide after 10 seconds
        setTimeout(() => setShowEasterEgg(false), 10000);
      }
      
    } catch {
      console.log('Could not increment hearts');
      // Fallback to local increment
      setHeartCount(prev => prev + 1);
      const newPersonalCount = personalHearts + 1;
      setPersonalHearts(newPersonalCount);
      localStorage.setItem(HEARTS_KEY, newPersonalCount.toString());

      // Easter egg logic for fallback too
      const newEasterEggClicks = easterEggClicks + 1;
      setEasterEggClicks(newEasterEggClicks);
      localStorage.setItem(EASTER_EGG_KEY, newEasterEggClicks.toString());

      if (newEasterEggClicks === 3) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 10000);
      }
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
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
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
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="group-hover:text-[#d6ff7f] transition-colors">Star on GitHub</span>
            <svg 
              className="w-3 h-3 fill-current opacity-60 group-hover:opacity-100 transition-opacity" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </a>

          {/* Math Mode button */}
          <div className="relative group">
            <Link
              href="/math"
              className="flex items-center gap-1 px-3 py-2 bg-[#18181b]/80 backdrop-blur-sm border border-[#8b5cf6]/20 rounded-lg text-[#8b5cf6] text-xs font-mono hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/5 transition-all group"
              title="Math Visualization Mode"
              aria-label="Math Visualization Mode"
            >
              <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="ml-1 font-semibold">Math</span>
            </Link>
          </div>
          {/* Gallery button */}
              <div className="relative group">
                <Link
                  href="/gallery"
                  className="flex items-center gap-1 px-3 py-2 bg-[#18181b]/80 backdrop-blur-sm border border-[#8b5cf6]/20 rounded-lg text-[#8b5cf6] text-xs font-mono hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/5 transition-all group"
                  title="Community Art Gallery"
                  aria-label="Community Art Gallery"
                >
                  <svg className="w-4 h-4 text-[#b5e853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="ml-1 font-semibold">Code Art Gallery</span>
                </Link>
                
              </div>
        </div>      
         
        
          {/* Global Heart Counter */}
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
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
          {/* Video button with label and tooltip */}
          <div className="relative group">
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 bg-[#18181b]/80 border border-[#b5e853]/30 rounded-full text-[#b5e853] text-xs font-mono hover:bg-[#b5e853]/10 hover:border-[#b5e853]/60 transition-all shadow group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e853]"
              title="Watch Snippix Demo"
              aria-label="Watch Snippix Demo"
              tabIndex={0}
              type="button"
            >
              <svg className="w-4 h-4 text-[#b5e853]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.018 14L14.41 9.053a1 1 0 000-1.894L4.018 2A1 1 0 003 2.894v10.212A1 1 0 004.018 14z" />
              </svg>
              <span className="ml-1 font-semibold">Demo</span>
            </button>
          </div>
          
          {/* Contact button - appears after easter egg unlocked */}
          {easterEggClicks >= 7 && (
            <div className="relative group">
              <button
                onClick={() => setShowEasterEgg(true)}
                className="flex items-center gap-1 px-3 py-1 bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 rounded-full text-[#8b5cf6] text-xs font-mono hover:bg-[#8b5cf6]/30 hover:border-[#8b5cf6]/70 transition-all shadow group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] animate-fadeIn"
                title="Thanks - You unlocked this!"
                aria-label="Easter Egg Unlocked"
                tabIndex={0}
                type="button"
              >
                <svg className="w-4 h-4 text-[#8b5cf6]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></div>
              </button>
            </div>
          )}
      {/* Video Modal with heading, animation, close on background click, and responsive aspect ratio */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVideoModalOpen(false);
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-[#18181b] border border-[#b5e853]/30 rounded-xl shadow-2xl p-4 w-full max-w-xs sm:max-w-sm md:max-w-lg relative animate-modalIn"
            style={{ boxShadow: '0 8px 40px 0 #b5e85333' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#b5e853] mb-3 text-center font-mono tracking-wide">Snippix Demo</h3>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-2 right-2 text-[#b5e853] bg-[#18181b] border border-[#b5e853]/30 rounded-full p-1 hover:bg-[#b5e853]/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e853]"
              aria-label="Close video modal"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full aspect-video rounded overflow-hidden bg-black">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/aBpQTa6OvZM"
                title="Snippix Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded"
              ></iframe>
            </div>
          </div>
        </div>
      )}

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
              <div className="relative flex flex-col items-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none z-10">
                  <span className="text-xs font-mono text-[#18181b] bg-[#b5e853] px-2 py-1 rounded border border-[#b5e853] shadow-lg mb-0.5 animate-pulse drop-shadow-lg" style={{filter:'brightness(1.2)'}}>Try Me!</span>
                  <svg className="w-4 h-4 text-[#b5e853] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginTop:'-2px'}} aria-hidden="true" focusable="false">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l-4-4m4 4l4-4" />
                  </svg>
                </div>
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
                  {useEncryption ? '🔐 Encrypted with key' : '🔐 Encrypt with key'}
                </button>
              </div>
              <div className="relative flex flex-col items-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none z-10">
                  <span className="text-xs font-mono text-[#18181b] bg-[#b5e853] px-2 py-1 rounded border border-[#b5e853] shadow-lg mb-0.5 animate-pulse drop-shadow-lg" style={{filter:'brightness(1.2)'}}>Try Me!</span>
                  <svg className="w-4 h-4 text-[#b5e853] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginTop:'-2px'}} aria-hidden="true" focusable="false">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l-4-4m4 4l4-4" />
                  </svg>
                </div>
                <button
                  onClick={() => setIsDecodeModalOpen(true)}
                  className="px-4 py-2 bg-[#8b5cf6]/10 border-2 border-[#8b5cf6]/40 rounded-full text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/60 transition-all shadow-lg hover:shadow-[#8b5cf6]/20"
                >
                  🔓 Decode Art
                </button>
              </div>
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
                    
                    <div className="flex flex-col items-center relative">
                      {/* Try Me tooltip/arrow above palette button, slightly left from right edge */}
                      <div className="mb-2 w-full flex justify-end pr-5 sm:pr-8 md:pr-10 lg:pr-10 xl:pr-5">
                        <div className="flex flex-col items-center pointer-events-none select-none">
                          <span className="text-xs font-mono text-[#18181b] bg-[#b5e853] px-2 py-1 rounded border border-[#b5e853] shadow-lg mb-0.5 animate-pulse drop-shadow-lg" style={{filter:'brightness(1.2)'}}>Try Me!</span>
                          <svg className="w-4 h-4 text-[#b5e853] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginTop:'-2px'}} aria-hidden="true" focusable="false">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l-4-4m4 4l4-4" />
                          </svg>
                        </div>
                      </div>
                      <div className={`relative w-full ${showAnimation ? 'grid grid-cols-2 gap-4' : 'flex justify-end'}`}>
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
                          {/* Floating palette selector button */}
                          <button
                            onClick={handlePaletteChange}
                            title={`Change palette (${PALETTES.length} available)`}
                            className="absolute top-3 right-3 z-20 rounded-full p-2 flex items-center gap-1 shadow-lg border border-white/30 hover:scale-105 transition-all group"
                            style={{ minWidth: 32, minHeight: 32, backgroundColor: selectedPalette.colors[0], color: '#18181b', borderColor: selectedPalette.colors[1] || '#b5e853' }}
                            aria-label="Change Palette"
                          >
                            <div className="flex gap-0.5">
                              {selectedPalette.colors.slice(0, 3).map((color, i) => (
                                <div
                                  key={i}
                                  className="w-3 h-3 rounded-full border border-white/40"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* 3D Animation toggle button */}
                          <button
                            onClick={() => setShowAnimation(!showAnimation)}
                            title={showAnimation ? "Hide 3D Animation" : "Show 3D Animation"}
                            className={`absolute top-3 left-3 z-20 rounded-full p-2 flex items-center gap-1 shadow-lg border hover:scale-105 transition-all group ${
                              showAnimation 
                                ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' 
                                : 'bg-black/70 border-white/30 text-[#8b5cf6]'
                            }`}
                            aria-label="Toggle 3D Animation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* 3D Animation panel */}
                        {showAnimation && (
                          <div className="relative">
                            <ArtAnimation3D
                              sourceCanvas={canvasRef.current}
                              palette={selectedPalette.colors}
                              isVisible={showAnimation}
                              onExportComplete={(blob: Blob) => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'snippix-3d-animation.gif';
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            />
                          </div>
                        )}
                      </div>
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
                      <ShareToGalleryButton 
                        canvasRef={canvasRef}
                        code={submitted.code}
                        palette={submitted.palette}
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

      {/* Easter Egg Modal - Shows after 3 heart clicks */}
      {showEasterEgg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowEasterEgg(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-gradient-to-br from-[#18181b] via-[#8b5cf6]/10 to-[#18181b] border-2 border-[#8b5cf6]/60 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-modalIn"
            style={{ boxShadow: '0 16px 64px 0 #8b5cf680' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Animated hearts background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse text-red-400/20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  <svg 
                    className={`w-${3 + Math.floor(Math.random() * 3)} h-${3 + Math.floor(Math.random() * 3)} fill-current`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEasterEgg(false)}
              className="absolute top-3 right-3 text-[#8b5cf6] hover:text-[#b5e853] transition-colors z-10"
              aria-label="Close easter egg"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center relative z-10">
              <div className="text-6xl mb-4 animate-bounce flex justify-center">
                <svg className="w-16 h-16 fill-current text-red-400 animate-pulse" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#8b5cf6] mb-3 font-mono tracking-wide">
                WOW! Such Love! <svg className="inline w-6 h-6 fill-current text-[#8b5cf6]" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </h3>
              <p className="text-red-400 mb-6 leading-relaxed">
                You&apos;ve clicked the heart <span className="font-bold text-[#8b5cf6]">{easterEggClicks} times</span>! 
                Your immense love means the world to me!
              </p>
              
              <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-[#8b5cf6] mb-2 font-mono">
                  Reach out and we&apos;ll chat:
                </p>
                <div className="space-y-2">
                  <a 
                    href="https://wa.me/918571824154"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#7c3aed] transition-colors font-mono text-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                    </svg>
                    +91 85718 24154
                  </a>
                  <p className="text-xs text-[#8b5cf6]/70">
                    Click to chat on WhatsApp!
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#b5e853]/70 space-y-1">
                <p>Thanks for being an amazing supporter!</p>
                <p> Your love keeps Snippix growing!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <DecodeArtModal
        isOpen={isDecodeModalOpen}
        onClose={() => setIsDecodeModalOpen(false)}
        onCodeDecoded={handleCodeDecoded}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimationEngine, isWebGLAvailable } from '@/lib/animationEngine';
import { ANIMATION_STYLES, type AnimationStyle, type ExportOptions, type Animation3DConfig } from '@/types/animation';

interface ArtAnimation3DProps {
  sourceCanvas: HTMLCanvasElement | null;
  palette: string[];
  isVisible: boolean;
  onExportComplete?: (blob: Blob) => void;
}

export default function ArtAnimation3D({ 
  sourceCanvas, 
  palette, 
  isVisible,
  onExportComplete 
}: ArtAnimation3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AnimationEngine | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AnimationStyle>(ANIMATION_STYLES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  // Removed unused variable 'exportProgress'

  // Check WebGL support on mount
  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  // Initialize animation engine
  useEffect(() => {
    if (!canvasRef.current || !sourceCanvas || !webglSupported || !isVisible) return;

    const config: Animation3DConfig = {
      canvasWidth: 600,
      canvasHeight: 400,
      animationStyle: selectedStyle,
      palette,
      duration: 5000,
      fps: 30
    };

    try {
      engineRef.current = new AnimationEngine(canvasRef.current, config);
      
      // Extract pixels from source canvas and create 3D meshes
      const pixels = AnimationEngine.extractPixelData(sourceCanvas);
      engineRef.current.createPixelMeshes(pixels);
      
      // Start animation if playing
      if (isPlaying) {
        engineRef.current.startAnimation();
      }
    } catch (error) {
      console.error('Failed to initialize animation engine:', error);
      setWebglSupported(false);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [sourceCanvas, selectedStyle, palette, isVisible, isPlaying, webglSupported]);

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current.stopAnimation();
    } else {
      engineRef.current.startAnimation();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle style change
  const handleStyleChange = useCallback(() => {
    const currentIndex = ANIMATION_STYLES.findIndex(style => style.id === selectedStyle.id);
    const nextIndex = (currentIndex + 1) % ANIMATION_STYLES.length;
    setSelectedStyle(ANIMATION_STYLES[nextIndex]);
  }, [selectedStyle]);

  // Export animation as GIF
  const handleExport = useCallback(async () => {
    if (!engineRef.current || isExporting) return;

    setIsExporting(true);
  // setExportProgress(0); // Removed since the variable was removed

    const exportOptions: ExportOptions = {
      format: 'gif',
      duration: 3, // 3 seconds
      fps: 30,
      quality: 'medium',
      width: 600,
      height: 400
    };

    try {
      const blob = await engineRef.current.exportAsGif(exportOptions);
      onExportComplete?.(blob);
      
      // Auto-download the GIF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snippix-animation-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export animation:', error);
    } finally {
      setIsExporting(false);
  // setExportProgress(0); // Removed since the variable was removed
    }
  }, [isExporting, onExportComplete]);

  if (!webglSupported) {
    return (
      <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-8 text-center">
        <div className="text-[#8b5cf6] mb-4">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-bold mb-2">WebGL Not Supported</h3>
          <p className="text-sm opacity-70">
            Your browser doesn&apos;t support WebGL, which is required for 3D animations.
            <br />
            Try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  if (!sourceCanvas) {
    return (
      <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-8 text-center">
        <div className="text-[#b5e853] opacity-50">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h2V6H9zm4 0v10h2V6h-2z" />
          </svg>
          <p className="text-sm font-mono">Generate some art first to see the 3D animation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-4">
      {/* Animation Controls */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-all ${
              isPlaying 
                ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                : 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 text-[#8b5cf6] hover:bg-[#8b5cf6]/20'
            }`}
            disabled={isExporting}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={handleStyleChange}
            className="px-3 py-2 bg-[#b5e853]/10 border border-[#b5e853]/40 rounded-lg text-[#b5e853] text-sm font-mono hover:bg-[#b5e853]/20 transition-all"
            disabled={isExporting}
            title={`Change animation style (${ANIMATION_STYLES.length} available)`}
          >
            <span className="flex items-center gap-2">
              {selectedStyle.name}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
          </button>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || !engineRef.current}
          className="flex items-center gap-2 px-3 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 rounded-lg text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full"></div>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export GIF
            </>
          )}
        </button>
      </div>

      {/* Style Description */}
      <div className="mb-4">
        <p className="text-xs text-[#b5e853]/70 font-mono">
          {selectedStyle.description}
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="relative rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto bg-[#18181b] border border-[#282828]/50 rounded-lg"
          style={{ maxHeight: '400px', aspectRatio: '600/400' }}
        />
        
        {!isPlaying && !isExporting && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-lg font-mono hover:bg-[#7c3aed] transition-all shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Animation
            </button>
          </div>
        )}

        {isExporting && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
            <div className="text-center text-[#8b5cf6]">
              <div className="animate-spin w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="font-mono text-lg mb-2">Exporting GIF...</div>
              <div className="text-sm opacity-70">This may take a moment</div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Info */}
      <div className="mt-4 pt-4 border-t border-[#282828]/50">
        <div className="text-xs text-[#b5e853]/70 font-mono space-y-1">
          <div>Style: {selectedStyle.name}</div>
          <div>Resolution: 600&times;400</div>
          <div>Format: GIF (3 seconds, 30fps)</div>
        </div>
      </div>
    </div>
  );
}

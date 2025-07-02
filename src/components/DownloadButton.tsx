import { downloadCanvas } from '@/lib/artGenerator';
import { type EmbedOptions } from '@/lib/steganography';
import React, { useState } from 'react';

interface DownloadButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  filename?: string;
  code?: string;
  embedOptions?: EmbedOptions;
}

export default function DownloadButton({ canvasRef, filename, code, embedOptions }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalFilename = filename || `snippix-art-${timestamp}.png`;
      
      downloadCanvas(canvasRef.current, finalFilename);
    } catch (error) {
      console.error('Download failed:', error);
      downloadCanvas(canvasRef.current, filename);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="mt-4 px-4 py-2 bg-[#b5e853] text-[#18181b] rounded font-bold font-mono tracking-widest uppercase hover:bg-[#d6ff7f] transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? 'Downloading...' : 'Download Art'}
    </button>
  );
}

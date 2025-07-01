import { downloadCanvas } from '@/lib/artGenerator';
import React from 'react';

interface DownloadButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  filename?: string;
}

export default function DownloadButton({ canvasRef, filename }: DownloadButtonProps) {
  const handleDownload = () => {
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, filename);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-4 px-4 py-2 bg-[#b5e853] text-[#18181b] rounded font-bold font-mono tracking-widest uppercase hover:bg-[#d6ff7f] transition"
    >
      Download Art
    </button>
  );
}

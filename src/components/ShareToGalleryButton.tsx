import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ShareToGalleryButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  code: string;
  palette: { name: string; colors: string[] };
}

export default function ShareToGalleryButton({ canvasRef, code, palette }: ShareToGalleryButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const handleShare = async () => {
    setIsSharing(true);
    setError(null);
    try {
      if (!canvasRef.current) throw new Error('No art to share');
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to get image');
      // Upload to Vercel Blob (or fallback: base64 as data URL)
      // For demo, use base64 data URL
      const artUrl = canvasRef.current.toDataURL('image/png');
      // Prepare payload
      const payload = {
        id: uuidv4(),
        artUrl,
        palette: palette.name,
        codeLength: code.length,
        hasEmbedding: true,
        isEncrypted: false,
        hearts: 0,
        createdAt: new Date().toISOString(),
        title: title || undefined,
      };
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to share art');
      setShared(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  if (shared) {
    return (
      <button
        className="mt-4 px-4 py-2 bg-[#8b5cf6] text-white rounded font-bold font-mono tracking-widest uppercase hover:bg-[#7c3aed] transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled
      >
        ✓ Shared to Gallery!
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="mb-2 px-3 py-2 rounded border border-[#8b5cf6]/30 bg-[#18181b] text-[#8b5cf6] font-mono text-sm focus:border-[#8b5cf6] focus:outline-none"
        maxLength={64}
        disabled={isSharing}
      />
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="mt-1 px-4 py-2 bg-[#8b5cf6] text-white rounded font-bold font-mono tracking-widest uppercase hover:bg-[#7c3aed] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSharing ? 'Sharing...' : 'Share to Gallery'}
      </button>
      {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
    </div>
  );
}

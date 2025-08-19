import React, { useState } from 'react';
import Image from 'next/image';

interface ArtCardProps {
  id: string;
  artUrl: string;
  palette: string;
  hearts: number;
  title?: string;
  onHeart: (id: string) => void;
}

export default function ArtCard({ id, artUrl, palette, hearts, title, onHeart }: ArtCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [localHearts, setLocalHearts] = useState(hearts);

  const handleHeart = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setLocalHearts((h) => h + 1);
    await onHeart(id);
    setIsLiking(false);
  };

  return (
    <div className="bg-[#18181b] border border-[#282828] rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-4 transition hover:scale-105 hover:shadow-2xl">
      <div className="w-full aspect-square relative mb-3">
        <Image src={artUrl} alt={title || 'Pixel Art'} fill className="object-contain rounded-lg" />
      </div>
      {title && <div className="font-mono text-[#b5e853] text-sm mb-2 text-center truncate w-full">{title}</div>}
      <button
        onClick={handleHeart}
        disabled={isLiking}
        className="flex items-center gap-1 px-3 py-1 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 rounded-full text-[#8b5cf6] text-xs font-mono hover:bg-[#8b5cf6]/20 transition-all disabled:opacity-50"
        aria-label="Heart this art"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
        <span>{localHearts}</span>
      </button>
    </div>
  );
}

import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { ArtSubmission } from '@/types/animation';

const GALLERY_KEY = 'snippix:gallery:artworks';

export async function POST(
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { id } = await context.params;
  try {
    // Fetch all artworks, handle both string and object entries
    const artworks: ArtSubmission[] = (await kv.lrange(GALLERY_KEY, 0, -1))?.map((a) => {
      if (typeof a === 'string') return JSON.parse(a);
      if (typeof a === 'object' && a !== null) return a;
      return null;
    }).filter(Boolean) || [];
    const idx = artworks.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }
    artworks[idx].hearts = (artworks[idx].hearts || 0) + 1;
    // Update the artwork in KV
    await kv.lset(GALLERY_KEY, idx, JSON.stringify(artworks[idx]));
    return NextResponse.json({ success: true, hearts: artworks[idx].hearts });
  } catch {
    return NextResponse.json({ error: 'Failed to increment hearts' }, { status: 500 });
  }
}
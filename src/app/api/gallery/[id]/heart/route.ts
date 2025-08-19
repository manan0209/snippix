import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { ArtSubmission } from '@/types/animation';

const GALLERY_KEY = 'snippix:gallery:artworks';

export async function POST(
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const id = context.params?.id;
  try {
    // Fetch all artworks
    const artworks: ArtSubmission[] = (await kv.lrange(GALLERY_KEY, 0, -1))?.map((a: string) => JSON.parse(a)) || [];
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
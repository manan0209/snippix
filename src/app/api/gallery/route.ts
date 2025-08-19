import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { ArtSubmission } from '@/types/animation';

const GALLERY_KEY = 'snippix:gallery:artworks';

// GET: List all artworks
export async function GET() {
  try {
    // Fetch all art submissions (stored as a list)
    const rawItems = await kv.lrange(GALLERY_KEY, 0, -1);
    const artworks: ArtSubmission[] = [];
    (rawItems || []).forEach((a, idx) => {
      if (typeof a === 'string') {
        try {
          const art = JSON.parse(a);
          artworks.push(art);
        } catch (err) {
          console.warn('Skipping malformed gallery entry at index', idx, err);
        }
      } else {
        console.warn('Skipping non-string gallery entry at index', idx, a);
      }
    });
    // Sort by most recent
    artworks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ artworks });
  } catch (err) {
    console.error('Gallery GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch gallery', details: String(err) }, { status: 500 });
  }
}

// POST: Add a new artwork
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate required fields
    if (!body.id || !body.artUrl || !body.palette) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newArt: ArtSubmission = {
      ...body,
      hearts: 0,
      createdAt: new Date().toISOString(),
    };
    console.log('Storing artwork:', JSON.stringify(newArt));
    await kv.rpush(GALLERY_KEY, JSON.stringify(newArt));
    return NextResponse.json({ success: true, art: newArt });
  } catch {
    return NextResponse.json({ error: 'Failed to add artwork' }, { status: 500 });
  }
}

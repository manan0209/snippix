import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const HEARTS_KEY = 'snippix:global:hearts';
const DEFAULT_COUNT = 72;

export async function GET() {
  try {
    const count = await kv.get<number>(HEARTS_KEY) ?? DEFAULT_COUNT;
    return NextResponse.json({ 
      count,
      message: 'Community love for Snippix! ❤️'
    });
  } catch (error) {
    console.error('Failed to get heart count:', error);
    // Fallback to default count if KV fails
    return NextResponse.json({ 
      count: DEFAULT_COUNT,
      message: 'Community love for Snippix! ❤️'
    });
  }
}

export async function POST() {
  try {
    // Get current count
    const currentCount = await kv.get<number>(HEARTS_KEY) ?? DEFAULT_COUNT;
    
    // Increment and save back to KV
    const newCount = currentCount + 1;
    await kv.set(HEARTS_KEY, newCount);
    
    return NextResponse.json({ 
      count: newCount,
      message: 'Thank you for showing love! ❤️'
    });
  } catch (error) {
    console.error('Failed to increment heart count:', error);
    return NextResponse.json(
      { error: 'Failed to increment hearts' },
      { status: 500 }
    );
  }
}

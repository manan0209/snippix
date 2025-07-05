import { NextResponse } from 'next/server';

// Simple in-memory store (will persist during server lifetime)
// For production, you'd want to use a database or KV store
let globalHeartCount = 42; // Starting with a nice number for the community

// Store the count in a JSON file for persistence across deployments
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'hearts.json');

function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadHeartCount(): number {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.count || globalHeartCount;
    }
  } catch {
    console.log('Could not load heart count, using default');
  }
  return globalHeartCount;
}

function saveHeartCount(count: number) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify({ count, lastUpdated: new Date().toISOString() }));
  } catch {
    console.log('Could not save heart count');
  }
}

// Initialize count from file
globalHeartCount = loadHeartCount();

export async function GET() {
  return NextResponse.json({ 
    count: globalHeartCount,
    message: 'Community love for Snippix! ❤️'
  });
}

export async function POST() {
  try {
    // Increment the global count
    globalHeartCount += 1;
    
    // Save to file for persistence
    saveHeartCount(globalHeartCount);
    
    return NextResponse.json({ 
      count: globalHeartCount,
      message: 'Thank you for showing love! ❤️'
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to increment hearts' },
      { status: 500 }
    );
  }
}

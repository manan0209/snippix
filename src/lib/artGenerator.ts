import { embedCodeInPixels, type EmbedOptions } from './steganography';

export interface CodeFeatures {
  length: number;
  indent: number;
  symbols: number;
  digits: number;
  upper: number;
  lines: number;
}

export interface ArtConfig {
  width: number;
  height: number;
  pixelSize: number;
  colors: string[];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function extractCodeFeatures(code: string): CodeFeatures {
  const lines = code.split('\n');
  const length = code.length;
  const indent = lines.reduce((acc, l) => acc + (l.match(/^\s+/)?.[0].length || 0), 0) / lines.length;
  const symbols = (code.match(/[^\w\s]/g) || []).length;
  const digits = (code.match(/[0-9]/g) || []).length;
  const upper = (code.match(/[A-Z]/g) || []).length;
  return { length, indent, symbols, digits, upper, lines: lines.length };
}

export function generatePixelArt(
  ctx: CanvasRenderingContext2D,
  code: string,
  config: ArtConfig
): void {
  const { width, height, pixelSize, colors } = config;
  
  // Clear canvas with background color
  ctx.fillStyle = colors[4] || '#18181b';
  ctx.fillRect(0, 0, width, height);

  const features = extractCodeFeatures(code);
  const hash = hashCode(code);
  const cols = Math.floor(width / pixelSize);
  const rows = Math.floor(height / pixelSize);

  // Determine what type of pixel art to generate based on code characteristics
  const artType = determineArtType(features, hash);
  
  switch (artType) {
    case 'creature':
      generateCreatureArt(ctx, config, features, hash, cols, rows);
      break;
    case 'landscape':
      generateLandscapeArt(ctx, config, features, hash, cols, rows);
      break;
    case 'geometric':
      generateGeometricArt(ctx, config, features, hash, cols, rows);
      break;
    case 'cosmic':
      generateCosmicArt(ctx, config, features, hash, cols, rows);
      break;
    default:
      generateAbstractArt(ctx, config, features, hash, cols, rows);
  }

  // Add signature structural elements (these don't interfere with steganography)
  addStructuralElements(ctx, code, features, config, hash);
  
  // CRITICAL FIX: Ensure minimum visibility for sparse patterns
  ensureMinimumVisibility(ctx, config, features, hash, cols, rows);
}

function determineArtType(features: CodeFeatures, hash: number): string {
  const types = ['creature', 'landscape', 'geometric', 'cosmic', 'abstract'];
  
  // Use code characteristics to deterministically choose art type
  let selector = hash;
  if (features.symbols > 50) selector += 1;
  if (features.lines > 20) selector += 2;
  if (features.length > 1000) selector += 3;
  if (features.indent > 2) selector += 4;
  
  return types[selector % types.length];
}

function generateCreatureArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  
  // Generate creature-like symmetrical patterns
  const size = Math.min(cols, rows) * 0.4;
  
  for (let layer = 0; layer < 3; layer++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create creature body with symmetry
        let shouldDraw = false;
        let colorIdx = 0;
        
        if (layer === 0 && distance < size) {
          // Main body - oval shape with more density
          const ovalFactor = 1.2 + Math.sin(hash * 0.01) * 0.3;
          const bodyShape = (dx * dx) / (size * size) + (dy * dy) / ((size * ovalFactor) * (size * ovalFactor));
          if (bodyShape < 0.9) { // Increased from 0.8 to 0.9 for more coverage
            shouldDraw = true;
            colorIdx = (hash + Math.floor(distance)) % (colors.length - 1);
          }
        } else if (layer === 1 && distance < size * 0.8) { // Increased from 0.7 to 0.8
          // Inner details - spots or stripes with lower threshold
          const pattern = Math.sin(distance * 0.5 + hash * 0.01) * Math.cos(angle * 4 + hash * 0.02);
          if (pattern > 0.1) { // Reduced from 0.3 to 0.1 for more pattern density
            shouldDraw = true;
            colorIdx = (colorIdx + 1) % (colors.length - 1);
          }
        } else if (layer === 2) {
          // Eyes and features
          const eyeDistance1 = Math.sqrt((dx - size * 0.3) * (dx - size * 0.3) + (dy - size * 0.4) * (dy - size * 0.4));
          const eyeDistance2 = Math.sqrt((dx + size * 0.3) * (dx + size * 0.3) + (dy - size * 0.4) * (dy - size * 0.4));
          
          if (eyeDistance1 < size * 0.15 || eyeDistance2 < size * 0.15) {
            shouldDraw = true;
            colorIdx = 0; // Primary color for eyes
          }
        }
        
        if (shouldDraw) {
          ctx.fillStyle = colors[colorIdx];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateLandscapeArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  
  // Generate hills/mountains using sine waves
  const hillHeight = rows * 0.6;
  const frequency = 0.1 + (hash % 100) * 0.001;
  
  for (let x = 0; x < cols; x++) {
    // Create multiple hill layers
    const hill1 = Math.sin(x * frequency + hash * 0.01) * hillHeight * 0.3;
    const hill2 = Math.sin(x * frequency * 1.5 + hash * 0.02) * hillHeight * 0.2;
    const hill3 = Math.sin(x * frequency * 0.7 + hash * 0.03) * hillHeight * 0.4;
    
    const groundLevel = rows * 0.7 + hill1 + hill2 + hill3;
    
    for (let y = 0; y < rows; y++) {
      let shouldDraw = false;
      let colorIdx = 0;
      
      if (y > groundLevel) {
        // Ground
        shouldDraw = true;
        colorIdx = (hash + x + y) % (colors.length - 1);
      } else if (y > groundLevel - 8 && seededRandom(hash + x * 17 + y * 23) * 100 < 50) {
        // Grass/vegetation - increased density and area
        shouldDraw = true;
        colorIdx = 0;
      } else if (y < rows * 0.4 && seededRandom(hash + x * 13 + y * 29) * 100 < 25) {
        // Sky elements (clouds, birds) - increased probability from 10 to 25
        shouldDraw = true;
        colorIdx = 1;
      }
      
      if (shouldDraw) {
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function generateGeometricArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  
  // Generate geometric patterns based on code features
  const patternSize = 8 + (hash % 16);
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const patternX = x % patternSize;
      const patternY = y % patternSize;
      
      let shouldDraw = false;
      let colorIdx = 0;
      
      // Create various geometric patterns
      if (features.symbols > 20) {
        // Diamond pattern
        if (Math.abs(patternX - patternSize/2) + Math.abs(patternY - patternSize/2) < patternSize/3) {
          shouldDraw = true;
          colorIdx = (x + y + hash) % (colors.length - 1);
        }
      } else if (features.lines > 10) {
        // Checkerboard with variations
        if ((patternX + patternY + hash) % 4 < 2) {
          shouldDraw = true;
          colorIdx = ((x / patternSize) + (y / patternSize)) % (colors.length - 1);
        }
      } else {
        // Concentric squares
        const distance = Math.max(Math.abs(patternX - patternSize/2), Math.abs(patternY - patternSize/2));
        if (distance % 3 === hash % 3) {
          shouldDraw = true;
          colorIdx = distance % (colors.length - 1);
        }
      }
      
      if (shouldDraw) {
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function generateCosmicArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  const centerX = cols / 2;
  const centerY = rows / 2;
  
  // Generate cosmic/space-like patterns
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      let shouldDraw = false;
      let colorIdx = 0;
      
      // Stars (deterministic)
      if (seededRandom(hash + x * 31 + y * 37) * 1000 < 3) {
        shouldDraw = true;
        colorIdx = 0;
      }
      
      // Spiral galaxy arms
      const spiralAngle = angle + distance * 0.1 + hash * 0.01;
      const spiralPattern = Math.sin(spiralAngle * 3) * Math.exp(-distance * 0.01);
      
      if (spiralPattern > 0.7 && distance > 10) {
        shouldDraw = true;
        colorIdx = (Math.floor(distance / 10) + hash) % (colors.length - 1);
      }
      
      // Central bright area
      if (distance < 15) {
        const brightness = 1 - (distance / 15);
        if (seededRandom(hash + x * 41 + y * 43) < brightness * 0.5) {
          shouldDraw = true;
          colorIdx = Math.floor(brightness * (colors.length - 1));
        }
      }
      
      if (shouldDraw) {
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function generateAbstractArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  
  // Generate flowing abstract patterns
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pattern1 = Math.sin(x * 0.1 + hash * 0.01) * Math.cos(y * 0.1 + hash * 0.02);
      const pattern2 = Math.sin(x * 0.05 + y * 0.05 + hash * 0.01);
      const pattern3 = Math.cos((x + y) * 0.08 + hash * 0.03);
      
      const combined = pattern1 + pattern2 * 0.5 + pattern3 * 0.3;
      
      if (combined > 0.5) {
        const colorIdx = Math.floor((combined + 1) * (colors.length - 1) / 2);
        ctx.fillStyle = colors[Math.min(colorIdx, colors.length - 1)];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function addStructuralElements(
  ctx: CanvasRenderingContext2D,
  code: string,
  features: CodeFeatures,
  config: ArtConfig,
  hash: number
): void {
  const { width, height, colors } = config;
  
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  
  if (features.indent > 0) {
    const indentLines = Math.min(5, Math.floor(features.indent));
    for (let i = 0; i < indentLines; i++) {
      const x = ((hash + i * 17) % (width * 0.8)) + width * 0.1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  
  const blockLines = Math.min(4, Math.floor(features.lines / 10));
  for (let i = 0; i < blockLines; i++) {
    const y = ((hash + i * 23) % (height * 0.6)) + height * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.globalAlpha = 0.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  
  if (features.symbols > 20) {
    ctx.fillStyle = colors[1];
    ctx.globalAlpha = 0.4;
    
    const shapes = Math.min(3, Math.floor(features.symbols / 30));
    for (let i = 0; i < shapes; i++) {
      const x = ((hash + i * 41) % (width * 0.6)) + width * 0.2;
      const y = ((hash + i * 37) % (height * 0.6)) + height * 0.2;
      const size = 20 + (i * 10);
      
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Ensures that even sparse patterns have some visual elements
 * This prevents completely blank-looking art while preserving steganographic data
 */
function ensureMinimumVisibility(
  ctx: CanvasRenderingContext2D, 
  config: ArtConfig, 
  features: CodeFeatures, 
  hash: number, 
  cols: number, 
  rows: number
): void {
  const { pixelSize, colors } = config;
  
  // Check if we need minimum visibility (for short/simple text)
  const needsMinimumVisibility = 
    features.length < 100 || 
    features.lines < 5 || 
    (features.symbols < 10 && features.digits < 5);
  
  if (needsMinimumVisibility) {
    // Add subtle but visible pattern that works with any palette
    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);
    const radius = Math.min(cols, rows) * 0.15; // Small central pattern
    
    // Create a deterministic pattern based on the text hash
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Multiple pattern layers for guaranteed visibility
        let shouldDraw = false;
        let colorIdx = 0;
        
        // Pattern 1: Central spiral
        if (distance < radius) {
          const angle = Math.atan2(dy, dx);
          const spiral = Math.sin(distance * 0.8 + angle * 3 + hash * 0.01) > 0.4;
          if (spiral) {
            shouldDraw = true;
            colorIdx = 0;
          }
        }
        
        // Pattern 2: Corner accents (always visible)
        const cornerDistance1 = Math.sqrt((x - 2) * (x - 2) + (y - 2) * (y - 2));
        const cornerDistance2 = Math.sqrt((x - (cols - 3)) * (x - (cols - 3)) + (y - 2) * (y - 2));
        const cornerDistance3 = Math.sqrt((x - 2) * (x - 2) + (y - (rows - 3)) * (y - (rows - 3)));
        const cornerDistance4 = Math.sqrt((x - (cols - 3)) * (x - (cols - 3)) + (y - (rows - 3)) * (y - (rows - 3)));
        
        if (cornerDistance1 < 3 || cornerDistance2 < 3 || cornerDistance3 < 3 || cornerDistance4 < 3) {
          if (seededRandom(hash + x * 7 + y * 11) > 0.6) {
            shouldDraw = true;
            colorIdx = 1;
          }
        }
        
        // Pattern 3: Scattered pixels for texture (very subtle)
        if (!shouldDraw && seededRandom(hash + x * 13 + y * 17) > 0.92) {
          shouldDraw = true;
          colorIdx = (hash + x + y) % (colors.length - 1);
        }
        
        if (shouldDraw) {
          ctx.fillStyle = colors[colorIdx];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
}

// v2.0 Feature: Generate art with embedded code
export async function generateArtWithCode(
  canvas: HTMLCanvasElement,
  code: string,
  config: ArtConfig,
  embedOptions?: EmbedOptions
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  generatePixelArt(ctx, code, config);

  if (embedOptions) {
    try {
      const success = embedCodeInPixels(canvas, code, embedOptions);
      
      if (!success) {
        throw new Error('Failed to embed code');
      }
    } catch (error) {
      console.error('Embedding failed:', error);
      throw error;
    }
  }
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'snippix-art.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

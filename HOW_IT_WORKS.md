# How Snippix Works: A Technical Deep Dive

Snippix combines computer graphics, cryptography, and creative algorithms to transform any text into beautiful pixel art with hidden data. Here's how it all comes together!

## The Art Generation Engine

### Content Analysis & Style Selection

When you input text, Snippix analyzes its characteristics:

```typescript
function extractCodeFeatures(code: string): CodeFeatures {
  const lines = code.split('\n');
  const length = code.length;
  const indent = lines.reduce((acc, l) => acc + (l.match(/^\s+/)?.[0].length || 0), 0) / lines.length;
  const symbols = (code.match(/[^\w\s]/g) || []).length;
  const digits = (code.match(/[0-9]/g) || []).length;
  const upper = (code.match(/[A-Z]/g) || []).length;
  return { length, indent, symbols, digits, upper, lines: lines.length };
}
```

This creates a "fingerprint" of your text that determines which art style to use:
- **Creature**: For structured, indented content (like code)
- **Landscape**: For narrative text with natural flow
- **Geometric**: For symbol-heavy, mathematical content
- **Cosmic**: For varied, complex text patterns
- **Abstract**: For everything else

### Deterministic Art Generation

The magic is in the deterministic algorithms. The same text always produces the same art:

```typescript
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

This hash becomes the "seed" for all random-looking patterns, ensuring reproducibility.

### Art Style Examples

#### Creature Generation
```typescript
// Creates symmetrical, organic-looking patterns
const ovalFactor = 1.2 + Math.sin(hash * 0.01) * 0.3;
const bodyShape = (dx * dx) / (size * size) + (dy * dy) / ((size * ovalFactor) * (size * ovalFactor));
if (bodyShape < 0.9) {
  // Draw creature body pixel
}
```

#### Landscape Generation
```typescript
// Uses sine waves to create natural-looking hills
const hill1 = Math.sin(x * frequency + hash * 0.01) * hillHeight * 0.3;
const hill2 = Math.sin(x * frequency * 1.5 + hash * 0.02) * hillHeight * 0.2;
const groundLevel = rows * 0.7 + hill1 + hill2 + hill3;
```

### Minimum Visibility System

For short text that might create sparse patterns, Snippix adds guaranteed visual elements:

```typescript
function ensureMinimumVisibility() {
  const needsMinimumVisibility = 
    features.length < 100 || 
    features.lines < 5 || 
    (features.symbols < 10 && features.digits < 5);
  
  if (needsMinimumVisibility) {
    // Add central spiral, corner accents, and texture dots
  }
}
```

## Steganography: Hiding Data in Plain Sight

### LSB (Least Significant Bit) Encoding

Snippix uses LSB steganography to hide text in image pixels without visible changes:

```typescript
function embedBitsInPixel(pixel: number, bits: string): number {
  // Clear the least significant bit and set our data bit
  return (pixel & 0xFE) | parseInt(bits, 2);
}
```

Each pixel's color value can hide 1 bit of data in its least significant bit. Since humans can't detect 1-bit color changes, the hidden data is invisible.

### Data Structure & Encoding

The embedding process follows this structure:

1. **Header**: Magic bytes to identify Snippix images
2. **Length**: How many bytes of data follow
3. **Data**: Your actual text, UTF-8 encoded
4. **Verification**: Hash for data integrity

```typescript
const header = new Uint8Array([0x53, 0x4E, 0x49, 0x50]); // "SNIP"
const lengthBytes = new Uint8Array(4);
const dataView = new DataView(lengthBytes.buffer);
dataView.setUint32(0, textBytes.length, false);
```

### XOR Encryption Layer

When you add a password, Snippix applies XOR encryption:

```typescript
function xorEncrypt(data: Uint8Array, password: string): Uint8Array {
  const key = new TextEncoder().encode(password);
  const result = new Uint8Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
}
```

This creates a simple but effective encryption layer that's reversible with the same password.

### Robust Error Handling

The decoding process includes multiple validation steps:

```typescript
// Verify magic header
if (!header.every((byte, i) => extractedHeader[i] === byte)) {
  throw new Error('Not a valid Snippix image');
}

// Verify data integrity
const actualHash = hashString(decodedText);
if (actualHash !== expectedHash) {
  throw new Error('Data corruption detected');
}
```

## Canvas Rendering & Performance

### Pixel-Perfect Rendering

Snippix renders art on HTML5 Canvas for precise control:

```typescript
export function generatePixelArt(
  ctx: CanvasRenderingContext2D,
  code: string,
  config: ArtConfig
): void {
  const { width, height, pixelSize, colors } = config;
  
  // Clear with background
  ctx.fillStyle = colors[4] || '#18181b';
  ctx.fillRect(0, 0, width, height);
  
  // Generate art pixel by pixel
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (shouldDrawPixel(x, y, hash, features)) {
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}
```

### Palette System

Dynamic color palettes transform the same art into different moods:

```typescript
export const PALETTES = {
  retro: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'],
  neon: ['#ff0080', '#00ff80', '#8000ff', '#ffff00', '#ff8000'],
  pastel: ['#ffc1cc', '#a8e6cf', '#dcedc1', '#ffd3a5', '#ffaaa5'],
  // ... more palettes
};
```

Each algorithm uses these colors consistently but applies them based on the content's characteristics.

## The Math Behind the Magic

### Seeded Random Number Generation

```typescript
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
```

This creates "random" numbers that are actually deterministic, ensuring the same text always generates the same art.

### Trigonometric Patterns

Many art styles use sine and cosine waves for natural-looking patterns:

```typescript
// Spiral patterns
const spiral = Math.sin(distance * 0.8 + angle * 3 + hash * 0.01) > 0.4;

// Wave-based landscapes
const hill = Math.sin(x * frequency + hash * 0.01) * hillHeight;

// Circular creatures
const bodyShape = (dx * dx) / (size * size) + (dy * dy) / (size * size);
```

### Color Selection Algorithms

Colors are chosen based on position and content hash:

```typescript
const colorIdx = (hash + Math.floor(distance)) % (colors.length - 1);
```

This ensures even color distribution while maintaining deterministic results.

## 🚀 Performance Optimizations

### Efficient Bit Manipulation

```typescript
// Fast bit operations for steganography
const bit = (byte >> (7 - bitIndex)) & 1;
const newPixel = (pixel & 0xFE) | bit;
```

### Canvas Optimization

```typescript
// Batch pixel operations
const imageData = ctx.getImageData(0, 0, width, height);
const data = imageData.data;

// Direct pixel manipulation
for (let i = 0; i < data.length; i += 4) {
  data[i] = embedBitsInPixel(data[i], redBits);     // Red
  data[i + 1] = embedBitsInPixel(data[i + 1], greenBits); // Green  
  data[i + 2] = embedBitsInPixel(data[i + 2], blueBits);  // Blue
  // Alpha channel (data[i + 3]) left unchanged
}

ctx.putImageData(imageData, 0, 0);
```

## 🎭 Creative Philosophy

Snippix bridges the gap between code and art by:

1. **Finding Beauty in Data**: Every character contributes to the visual output
2. **Deterministic Creativity**: Reproducible art that's both random and intentional
3. **Hidden Depths**: Surface beauty with secret messages underneath

The result is a tool that makes every piece of text into a unique, shareable artwork while preserving the original content through invisible steganographic embedding.

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

/**
 * Detect programming language patterns for better art selection
 */
function detectContentType(code: string): string {
  const patterns = {
    html: /<[^>]+>/,
    css: /[{}:;].*{.*}/,
    json: /^\s*[{\[][\s\S]*[}\]]\s*$/,
    javascript: /\b(function|const|let|var|=>)\b/,
    python: /\b(def |import |from |class )\b/,
    java: /\b(public|private|class|import)\b/,
    markdown: /^#{1,6}\s|^\*{1,2}[^*]/m,
    code: /[{}();]/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) {
      return type;
    }
  }
  
  return 'text';
}

/**
 * Calculate Shannon entropy for content complexity analysis
 */
function calculateEntropy(text: string): number {
  const freq: Record<string, number> = {};
  
  // Count character frequencies
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  // Calculate entropy
  let entropy = 0;
  const textLength = text.length;
  
  for (const count of Object.values(freq)) {
    const probability = count / textLength;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

/**
 * Adds a subtle Snippix watermark in the bottom right corner
 */
function addSnippixWatermark(
  ctx: CanvasRenderingContext2D,
  config: ArtConfig
): void {
  const { width, height, colors } = config;
  
  // Save current context state
  ctx.save();
  
  // Text configuration
  const text = "snippixbymnn";
  const fontSize = Math.max(8, Math.min(12, width * 0.018)); // Responsive font size
  const padding = 8;
  
  // Set font properties
  ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Monaco, Consolas, monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Measure text for background
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  
  // Position in bottom right with padding
  const x = width - padding;
  const y = height - padding;
  
  // Add semi-transparent background for better readability
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    x - textWidth - 4, 
    y - textHeight - 2, 
    textWidth + 8, 
    textHeight + 4
  );
  
  // Add border
  ctx.strokeStyle = colors[0] || '#b5e853';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(
    x - textWidth - 4, 
    y - textHeight - 2, 
    textWidth + 8, 
    textHeight + 4
  );
  
  // Draw the text
  ctx.fillStyle = colors[0] || '#b5e853';
  ctx.globalAlpha = 0.9;
  ctx.fillText(text, x, y);
  
  // Restore context state
  ctx.restore();
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
    case 'circuit':
      generateCircuitArt(ctx, config, features, hash, cols, rows);
      break;
    case 'mandala':
      generateMandalaArt(ctx, config, features, hash, cols, rows);
      break;
    default:
      generateAbstractArt(ctx, config, features, hash, cols, rows);
  }

  // Add signature structural elements (these don't interfere with steganography)
  addStructuralElements(ctx, code, features, config, hash);
  
  // CRITICAL FIX: Ensure minimum visibility for sparse patterns
  ensureMinimumVisibility(ctx, config, features, hash, cols, rows);
  
  // Add Snippix watermark/signature
  addSnippixWatermark(ctx, config);
}

function determineArtType(features: CodeFeatures, hash: number): string {
  const types = ['creature', 'landscape', 'geometric', 'cosmic', 'abstract', 'circuit', 'mandala'];
  
  // Enhanced logic with more sophisticated art type selection
  let selector = hash;
  
  // Code-specific patterns
  if (features.symbols > 50) selector += 1; // Symbol-heavy → geometric/circuit
  if (features.lines > 20) selector += 2;   // Multi-line → landscape/abstract
  if (features.length > 1000) selector += 3; // Long content → cosmic/mandala
  if (features.indent > 2) selector += 4;   // Indented → creature/circuit
  
  // Content type influences (would need to pass code to use detectContentType)
  // For now, using symbol patterns as proxy
  const hasCodePatterns = features.symbols > 30 && features.length > 200;
  const hasStructuredContent = features.indent > 3 && features.lines > 15;
  
  // Bias toward circuit art for code-like content
  if (hasCodePatterns) {
    selector += 10; // Increase chance of getting 'circuit'
  }
  
  // Bias toward mandala for structured/repetitive content  
  if (hasStructuredContent) {
    selector += 15; // Increase chance of getting 'mandala'
  }
  
  return types[selector % types.length];
}

function generateCreatureArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  
  // Generate creature-like symmetrical patterns with organic variations
  const size = Math.min(cols, rows) * 0.4;
  
  for (let layer = 0; layer < 3; layer++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create creature body with symmetry and organic variation
        let shouldDraw = false;
        let colorIdx = 0;
        
        // Add organic noise for more natural shapes
        const organicNoise = Math.sin(x * 0.3 + hash * 0.01) * Math.cos(y * 0.3 + hash * 0.02) * 0.1;
        
        if (layer === 0 && distance < size) {
          // Main body - oval shape with organic variations
          const ovalFactor = 1.2 + Math.sin(hash * 0.01) * 0.3;
          const bodyShape = (dx * dx) / (size * size) + (dy * dy) / ((size * ovalFactor) * (size * ovalFactor));
          const variation = organicNoise + Math.sin(angle * 3 + hash * 0.01) * 0.1;
          
          if (bodyShape < 0.9 + variation) {
            shouldDraw = true;
            colorIdx = (hash + Math.floor(distance)) % (colors.length - 1);
          }
        } else if (layer === 1 && distance < size * 0.8) {
          // Inner details - spots or stripes with organic patterns
          const pattern = Math.sin(distance * 0.5 + hash * 0.01) * Math.cos(angle * 4 + hash * 0.02);
          const organicPattern = pattern + organicNoise * 2;
          
          if (organicPattern > 0.1) {
            shouldDraw = true;
            colorIdx = (colorIdx + 1) % (colors.length - 1);
          }
        } else if (layer === 2) {
          // Eyes and features with more character
          const eyeDistance1 = Math.sqrt((dx - size * 0.3) * (dx - size * 0.3) + (dy - size * 0.4) * (dy - size * 0.4));
          const eyeDistance2 = Math.sqrt((dx + size * 0.3) * (dx + size * 0.3) + (dy - size * 0.4) * (dy - size * 0.4));
          
          // Main eyes
          if (eyeDistance1 < size * 0.15 || eyeDistance2 < size * 0.15) {
            shouldDraw = true;
            colorIdx = 0; // Primary color for eyes
          }
          
          // Eye pupils
          if (eyeDistance1 < size * 0.08 || eyeDistance2 < size * 0.08) {
            shouldDraw = true;
            colorIdx = colors.length - 1; // Background color for pupils
          }
          
          // Mouth/beak area
          const mouthDistance = Math.sqrt((dx) * (dx) + (dy + size * 0.2) * (dy + size * 0.2));
          if (mouthDistance < size * 0.12 && dy > -size * 0.1) {
            const mouthPattern = Math.sin(angle * 6 + hash * 0.03);
            if (mouthPattern > 0.5) {
              shouldDraw = true;
              colorIdx = 1;
            }
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

/**
 * Enhanced color selection with spatial and semantic context
 */
function selectEnhancedColor(
  x: number, 
  y: number, 
  distance: number, 
  features: CodeFeatures, 
  colors: string[], 
  hash: number,
  baseColorIdx: number = 0
): string {
  // Add spatial variation
  const spatialVariation = Math.sin(x * 0.1 + y * 0.1 + hash * 0.01) * 0.3;
  
  // Add semantic weight based on content type
  const semanticWeight = features.symbols > 50 ? 0.4 : 0.1;
  
  // Add distance-based gradient
  const distanceWeight = Math.sin(distance * 0.05) * 0.2;
  
  // Combine all factors
  const colorVariation = spatialVariation + semanticWeight + distanceWeight;
  const finalColorIdx = Math.floor((baseColorIdx + colorVariation + 1) * (colors.length - 1) / 2);
  
  return colors[Math.min(Math.abs(finalColorIdx), colors.length - 1)];
}

/**
 * Performance optimization: Use ImageData for batch pixel operations
 */
function drawOptimizedPixel(
  imageData: ImageData, 
  x: number, 
  y: number, 
  color: string, 
  width: number
): void {
  if (x < 0 || x >= width || y < 0 || y >= imageData.height) return;
  
  const index = (y * width + x) * 4;
  
  // Convert hex color to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  imageData.data[index] = r;     // Red
  imageData.data[index + 1] = g; // Green
  imageData.data[index + 2] = b; // Blue
  imageData.data[index + 3] = 255; // Alpha
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

function generateCircuitArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  
  // Generate circuit board-like patterns for code
  const gridSize = 4 + (hash % 8);
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let shouldDraw = false;
      let colorIdx = 0;
      
      // Circuit traces (horizontal and vertical lines)
      const onHorizontalTrace = (y % gridSize === 0) && (seededRandom(hash + y * 31) > 0.3);
      const onVerticalTrace = (x % gridSize === 0) && (seededRandom(hash + x * 37) > 0.3);
      
      if (onHorizontalTrace || onVerticalTrace) {
        shouldDraw = true;
        colorIdx = 0; // Primary color for traces
      }
      
      // Circuit nodes/components at intersections
      if (x % gridSize === 0 && y % gridSize === 0) {
        if (seededRandom(hash + x * 13 + y * 17) > 0.6) {
          shouldDraw = true;
          colorIdx = 1; // Secondary color for nodes
        }
      }
      
      // Resistor/capacitor symbols
      const symbolSpacing = gridSize * 2;
      if (x % symbolSpacing === symbolSpacing/2 && y % symbolSpacing === symbolSpacing/2) {
        if (features.symbols > 20 && seededRandom(hash + x * 19 + y * 23) > 0.7) {
          // Draw small component rectangles
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows) {
                ctx.fillStyle = colors[2];
                ctx.fillRect((x + dx) * pixelSize, (y + dy) * pixelSize, pixelSize, pixelSize);
              }
            }
          }
        }
      }
      
      // Random sparks/electrical activity
      if (!shouldDraw && seededRandom(hash + x * 41 + y * 43) > 0.98) {
        shouldDraw = true;
        colorIdx = Math.floor(seededRandom(hash + x + y) * (colors.length - 1));
      }
      
      if (shouldDraw) {
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function generateMandalaArt(ctx: CanvasRenderingContext2D, config: ArtConfig, features: CodeFeatures, hash: number, cols: number, rows: number): void {
  const { pixelSize, colors } = config;
  const centerX = cols / 2;
  const centerY = rows / 2;
  const maxRadius = Math.min(cols, rows) / 2 * 0.8;
  
  // Generate mandala/sacred geometry patterns
  const symmetryOrder = 6 + (hash % 6); // 6-12 fold symmetry
  const ringCount = 3 + (features.lines % 5); // Based on content structure
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      if (distance > maxRadius) continue;
      
      let shouldDraw = false;
      let colorIdx = 0;
      
      // Concentric rings
      const ringIndex = Math.floor((distance / maxRadius) * ringCount);
      const ringPhase = ((distance / maxRadius) * ringCount) % 1;
      
      // Radial symmetry
      const symmetryAngle = (angle + Math.PI) / (2 * Math.PI) * symmetryOrder;
      const symmetryPhase = symmetryAngle % 1;
      
      // Pattern based on code features
      const complexity = features.symbols + features.digits;
      const pattern1 = Math.sin(symmetryAngle * Math.PI * 2 + hash * 0.01);
      const pattern2 = Math.cos(ringIndex * Math.PI + distance * 0.1);
      const pattern3 = Math.sin(distance * 0.2 + hash * 0.02);
      
      const combined = pattern1 * pattern2 + pattern3 * 0.5;
      
      // Ring boundaries
      if (Math.abs(ringPhase - 0.5) < 0.1 && combined > 0.3) {
        shouldDraw = true;
        colorIdx = ringIndex % (colors.length - 1);
      }
      
      // Radial spokes
      if (Math.abs(symmetryPhase - 0.5) < 0.05 && combined > 0.2) {
        shouldDraw = true;
        colorIdx = (ringIndex + 1) % (colors.length - 1);
      }
      
      // Decorative elements based on content complexity
      if (complexity > 30) {
        const decoration = Math.sin(angle * symmetryOrder + distance * 0.3 + hash * 0.01);
        if (decoration > 0.7 && distance > maxRadius * 0.2) {
          shouldDraw = true;
          colorIdx = Math.floor((decoration + 1) * (colors.length - 1) / 2);
        }
      }
      
      // Central focus
      if (distance < maxRadius * 0.15) {
        const centerPattern = Math.sin(distance * 2 + hash * 0.01) * Math.cos(angle * 4);
        if (centerPattern > 0.5) {
          shouldDraw = true;
          colorIdx = 0; // Primary color for center
        }
      }
      
      if (shouldDraw) {
        ctx.fillStyle = colors[colorIdx];
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

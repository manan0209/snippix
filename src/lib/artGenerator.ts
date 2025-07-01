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

  // Create more sophisticated patterns based on code structure
  const codeBytes = new TextEncoder().encode(code);
  
  // Pattern generation with multiple layers
  for (let layer = 0; layer < 3; layer++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) % codeBytes.length;
        const byte = codeBytes[idx] || 0;
        
        // Create layered patterns
        const layerSeed = hash + layer * 1000;
        const pattern = (byte + x * 7 + y * 13 + layerSeed) % 256;
        
        // Different density for each layer
        const densities = [0.3, 0.15, 0.08];
        const threshold = densities[layer] * 256;
        
        if (pattern > threshold) {
          // Color selection based on code features and position
          let colorIdx;
          switch (layer) {
            case 0: // Base layer - most frequent
              colorIdx = (byte + x + y) % (colors.length - 1);
              break;
            case 1: // Mid layer - symbols and special chars
              colorIdx = features.symbols > 0 ? 
                ((byte * features.symbols + x) % (colors.length - 1)) : 0;
              break;
            case 2: // Top layer - accents
              colorIdx = 0; // Primary accent color
              break;
            default:
              colorIdx = 0;
          }
          
          // Add some randomness based on code content
          if ((byte + hash + x * y) % 100 < 15) {
            colorIdx = (colorIdx + 1) % (colors.length - 1);
          }
          
          ctx.fillStyle = colors[colorIdx];
          
          // Vary pixel sizes for visual interest
          const pixelVariation = layer === 2 ? pixelSize * 0.6 : pixelSize;
          const offsetX = layer === 2 ? pixelSize * 0.2 : 0;
          const offsetY = layer === 2 ? pixelSize * 0.2 : 0;
          
          ctx.fillRect(
            x * pixelSize + offsetX, 
            y * pixelSize + offsetY, 
            pixelVariation, 
            pixelVariation
          );
        }
      }
    }
  }

  // Add structural elements based on code
  addStructuralElements(ctx, code, features, config, hash);
}

function addStructuralElements(
  ctx: CanvasRenderingContext2D,
  code: string,
  features: CodeFeatures,
  config: ArtConfig,
  hash: number
): void {
  const { width, height, colors } = config;
  
  // Draw lines based on code structure
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = 2;
  
  // Vertical lines for indentation patterns
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
  
  // Horizontal lines for code blocks
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
  
  // Add geometric shapes for functions/classes
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

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'snippix-art.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

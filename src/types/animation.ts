// Animation system types for Snippix v2.1

export interface AnimationStyle {
  id: string;
  name: string;
  description: string;
}

export interface ExportOptions {
  format: 'gif' | 'mp4' | 'webm';
  duration: number; // seconds
  fps: 30 | 60;
  quality: 'low' | 'medium' | 'high';
  width?: number;
  height?: number;
}

export interface PixelData {
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface AnimationFrame {
  timestamp: number;
  pixels: PixelData[];
}

export interface Animation3DConfig {
  canvasWidth: number;
  canvasHeight: number;
  animationStyle: AnimationStyle;
  palette: string[];
  duration: number;
  fps: number;
}

export interface MathFunction {
  type: 'polynomial' | 'trigonometric' | 'exponential' | 'logarithmic' | 'parametric' | 'polar';
  equation: string;
  variables: Record<string, number>;
  range: {
    min: number;
    max: number;
  };
}

export interface ArtSubmission {
  id: string;
  artUrl: string; // Vercel Blob storage URL
  thumbnailUrl?: string;
  palette: string;
  codeLength: number;
  hasEmbedding: boolean;
  isEncrypted: boolean;
  hearts: number;
  createdAt: string;
  title?: string;
  description?: string;
  authorId?: string; // Optional anonymous
  tags?: string[];
}

export interface AppState {
  currentMode: 'art' | 'gallery' | 'math';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedPalette: any; // Use existing Palette type
  userPreferences: UserPreferences;
  recentArt: ArtHistory[];
}

export interface UserPreferences {
  defaultAnimationStyle: string;
  preferredExportFormat: 'gif' | 'mp4';
  autoPlayAnimations: boolean;
  theme: 'retro' | 'neon' | 'pastel';
}

export interface ArtHistory {
  id: string;
  timestamp: Date;
  artUrl: string;
  codeSnippet: string;
  palette: string;
}

// Animation styles available
export const ANIMATION_STYLES: AnimationStyle[] = [
  {
    id: 'extrusion',
    name: 'Pixel Extrusion',
    description: 'Convert 2D pixels to 3D cubes with depth'
  },
  {
    id: 'wave',
    name: 'Wave Motion',
    description: 'Sine wave animations across the art surface'
  },
  {
    id: 'rotation',
    name: 'Rotation Matrix',
    description: '3D rotation around multiple axes'
  },
  {
    id: 'particles',
    name: 'Particle System',
    description: 'Pixels become floating particles'
  }
];

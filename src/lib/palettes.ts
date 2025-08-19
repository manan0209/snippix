export interface Palette {
  name: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  { name: 'Retro Terminal', colors: ['#b5e853', '#232323', '#282828', '#fff', '#18181b'] },
  { name: 'Vaporwave', colors: ['#ff5eae', '#7c3aed', '#38bdf8', '#fbbf24', '#fff'] },
  { name: 'Neon', colors: ['#0ff', '#f0f', '#ff0', '#fff', '#222'] },
  { name: 'Pastel', colors: ['#ff6f61', '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1'] },
  { name: 'Cyber', colors: ['#f72585', '#b5179e', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'] },
];

export const DEFAULT_PALETTE = PALETTES[4];

export function getPaletteByIndex(index: number): Palette {
  return PALETTES[index] || DEFAULT_PALETTE;
}

export function getPaletteByName(name: string): Palette {
  return PALETTES.find(p => p.name === name) || DEFAULT_PALETTE;
}

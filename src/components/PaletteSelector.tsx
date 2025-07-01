import { PALETTES, type Palette } from '@/lib/palettes';

interface PaletteSelectorProps {
  selectedPalette: Palette;
  onPaletteChange: (palette: Palette) => void;
}

export default function PaletteSelector({ selectedPalette, onPaletteChange }: PaletteSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block font-semibold text-[#b5e853] tracking-widest uppercase text-sm">
        Color Palette
      </label>
      
      <div className="space-y-3">
        {PALETTES.map((palette) => (
          <div
            key={palette.name}
            onClick={() => onPaletteChange(palette)}
            className={`
              cursor-pointer p-3 rounded-lg border transition-all duration-200
              ${selectedPalette.name === palette.name 
                ? 'border-[#b5e853] bg-[#b5e853]/10' 
                : 'border-[#282828] hover:border-[#b5e853]/50 hover:bg-[#282828]/50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#b5e853] font-mono text-sm font-medium">
                {palette.name}
              </span>
              <div className="flex gap-1">
                {palette.colors.slice(0, 4).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-[#282828] shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

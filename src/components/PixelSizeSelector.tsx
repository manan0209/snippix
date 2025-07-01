
interface PixelSizeSelectorProps {
  pixelSize: number;
  onPixelSizeChange: (size: number) => void;
}

export default function PixelSizeSelector({ pixelSize, onPixelSizeChange }: PixelSizeSelectorProps) {
  const sizes = [8, 12, 16, 20, 24, 32];
  
  return (
    <div className="space-y-3">
      <label className="block font-semibold text-[#b5e853] tracking-widest uppercase text-sm">
        Pixel Size: {pixelSize}px
      </label>
      
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onPixelSizeChange(size)}
            className={`
              p-3 rounded-lg border font-mono text-sm transition-all duration-200
              ${pixelSize === size 
                ? 'border-[#b5e853] bg-[#b5e853]/10 text-[#b5e853]' 
                : 'border-[#282828] text-[#b5e853]/70 hover:border-[#b5e853]/50 hover:text-[#b5e853]'
              }
            `}
          >
            {size}px
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        <input
          type="range"
          min="6"
          max="40"
          step="2"
          value={pixelSize}
          onChange={(e) => onPixelSizeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[#282828] rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #b5e853 0%, #b5e853 ${((pixelSize - 6) / (40 - 6)) * 100}%, #282828 ${((pixelSize - 6) / (40 - 6)) * 100}%, #282828 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[#b5e853]/60 mt-1">
          <span>6px</span>
          <span>40px</span>
        </div>
      </div>
    </div>
  );
}

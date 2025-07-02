import { DEFAULT_PALETTE, type Palette } from '@/lib/palettes';
import React, { useState } from 'react';
import SimpleCodeEditor from 'react-simple-code-editor';
import PaletteSelector from './PaletteSelector';
import PixelSizeSelector from './PixelSizeSelector';

interface CodeInputProps {
  onSubmit: (code: string, palette: Palette, pixelSize: number) => void;
}

export default function CodeInput({ onSubmit }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [pixelSize, setPixelSize] = useState(16);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a code snippet.');
      return;
    }
    setError(null);
    onSubmit(code, selectedPalette, pixelSize);
  };

  const highlight = (code: string) => code;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-[#18181b] border border-[#282828] rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#282828]">
          <label className="font-semibold text-[#b5e853] tracking-widest uppercase text-sm block mb-4">
            Code Snippet
          </label>
          
          <div className="border border-[#282828] rounded-lg font-mono text-sm bg-[#111] overflow-hidden">
            <SimpleCodeEditor
              value={code}
              onValueChange={setCode}
              highlight={highlight}
              padding={20}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                fontSize: 13,
                lineHeight: '1.5',
                backgroundColor: '#111',
                color: '#b5e853',
                outline: 'none',
                minHeight: '200px',
                maxHeight: '400px',
                overflow: 'auto',
                resize: 'vertical',
              }}
              placeholder="Paste your code here...
Supports any programming language
Large code snippets are welcome!"
            />
          </div>
          
          {code.length > 0 && (
            <div className="mt-2 text-xs text-[#b5e853] opacity-60">
              {code.length} characters • {code.split('\n').length} lines
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm font-mono mt-3">{error}</p>
          )}
        </div>

        <div className="p-6 bg-[#1a1a1a]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PaletteSelector 
              selectedPalette={selectedPalette}
              onPaletteChange={setSelectedPalette}
            />
            <PixelSizeSelector 
              pixelSize={pixelSize}
              onPixelSizeChange={setPixelSize}
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-4 bg-[#b5e853] text-[#18181b] rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-[#d6ff7f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
          >
            Generate Pixel Art
          </button>
        </div>
      </form>
    </div>
  );
}

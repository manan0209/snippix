"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { MathEngine, PRESET_EQUATIONS, getRandomPreset } from '@/lib/mathEngine';
import type { MathFunction } from '@/types/animation';

interface MathCanvasProps {
  palette: string[];
  width?: number;
  height?: number;
}

export default function MathCanvas({ palette, width = 600, height = 400 }: MathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MathEngine | null>(null);
  const [equation, setEquation] = useState('sin(x)');
  const [isAnimated, setIsAnimated] = useState(false);
  const [selectedType, setSelectedType] = useState<MathFunction['type']>('trigonometric');
  const [range, setRange] = useState({ min: -10, max: 10 });
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState(true);

  // Initialize math engine
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      engineRef.current = new MathEngine(canvasRef.current, palette);
    } catch (error) {
      console.error('Failed to initialize math engine:', error);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [palette]);

  // Update palette when it changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updatePalette(palette);
    }
  }, [palette]);

  // Render graph when equation or settings change
  useEffect(() => {
    if (!engineRef.current || !isValid) return;

    const mathFunc: MathFunction = {
      type: selectedType,
      equation,
      variables: {},
      range
    };

    if (isAnimated) {
      engineRef.current.startAnimation(mathFunc);
    } else {
      engineRef.current.renderStatic(mathFunc);
    }
  }, [equation, selectedType, range, isAnimated, isValid]);

  // Validate equation whenever it changes
  useEffect(() => {
    const validation = MathEngine.validateEquation(equation);
    setIsValid(validation.isValid);
    setError(validation.error || '');
  }, [equation]);

  // Handle equation input
  const handleEquationChange = useCallback((value: string) => {
    setEquation(value);
  }, []);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: { equation: string; name: string; type: MathFunction['type'] }) => {
    setEquation(preset.equation);
    setSelectedType(preset.type);
    
    // Adjust range based on equation type
    switch (preset.type) {
      case 'trigonometric':
        setRange({ min: -2 * Math.PI, max: 2 * Math.PI });
        break;
      case 'parametric':
        setRange({ min: 0, max: 2 * Math.PI });
        break;
      case 'polar':
        setRange({ min: 0, max: 2 * Math.PI });
        break;
      case 'logarithmic':
        setRange({ min: 0.1, max: 10 });
        break;
      case 'exponential':
        setRange({ min: -3, max: 3 });
        break;
      default:
        setRange({ min: -10, max: 10 });
    }
  }, []);

  // Toggle animation
  const toggleAnimation = useCallback(() => {
    setIsAnimated(!isAnimated);
  }, [isAnimated]);

  // Get random equation
  const handleRandomEquation = useCallback(() => {
    const preset = getRandomPreset();
    handlePresetSelect(preset);
  }, [handlePresetSelect]);

  // Export as PNG
  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `snippix-math-${equation.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, [equation]);

  return (
    <div className="space-y-6">
      {/* Equation Input */}
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-4">
        <label className="block text-[#b5e853] text-sm font-mono mb-2 font-medium">
          Mathematical Expression
        </label>
        <div className="space-y-3">
          <input
            type="text"
            value={equation}
            onChange={(e) => handleEquationChange(e.target.value)}
            placeholder="Enter equation (e.g., sin(x), x^2, cos(t),sin(t))"
            className={`w-full bg-[#0a0a0a] border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 font-mono transition-all ${
              isValid 
                ? 'border-[#b5e853]/30 text-[#b5e853] focus:border-[#b5e853] focus:ring-[#b5e853]/20'
                : 'border-red-400/50 text-red-400 focus:border-red-400 focus:ring-red-400/20'
            }`}
          />
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="text-xs text-[#b5e853]/60 font-mono">
            Use: sin, cos, tan, x, t (for parametric), θ or theta (for polar), time (for animation)
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as MathFunction['type'])}
            className="px-3 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 rounded-lg text-[#8b5cf6] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
          >
            <option value="trigonometric">Trigonometric</option>
            <option value="polynomial">Polynomial</option>
            <option value="exponential">Exponential</option>
            <option value="logarithmic">Logarithmic</option>
            <option value="parametric">Parametric</option>
            <option value="polar">Polar</option>
          </select>

          <button
            onClick={toggleAnimation}
            className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
              isAnimated 
                ? 'bg-[#8b5cf6] text-white' 
                : 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 text-[#8b5cf6] hover:bg-[#8b5cf6]/20'
            }`}
            disabled={!isValid}
          >
            {isAnimated ? 'Pause' : 'Animate'}
          </button>

          <button
            onClick={handleRandomEquation}
            className="px-3 py-2 bg-[#b5e853]/10 border border-[#b5e853]/40 rounded-lg text-[#b5e853] text-sm font-mono hover:bg-[#b5e853]/20 transition-all"
          >
            Random
          </button>
        </div>

        <button
          onClick={handleExport}
          disabled={!isValid}
          className="px-3 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 rounded-lg text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/20 transition-all disabled:opacity-50"
        >
          Export PNG
        </button>
      </div>

      {/* Range Controls */}
      <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#b5e853] text-xs font-mono mb-1">Min Range</label>
            <input
              type="number"
              value={range.min}
              onChange={(e) => setRange(prev => ({ ...prev, min: parseFloat(e.target.value) || -10 }))}
              step="0.1"
              className="w-full bg-[#0a0a0a] border border-[#b5e853]/30 rounded px-3 py-2 text-[#b5e853] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#b5e853]/20"
            />
          </div>
          <div>
            <label className="block text-[#b5e853] text-xs font-mono mb-1">Max Range</label>
            <input
              type="number"
              value={range.max}
              onChange={(e) => setRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 10 }))}
              step="0.1"
              className="w-full bg-[#0a0a0a] border border-[#b5e853]/30 rounded px-3 py-2 text-[#b5e853] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#b5e853]/20"
            />
          </div>
        </div>
      </div>

      {/* Preset Equations */}
      <div className="bg-[#1a1a1a] border border-[#282828]/50 rounded-lg p-4">
        <h3 className="text-[#b5e853] text-sm font-mono font-medium mb-3">🧮 Preset Equations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(PRESET_EQUATIONS as any)[selectedType]?.map((preset: any, index: number) => (
            <button
              key={index}
              onClick={() => handlePresetSelect(preset)}
              className="text-left px-3 py-2 bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded text-[#8b5cf6] text-sm font-mono hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/40 transition-all"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs opacity-70">{preset.equation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto border border-[#282828]/50 rounded-lg bg-[#18181b]"
            style={{ maxHeight: `${height}px`, aspectRatio: `${width}/${height}` }}
          />
          
          {!isValid && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="text-center text-red-400">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="font-mono text-lg mb-2">Invalid Equation</div>
                <div className="text-sm opacity-70">Please check your mathematical expression</div>
              </div>
            </div>
          )}
        </div>

        {/* Graph Info */}
        <div className="mt-4 pt-4 border-t border-[#282828]/50">
          <div className="text-xs text-[#b5e853]/70 font-mono space-y-1">
            <div>Equation: {equation}</div>
            <div>Type: {selectedType}</div>
            <div>Range: [{range.min}, {range.max}]</div>
            <div>Animation: {isAnimated ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

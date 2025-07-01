import { generatePixelArt, type ArtConfig } from '@/lib/artGenerator';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface ArtCanvasProps {
  code: string;
  config: ArtConfig;
}

const ArtCanvas = forwardRef<HTMLCanvasElement, ArtCanvasProps>(
  ({ code, config }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      generatePixelArt(ctx, code, config);
    }, [code, config]);

    return (
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="border border-[#282828] rounded shadow-2xl"
      />
    );
  }
);

ArtCanvas.displayName = 'ArtCanvas';

export default ArtCanvas;

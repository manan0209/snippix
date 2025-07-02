import { generateArtWithCode, type ArtConfig } from '@/lib/artGenerator';
import { type EmbedOptions } from '@/lib/steganography';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface ArtCanvasProps {
  code: string;
  config: ArtConfig;
  embedOptions?: EmbedOptions;
}

const ArtCanvas = forwardRef<HTMLCanvasElement, ArtCanvasProps>(
  ({ code, config, embedOptions }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      generateArtWithCode(canvas, code, config, embedOptions);
    }, [code, config, embedOptions]);

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

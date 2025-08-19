// Math engine for equation visualization and animation in Snippix v2.1

import { evaluate, parse } from 'mathjs';
import type { MathFunction } from '@/types/animation';

export interface MathPoint {
  x: number;
  y: number;
}

export interface MathGraphData {
  points: MathPoint[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class MathEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private startTime: number = 0;
  private palette: string[] = [];

  constructor(canvas: HTMLCanvasElement, palette: string[]) {
    this.canvas = canvas;
    this.palette = palette;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = context;
  }

  // Parse and validate mathematical expression
  static validateEquation(equation: string): { isValid: boolean; error?: string } {
    try {
      // Replace common math notation
      const normalizedEq = equation
        .replace(/\^/g, '**') // Power notation
        .replace(/π/g, 'pi')
        .replace(/∞/g, 'Infinity');

      // Try to parse the equation
      parse(normalizedEq);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid equation' 
      };
    }
  }

  // Generate points for a given equation
  generatePoints(mathFunc: MathFunction, animate: boolean = false, time: number = 0): MathGraphData {
    const points: MathPoint[] = [];
  const minX = mathFunc.range.min;
  const maxX = mathFunc.range.max;
  let minY = Infinity;
  let maxY = -Infinity;

    try {
      // Prepare the equation for evaluation
  const equation = mathFunc.equation
        .replace(/\^/g, '**')
        .replace(/π/g, 'pi')
        .replace(/∞/g, 'Infinity');

      // Animation time parameter
      const t = animate ? time * 0.001 : 0;

      const step = (maxX - minX) / 1000; // 1000 points for smooth curves

      for (let x = minX; x <= maxX; x += step) {
        try {
          let y: number;

          // Handle different function types
          switch (mathFunc.type) {
            case 'parametric':
              // For parametric, we need both x and y equations
              const [xEq, yEq] = equation.split(',').map(eq => eq.trim());
              if (!xEq || !yEq) throw new Error('Parametric equations need both x and y');
              
              const xVal = evaluate(xEq.replace(/t/g, x.toString()).replace(/time/g, t.toString()));
              const yVal = evaluate(yEq.replace(/t/g, x.toString()).replace(/time/g, t.toString()));
              
              points.push({ x: xVal, y: yVal });
              minY = Math.min(minY, yVal);
              maxY = Math.max(maxY, yVal);
              continue;

            case 'polar':
              // Convert polar to cartesian
              const r = evaluate(
                equation
                  .replace(/θ/g, x.toString())
                  .replace(/theta/g, x.toString())
                  .replace(/time/g, t.toString())
              );
              const cartX = r * Math.cos(x);
              const cartY = r * Math.sin(x);
              
              points.push({ x: cartX, y: cartY });
              minY = Math.min(minY, cartY);
              maxY = Math.max(maxY, cartY);
              continue;

            default:
              // Standard y = f(x) equations
              y = evaluate(
                equation
                  .replace(/x/g, `(${x})`)
                  .replace(/time/g, t.toString())
              );
          }

          if (typeof y === 'number' && isFinite(y)) {
            points.push({ x, y });
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        } catch {
          // Skip invalid points
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating points:', error);
    }

    // Ensure we have valid bounds
    if (!isFinite(minY)) minY = -10;
    if (!isFinite(maxY)) maxY = 10;

    return {
      points,
      bounds: { minX, maxX, minY, maxY }
    };
  }

  // Render the graph on canvas
  renderGraph(graphData: MathGraphData, animate: boolean = false, time: number = 0) {
    const { width, height } = this.canvas;
    const { points, bounds } = graphData;

    // Clear canvas
    this.ctx.fillStyle = '#18181b';
    this.ctx.fillRect(0, 0, width, height);

    if (points.length === 0) return;

    // Add padding to bounds
    const padding = 0.1;
    const xRange = bounds.maxX - bounds.minX;
    const yRange = bounds.maxY - bounds.minY;
    const paddedBounds = {
      minX: bounds.minX - xRange * padding,
      maxX: bounds.maxX + xRange * padding,
      minY: bounds.minY - yRange * padding,
      maxY: bounds.maxY + yRange * padding
    };

    // Transform point to canvas coordinates
    const toCanvas = (point: MathPoint) => ({
      x: ((point.x - paddedBounds.minX) / (paddedBounds.maxX - paddedBounds.minX)) * width,
      y: height - ((point.y - paddedBounds.minY) / (paddedBounds.maxY - paddedBounds.minY)) * height
    });

    // Draw grid
    this.drawGrid(paddedBounds, width, height);

    // Draw axes
    this.drawAxes(paddedBounds, width, height);

    // Draw the curve
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.palette[1] || '#b5e853';
    this.ctx.lineWidth = 2;

    let started = false;
    points.forEach((point, index) => {
      const canvasPoint = toCanvas(point);
      
      if (!started) {
        this.ctx.moveTo(canvasPoint.x, canvasPoint.y);
        started = true;
      } else {
        this.ctx.lineTo(canvasPoint.x, canvasPoint.y);
      }

      // Add animated dots for visual appeal
      if (animate && index % 20 === 0) {
        const pulseSize = 2 + Math.sin(time * 0.01 + index * 0.1) * 1;
        this.ctx.save();
        this.ctx.fillStyle = this.palette[2] || '#8b5cf6';
        this.ctx.beginPath();
        this.ctx.arc(canvasPoint.x, canvasPoint.y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });

    this.ctx.stroke();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private drawGrid(bounds: any, width: number, height: number) {
    this.ctx.strokeStyle = '#282828';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 4]);

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private drawAxes(bounds: any, width: number, height: number) {
    this.ctx.strokeStyle = this.palette[3] || '#4ecdc4';
    this.ctx.lineWidth = 2;

    // X-axis (y=0)
    if (bounds.minY <= 0 && bounds.maxY >= 0) {
      const y = height - ((0 - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Y-axis (x=0)
    if (bounds.minX <= 0 && bounds.maxX >= 0) {
      const x = ((0 - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
  }

  // Start animated rendering
  startAnimation(mathFunc: MathFunction) {
    if (this.animationId) return;
    
    this.startTime = Date.now();
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.startTime;
      
      const graphData = this.generatePoints(mathFunc, true, elapsedTime);
      this.renderGraph(graphData, true, elapsedTime);
    };
    
    animate();
  }

  // Stop animation
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Render static graph
  renderStatic(mathFunc: MathFunction) {
    this.stopAnimation();
    const graphData = this.generatePoints(mathFunc);
    this.renderGraph(graphData);
  }

  // Update palette
  updatePalette(newPalette: string[]) {
    this.palette = newPalette;
  }

  // Cleanup
  dispose() {
    this.stopAnimation();
  }
}

// Preset equations for easy access
export const PRESET_EQUATIONS = {
  trigonometric: [
    { equation: 'sin(x)', name: 'Sine Wave', type: 'trigonometric' as const },
    { equation: 'cos(x)', name: 'Cosine Wave', type: 'trigonometric' as const },
    { equation: 'tan(x)', name: 'Tangent', type: 'trigonometric' as const },
    { equation: 'sin(x) + sin(2*x)', name: 'Wave Interference', type: 'trigonometric' as const },
    { equation: 'sin(x + time)', name: 'Animated Sine', type: 'trigonometric' as const },
  ],
  polynomial: [
    { equation: 'x**2', name: 'Parabola', type: 'polynomial' as const },
    { equation: 'x**3', name: 'Cubic', type: 'polynomial' as const },
    { equation: 'x**2 - 4', name: 'Shifted Parabola', type: 'polynomial' as const },
    { equation: '0.1*x**3 - x', name: 'Cubic Wave', type: 'polynomial' as const },
  ],
  exponential: [
    { equation: 'exp(x)', name: 'Exponential', type: 'exponential' as const },
    { equation: '2**x', name: 'Power of 2', type: 'exponential' as const },
    { equation: 'exp(-x**2)', name: 'Gaussian', type: 'exponential' as const },
  ],
  logarithmic: [
    { equation: 'log(x)', name: 'Natural Log', type: 'logarithmic' as const },
    { equation: 'log10(x)', name: 'Base 10 Log', type: 'logarithmic' as const },
    { equation: 'log(abs(x))', name: 'Absolute Log', type: 'logarithmic' as const },
  ],
  parametric: [
    { equation: 'cos(t), sin(t)', name: 'Circle', type: 'parametric' as const },
    { equation: 't*cos(t), t*sin(t)', name: 'Spiral', type: 'parametric' as const },
    { equation: 'cos(t) + cos(t*time*0.01), sin(t) + sin(t*time*0.01)', name: 'Animated Flower', type: 'parametric' as const },
  ],
  polar: [
    { equation: '1', name: 'Circle (Polar)', type: 'polar' as const },
    { equation: 'sin(4*θ)', name: 'Four-Petal Rose', type: 'polar' as const },
    { equation: '1 + sin(6*θ)', name: 'Six-Petal Rose', type: 'polar' as const },
    { equation: 'θ', name: 'Spiral (Polar)', type: 'polar' as const },
  ]
} as const;

export function getRandomPreset(): { equation: string; name: string; type: MathFunction['type'] } {
  const categories = Object.values(PRESET_EQUATIONS);
  const allPresets = categories.flat();
  return allPresets[Math.floor(Math.random() * allPresets.length)];
}

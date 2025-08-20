// Animation engine for Snippix v2.1 - transforms 2D pixel art into 3D animations

import * as THREE from 'three';
import GIF from 'gif.js';
import { AnimationStyle, ExportOptions, PixelData, Animation3DConfig, ANIMATION_STYLES } from '@/types/animation';

export class AnimationEngine {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private pixelMeshes: THREE.Mesh[] = [];
    private artType: string = 'abstract'; // Track art type for custom animation
  private config: Animation3DConfig;
  private startTime: number = 0;

  constructor(canvas: HTMLCanvasElement, config: Animation3DConfig) {
    this.config = config;
    this.initThreeJS(canvas);
  }

  private initThreeJS(canvas: HTMLCanvasElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#18181b');

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.canvasWidth / this.config.canvasHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 100);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.config.canvasWidth, this.config.canvasHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(ambientLight, directionalLight);
  }

  // Extract pixel data from 2D canvas
  static extractPixelData(canvas: HTMLCanvasElement): PixelData[] {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixels: PixelData[] = [];

    const pixelSize = 12; // Match the optimal pixel size from main app
    const cols = Math.floor(canvas.width / pixelSize);
    const rows = Math.floor(canvas.height / pixelSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const pixelX = x * pixelSize + pixelSize / 2;
        const pixelY = y * pixelSize + pixelSize / 2;
        const index = (Math.floor(pixelY) * canvas.width + Math.floor(pixelX)) * 4;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // Only include visible pixels that aren't background color
        if (a > 0 && !(r === 24 && g === 24 && b === 27)) { // Skip background #18181b
          pixels.push({
            x: x - cols / 2, // Center the art
            y: -(y - rows / 2), // Flip Y for 3D space
            color: `rgb(${r}, ${g}, ${b})`,
            size: pixelSize
          });
        }
      }
    }

    return pixels;
  }

  // Create 3D meshes from pixel data
  createPixelMeshes(pixels: PixelData[]) {
    // Clear existing meshes
    this.pixelMeshes.forEach(mesh => this.scene.remove(mesh));
    this.pixelMeshes = [];

    // Try to infer artType from pixel data (if available)
    if (pixels.length && pixels[0].artType) {
      this.artType = pixels[0].artType;
    } else {
      this.artType = 'abstract';
    }

    pixels.forEach(pixel => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: pixel.color,
        transparent: true,
        opacity: 0.9
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pixel.x, pixel.y, 0);
      // Assign pixel role if available (for fun animations)
      mesh.userData = {
        originalPosition: { x: pixel.x, y: pixel.y, z: 0 },
        role: pixel.role || 'body'
      };

      this.scene.add(mesh);
      this.pixelMeshes.push(mesh);
    });
  }

  // Animation styles
  // --- Fun, art-type-aware animations ---
  private animateCat(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      const { role } = mesh.userData;
      // Cat tail: wag
      if (role === 'tail') {
        mesh.position.z = Math.sin(time * 0.005 + i * 0.2) * 6;
        mesh.rotation.y = Math.sin(time * 0.004 + i * 0.3) * 0.7;
      }
      // Cat ears: twitch
      else if (role === 'ear') {
        mesh.position.z = Math.sin(time * 0.008 + i) * 2;
        mesh.rotation.x = Math.sin(time * 0.01 + i) * 0.3;
      }
      // Cat eyes: blink
      else if (role === 'eye') {
        mesh.scale.y = 1 - Math.abs(Math.sin(time * 0.006 + i * 0.5)) * 0.7;
      }
      // Cat body: breathe
      else {
        mesh.scale.x = 1 + Math.sin(time * 0.002 + i * 0.1) * 0.08;
        mesh.scale.y = 1 + Math.sin(time * 0.002 + i * 0.1) * 0.08;
      }
    });
  }

  private animateDog(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      const { role } = mesh.userData;
      // Dog tail: wag
      if (role === 'tail') {
        mesh.position.z = Math.sin(time * 0.006 + i * 0.2) * 7;
        mesh.rotation.y = Math.sin(time * 0.005 + i * 0.3) * 0.8;
      }
      // Dog ears: flop
      else if (role === 'ear') {
        mesh.position.z = Math.sin(time * 0.009 + i) * 2.5;
        mesh.rotation.x = Math.sin(time * 0.012 + i) * 0.4;
      }
      // Dog eyes: blink
      else if (role === 'eye') {
        mesh.scale.y = 1 - Math.abs(Math.sin(time * 0.007 + i * 0.5)) * 0.6;
      }
      // Dog body: pant
      else {
        mesh.scale.x = 1 + Math.sin(time * 0.003 + i * 0.1) * 0.09;
        mesh.scale.y = 1 + Math.sin(time * 0.003 + i * 0.1) * 0.09;
      }
    });
  }

  private animateAbstract(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      mesh.position.z = Math.sin(time * 0.004 + i * 0.2) * 5;
      mesh.rotation.x = Math.sin(time * 0.003 + i * 0.1) * 0.5;
      mesh.rotation.y = Math.cos(time * 0.002 + i * 0.1) * 0.5;
      mesh.scale.x = 1 + Math.sin(time * 0.002 + i * 0.2) * 0.2;
      mesh.scale.y = 1 + Math.cos(time * 0.002 + i * 0.2) * 0.2;
    });
  }

  private animateMandala(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      mesh.rotation.z = Math.sin(time * 0.003 + i * 0.1) * 1.5;
      mesh.scale.x = 1 + Math.sin(time * 0.002 + i * 0.2) * 0.3;
      mesh.scale.y = 1 + Math.cos(time * 0.002 + i * 0.2) * 0.3;
    });
  }

  private animateLandscape(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      mesh.position.z = Math.sin(time * 0.002 + i * 0.1) * 3;
      mesh.scale.y = 1 + Math.sin(time * 0.001 + i * 0.2) * 0.1;
    });
  }

  private animateCreature(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      mesh.position.z = Math.sin(time * 0.003 + i * 0.2) * 4;
      mesh.rotation.x = Math.sin(time * 0.002 + i * 0.1) * 0.7;
      mesh.scale.x = 1 + Math.sin(time * 0.002 + i * 0.2) * 0.15;
      mesh.scale.y = 1 + Math.cos(time * 0.002 + i * 0.2) * 0.15;
    });
  }

  private animateCosmic(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      mesh.position.z = Math.sin(time * 0.005 + i * 0.3) * 8;
      mesh.rotation.y = Math.sin(time * 0.004 + i * 0.2) * 1.2;
      mesh.scale.x = 1 + Math.sin(time * 0.002 + i * 0.2) * 0.25;
      mesh.scale.y = 1 + Math.cos(time * 0.002 + i * 0.2) * 0.25;
    });
  }

  private animateCircuit(time: number) {
    this.pixelMeshes.forEach((mesh, i) => {
      mesh.position.z = Math.sin(time * 0.004 + i * 0.2) * 2;
      mesh.rotation.x = Math.sin(time * 0.003 + i * 0.1) * 0.3;
      mesh.rotation.y = Math.cos(time * 0.002 + i * 0.1) * 0.3;
    });
  }

  // Start animation
  startAnimation() {
    if (this.animationId) return;
    
    this.startTime = Date.now();

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.startTime;

      // --- Art-type-aware animation ---
      switch (this.artType) {
        case 'cat':
          this.animateCat(elapsedTime);
          break;
        case 'dog':
          this.animateDog(elapsedTime);
          break;
        case 'mandala':
          this.animateMandala(elapsedTime);
          break;
        case 'landscape':
          this.animateLandscape(elapsedTime);
          break;
        case 'creature':
          this.animateCreature(elapsedTime);
          break;
        case 'cosmic':
          this.animateCosmic(elapsedTime);
          break;
        case 'circuit':
          this.animateCircuit(elapsedTime);
          break;
        case 'geometric':
          this.animateAbstract(elapsedTime);
          break;
        default:
          this.animateAbstract(elapsedTime);
      }

      this.renderer.render(this.scene, this.camera);
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

  // Export animation as GIF
  async exportAsGif(options: ExportOptions): Promise<Blob> {
  return new Promise((resolve) => {
      const gif = new GIF({
        workers: 2,
        quality: options.quality === 'high' ? 5 : options.quality === 'medium' ? 10 : 20,
        width: options.width || this.config.canvasWidth,
        height: options.height || this.config.canvasHeight,
      });

      const canvas = this.renderer.domElement;
      const frameCount = Math.floor(options.fps * options.duration);
      const frameDelay = 1000 / options.fps;
      let currentFrame = 0;

      const captureFrame = () => {
        if (currentFrame >= frameCount) {
          gif.on('finished', (blob: Blob) => resolve(blob));
          gif.render();
          return;
        }

        // Render frame
        const time = (currentFrame / frameCount) * options.duration * 1000;
        this.startTime = Date.now() - time;
        
        // Force render one frame
        this.renderer.render(this.scene, this.camera);
        
        // Add frame to GIF
        gif.addFrame(canvas, { copy: true, delay: frameDelay });
        
        currentFrame++;
        setTimeout(captureFrame, 10); // Small delay between captures
      };

      captureFrame();
    });
  }

  // Resize renderer
  resize(width: number, height: number) {
    this.config.canvasWidth = width;
    this.config.canvasHeight = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Cleanup
  dispose() {
    this.stopAnimation();
    this.pixelMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
    });
    this.renderer.dispose();
  }
}

// Utility functions
export function getAnimationStyleById(id: string): AnimationStyle | undefined {
  return ANIMATION_STYLES.find(style => style.id === id);
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

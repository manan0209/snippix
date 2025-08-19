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

    pixels.forEach(pixel => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: pixel.color,
        transparent: true,
        opacity: 0.9
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pixel.x, pixel.y, 0);
      mesh.userData = { originalPosition: { x: pixel.x, y: pixel.y, z: 0 } };

      this.scene.add(mesh);
      this.pixelMeshes.push(mesh);
    });
  }

  // Animation styles
  private animateExtrusion(time: number) {
    this.pixelMeshes.forEach((mesh) => {
      const wave = Math.sin(time * 0.002) * 0.5 + 0.5;
      mesh.scale.setZ(1 + wave * 2);
      mesh.position.z = wave * 5;
    });
  }

  private animateWave(time: number) {
    this.pixelMeshes.forEach((mesh) => {
      const original = mesh.userData.originalPosition;
      const wave = Math.sin(time * 0.003 + original.x * 0.2 + original.y * 0.1) * 3;
      mesh.position.z = wave;
      mesh.rotation.z = wave * 0.1;
    });
  }

  private animateRotation(time: number) {
    this.pixelMeshes.forEach((mesh) => {
      const original = mesh.userData.originalPosition;
      mesh.rotation.x = time * 0.001;
      mesh.rotation.y = time * 0.0015 + original.x * 0.05;
      mesh.rotation.z = Math.sin(time * 0.002) * 0.3;
    });

    // Rotate camera around the art
    const radius = 80;
    this.camera.position.x = Math.cos(time * 0.0005) * radius;
    this.camera.position.z = Math.sin(time * 0.0005) * radius + 50;
    this.camera.lookAt(0, 0, 0);
  }

  private animateParticles(time: number) {
    this.pixelMeshes.forEach((mesh) => {
      const original = mesh.userData.originalPosition;
      const floatAmount = Math.sin(time * 0.002) * 10;
      const driftX = Math.cos(time * 0.001) * 2;
      const driftY = Math.sin(time * 0.0015) * 2;
      
      mesh.position.x = original.x + driftX;
      mesh.position.y = original.y + driftY;
      mesh.position.z = floatAmount;
      
      mesh.rotation.x = time * 0.003;
      mesh.rotation.y = time * 0.002;
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
      
      // Apply animation based on style
      switch (this.config.animationStyle.id) {
        case 'extrusion':
          this.animateExtrusion(elapsedTime);
          break;
        case 'wave':
          this.animateWave(elapsedTime);
          break;
        case 'rotation':
          this.animateRotation(elapsedTime);
          break;
        case 'particles':
          this.animateParticles(elapsedTime);
          break;
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

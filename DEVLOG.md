# Snippix Development Log

Sophisticated code art generator that transforms any text into beautiful pixel art with advanced steganographic capabilities. Built with Next.js, React, and TypeScript.

## Current Features
- **Art Generation**: Five distinct styles (creature, landscape, geometric, cosmic, abstract)
- **Universal Input**: Accepts any text - code, messages, poetry, stories
- **Interactive Palettes**: Live color palette switching with visual preview
- **LSB Steganography**: Robust pixel-based embedding with UTF-8 support
- **XOR Encryption**: Optional password protection for embedded content
- **Global Community**: Real-time heart counter with Vercel KV persistence
- **Professional UI**: Clean interface with purple interactive elements
- **Production Ready**: Zero dependencies, client-side processing, reliable downloads

## Technical Implementation
- **Deterministic Art**: Content analysis drives style selection and pattern generation
- **LSB Encoding**: Least Significant Bit steganography with error handling
- **Minimum Visibility**: Guaranteed visual elements for sparse text patterns
- **Vercel KV Integration**: Persistent global features with graceful fallbacks
- **Canvas Optimization**: Efficient pixel manipulation and rendering
- **Client-Side Processing**: No server dependencies for core functionality

## Architecture Highlights
- **Modular Design**: Clean separation between art generation, steganography, and UI
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Error Resilience**: Comprehensive error handling and user feedback
- **Scalability**: Client-side processing supports unlimited concurrent users
- **Privacy**: All steganographic operations happen in the browser

## Recent Technical Achievements
- **Vercel KV Setup**: Migrated from file-based to Redis-compatible persistent storage
- **Art Algorithm Enhancement**: Solved empty pixel art with multi-layer visibility system
- **Performance Optimization**: Reduced bundle size and improved rendering speed
- **Production Deployment**: Live at [snippixbymnn.vercel.app](https://snippixbymnn.vercel.app/)
- **Community Engagement**: Global heart counter showing real community interaction

---

Built for Hack Club Summer of Code 2025 • [Live Demo](https://snippixbymnn.vercel.app/) • [Technical Deep Dive](./HOW_IT_WORKS.md)

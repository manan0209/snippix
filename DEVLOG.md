# Snippix Development Log

Code art generator that transforms source code into pixel art patterns with optional steganographic embedding. Built with Next.js, React, and TypeScript.

---

## Version 1.0 - Core Art Generation
- Code to pixel art transformation with deterministic patterns
- Multiple color palettes and configurable pixel sizes
- Canvas-based rendering with downloadable PNG output
- Responsive UI with real-time preview

## Version 2.0 - Reversible Art Cards
- LSB steganography for embedding code in pixel data
- Optional XOR encryption with user-provided keys
- Decode modal for extracting embedded code from images
- Browser-compatible implementation without external dependencies

## Current Features
- Art generation from any text input
- Color palette selection (retro, neon, sunset, monochrome, etc.)
- Pixel size customization (4px to 16px)
- Code embedding with optional password protection
- Image decoding with visual feedback
- Copy to clipboard and text file download

## Technical Implementation
- Deterministic art generation based on code content analysis
- Least Significant Bit encoding for data embedding
- Canvas-to-blob conversion for reliable image downloads
- Client-side processing without server dependencies

---

Built for Hack Club Summer of Code 2025.

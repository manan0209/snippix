# Snippix v1.0: Simple & Awesome Code Art Generator

Snippix is a simple and awesome code art generator built with Next.js, React, and TypeScript. Transform any code snippet into beautiful, retro pixel art patterns. Each piece is unique and generated from your code's structure and content.

## Features (v1.0)
- Submit code snippets in any programming language
- Generate unique, beautiful pixel art from code structure
- Interactive art customization (color palettes, pixel sizes)
- Download generated art as PNG images
- Retro minimalistic coding aesthetic
- Modular, scalable architecture

## Coming in v2.0

- **Reversible Art Cards**: Embed code snippets within pixel art using steganography
- **Code Encryption**: Optional encryption with user-provided keys for privacy
- **Art Decoding**: Extract and decrypt code from shared art images
- **Secure Sharing**: Share art that contains hidden code snippets

## Architecture

This project follows a clean, modular architecture:

```
/src
  /lib          # Core business logic (pure functions)
    - palettes.ts       # Color palette definitions
    - artGenerator.ts   # Pixel art generation algorithms  
    - steganography.ts  # Code embedding/extraction (future)
  /components   # Reusable UI components
    - CodeInput.tsx
    - ArtCanvas.tsx
    - PaletteSelector.tsx
    - PixelSizeSelector.tsx
    - DownloadButton.tsx
    - DecodeArtModal.tsx
  /app          # Next.js app router
    - layout.tsx
    - page.tsx
    - globals.css
```

---

Made with ❤️ for Hack Club Summer of Code.

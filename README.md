# Snippix

A sophisticated code art generator that transforms any text or code into beautiful pixel art with advanced steganographic capabilities. Built with Next.js, React, and TypeScript.

**[Try Snippix Live](https://snippixbymnn.vercel.app/)**

## Features

- **Intelligent Art Generation**: Creates recognizable pixel art patterns including creatures, landscapes, geometric designs, cosmic scenes, and abstract art based on content analysis
- **Universal Content Support**: Accepts any text input - code, messages, poetry, or stories
- **Multiple Art Styles**: Deterministic algorithms generate distinct visual styles based on content characteristics  
- **Interactive Color Palettes**: Live palette switching with visual preview
- **LSB Steganography**: Robust pixel-based embedding using Least Significant Bit encoding
- **XOR Encryption**: Optional password protection for embedded content
- **Global Community Features**: Real-time heart counter showing community engagement
- **Production Ready**: Zero dependencies, client-side processing, reliable PNG downloads

## Usage

### Art Generation
1. Enter any text content in the input field
2. Select from available color palettes using the interactive selector
3. Generate pixel art with automatic style selection based on content
4. Download high-quality PNG files

### Content Embedding
1. Enable embedding to hide text within pixel data
2. Optionally add encryption with custom password
3. Generated images preserve embedded data through downloads and sharing
4. Works with any content type - code, messages, or documents

### Content Extraction  
1. Use the decode feature to extract hidden content from Snippix images
2. Enter decryption password if the image was encrypted
3. Copy extracted text or download as file

## Technical Architecture

### Core Systems
- **Art Engine**: Five distinct algorithms (creature, landscape, geometric, cosmic, abstract)
- **Steganography**: UTF-8 compatible LSB encoding with error handling
- **Encryption**: XOR cipher with password-based security
- **UI/UX**: Professional interface with interactive elements and real-time feedback

### Project Structure

```
/src
  /lib
    - artGenerator.ts        # Multi-style pixel art generation
    - steganography.ts       # LSB encoding/decoding with UTF-8 support  
    - palettes.ts           # Color palette definitions and selectors
  /components
    - CodeInput.tsx         # Universal text input interface
    - ArtCanvas.tsx         # Canvas rendering and art generation
    - DecodeArtModal.tsx    # Content extraction interface
    - DownloadButton.tsx    # File download management
  /app
    - page.tsx             # Main application with global state
    - layout.tsx           # Application layout and metadata
    - /api/hearts          # Global community counter API
```

## Development

```bash
npm install
npm run dev
npm run build
```

**[Read HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** for a detailed technical explanation of the algorithms and architecture.

## Deployment

Optimized for Vercel deployment with API routes for community features. All steganographic operations run client-side for privacy and reliability.

---

Built for Hack Club Summer of Code 2025

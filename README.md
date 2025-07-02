# Snippix

Code art generator that transforms source code into pixel art patterns with steganographic embedding capabilities. Built with Next.js, React, and TypeScript.

## Features

- Generate deterministic pixel art from any text input
- Multiple color palettes and configurable pixel sizes
- LSB steganography for embedding code within pixel data
- Optional XOR encryption with user-provided keys
- Browser-compatible PNG downloads with embedded data preservation
- Client-side processing without external dependencies
- Decode embedded code from generated images

## Usage

### Basic Art Generation
1. Input source code or text in any format
2. Select color palette and pixel size
3. Generate and download pixel art as PNG

### Code Embedding
1. Enable embedding option in the interface
2. Optionally set encryption password for security
3. Generate art with code embedded in pixel LSB data
4. Share downloaded PNG files - embedded data survives compression

### Code Extraction
1. Upload Snippix-generated image using decode modal
2. Enter decryption password if image was encrypted
3. Extract embedded code with copy and download options

## Technical Implementation

### Core Components
- **Art Generation**: Deterministic algorithms based on code structure analysis
- **Steganography**: Least Significant Bit encoding in RGB channels
- **Encryption**: XOR cipher with user-provided keys
- **File Handling**: Canvas-to-blob conversion for reliable downloads

### Architecture

```
/src
  /lib
    - artGenerator.ts        # Pixel art generation algorithms  
    - steganography.ts       # LSB encoding/decoding
    - palettes.ts           # Color scheme definitions
  /components
    - CodeInput.tsx         # Text input interface
    - ArtCanvas.tsx         # Canvas rendering component
    - DecodeArtModal.tsx    # Extraction interface
    - DownloadButton.tsx    # File download handling
  /app
    - page.tsx             # Main application
    - layout.tsx           # Application layout
```

## Development

```bash
npm install
npm run dev
```

Built for Hack Club Summer of Code 2025.

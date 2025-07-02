/**
 * Simple and Fun Pixel Art Steganography for Snippix
 * Embeds code/messages directly into pixel data using LSB encoding
 */

export interface EmbedOptions {
  useEncryption?: boolean;
  encryptionKey?: string;
}

export interface DecodeResult {
  success: boolean;
  code?: string;
  error?: string;
  method: string;
}

const SNIPPIX_HEADER = "SNIPPIX";
const VERSION = "1.0";

/**
 * Simple XOR encryption/decryption
 */
function xorEncrypt(text: string, key: string): string {
  if (!key) return text;

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(textChar ^ keyChar);
  }
  return result;
}

function xorDecrypt(encryptedText: string, key: string): string {
  return xorEncrypt(encryptedText, key);
}

/**
 * Convert string to binary representation
 */
function stringToBinary(str: string): string {
  return str
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

/**
 * Convert binary representation back to string
 */
function binaryToString(binary: string): string {
  const chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte.length === 8) {
      chars.push(String.fromCharCode(parseInt(byte, 2)));
    }
  }
  return chars.join("");
}

/**
 * Embed code into canvas pixel data using LSB steganography
 */
export function embedCodeInPixels(
  canvas: HTMLCanvasElement,
  code: string,
  options: EmbedOptions = {}
): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get canvas context");
      return false;
    }

    let dataToEmbed = code;
    if (options.useEncryption && options.encryptionKey) {
      dataToEmbed = xorEncrypt(code, options.encryptionKey);
    }

    const payload = {
      header: SNIPPIX_HEADER,
      version: VERSION,
      encrypted: !!options.useEncryption,
      timestamp: Date.now(),
      code: dataToEmbed,
    };

    const payloadString = JSON.stringify(payload);
    const payloadBinary = stringToBinary(payloadString);

    const lengthBinary = payloadString.length.toString(2).padStart(32, "0");
    const fullBinary = lengthBinary + payloadBinary;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const availableBits = (data.length / 4) * 3;
    if (fullBinary.length > availableBits) {
      console.error(
        `Not enough pixels to embed data. Need ${fullBinary.length} bits, have ${availableBits}`
      );
      return false;
    }

    let bitIndex = 0;
    for (let i = 0; i < data.length && bitIndex < fullBinary.length; i += 4) {
      for (
        let channel = 0;
        channel < 3 && bitIndex < fullBinary.length;
        channel++
      ) {
        const pixelIndex = i + channel;
        const bit = parseInt(fullBinary[bitIndex]);

        data[pixelIndex] = (data[pixelIndex] & 0xfe) | bit;
        bitIndex++;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    return true;
  } catch (error) {
    console.error("Failed to embed code:", error);
    return false;
  }
}

/**
 * Extract code from canvas pixel data using LSB steganography
 */
export function extractCodeFromPixels(
  canvas: HTMLCanvasElement,
  decryptionKey?: string
): DecodeResult {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        success: false,
        error: "Could not get canvas context",
        method: "LSB",
      };
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let lengthBinary = "";
    let bitIndex = 0;

    for (let i = 0; i < data.length && lengthBinary.length < 32; i += 4) {
      for (
        let channel = 0;
        channel < 3 && lengthBinary.length < 32;
        channel++
      ) {
        const pixelIndex = i + channel;
        const bit = data[pixelIndex] & 1;
        lengthBinary += bit.toString();
      }
    }

    const payloadLength = parseInt(lengthBinary, 2);
    if (payloadLength <= 0 || payloadLength > 100000) {
      return {
        success: false,
        error: "Invalid payload length found",
        method: "LSB",
      };
    }

    const payloadBits = payloadLength * 8;
    let payloadBinary = "";
    bitIndex = 32;

    for (
      let i = 0;
      i < data.length && payloadBinary.length < payloadBits;
      i += 4
    ) {
      for (
        let channel = 0;
        channel < 3 && payloadBinary.length < payloadBits;
        channel++
      ) {
        if (bitIndex > 0) {
          bitIndex--;
          continue;
        }

        const pixelIndex = i + channel;
        const bit = data[pixelIndex] & 1;
        payloadBinary += bit.toString();
      }
    }

    if (payloadBinary.length < payloadBits) {
      return {
        success: false,
        error: "Incomplete payload data found",
        method: "LSB",
      };
    }

    // Convert binary back to string
    const payloadString = binaryToString(payloadBinary);

    try {
      const payload = JSON.parse(payloadString);

      // Verify it's a Snippix payload
      if (payload.header !== SNIPPIX_HEADER) {
        return {
          success: false,
          error: "Not a Snippix art card",
          method: "LSB",
        };
      }

      let extractedCode = payload.code;

      // Decrypt if needed
      if (payload.encrypted) {
        if (!decryptionKey) {
          return {
            success: false,
            error:
              "This art card contains encrypted code. Please provide the decryption key.",
            method: "LSB",
          };
        }

        try {
          extractedCode = xorDecrypt(extractedCode, decryptionKey);
        } catch (error) {
          return {
            success: false,
            error: "Failed to decrypt. Check your key.",
            method: "LSB",
          };
        }
      }

      return {
        success: true,
        code: extractedCode,
        method: "LSB",
      };
    } catch (error) {
      return { success: false, error: "Invalid payload format", method: "LSB" };
    }
  } catch (error) {
    console.error("Failed to extract code:", error);
    return {
      success: false,
      error: "Failed to extract code from image",
      method: "LSB",
    };
  }
}

/**
 * Extract code from an uploaded image file
 */
export function extractCodeFromImageFile(
  imageFile: File,
  decryptionKey?: string
): Promise<DecodeResult> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const canvas = document.createElement("canvas");

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({
              success: false,
              error: "Could not create canvas context",
              method: "LSB",
            });
            return;
          }

          // Draw the image to canvas so we can read pixel data
          ctx.drawImage(img, 0, 0);

          // Extract code from pixels
          const result = extractCodeFromPixels(canvas, decryptionKey);
          resolve(result);
        } catch (error) {
          console.error("Error processing image:", error);
          resolve({
            success: false,
            error: "Failed to process image",
            method: "LSB",
          });
        }
      };

      img.onerror = () => {
        resolve({
          success: false,
          error: "Failed to load image",
          method: "LSB",
        });
      };

      // Load the image file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          resolve({
            success: false,
            error: "Failed to read image file",
            method: "LSB",
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Failed to read image file",
          method: "LSB",
        });
      };

      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error("Failed to extract code from image file:", error);
      resolve({
        success: false,
        error: "Failed to extract code from image",
        method: "LSB",
      });
    }
  });
}

/**
 * Test if an image likely contains embedded code
 */
export function hasEmbeddedCode(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Extract first 32 bits to get length
    let lengthBinary = "";
    for (let i = 0; i < data.length && lengthBinary.length < 32; i += 4) {
      for (
        let channel = 0;
        channel < 3 && lengthBinary.length < 32;
        channel++
      ) {
        const pixelIndex = i + channel;
        const bit = data[pixelIndex] & 1;
        lengthBinary += bit.toString();
      }
    }

    const payloadLength = parseInt(lengthBinary, 2);
    return payloadLength > 0 && payloadLength < 100000; // Reasonable bounds
  } catch {
    return false;
  }
}

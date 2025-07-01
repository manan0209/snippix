import { decodeCodeFromImage, type DecodeResult } from '@/lib/steganography';
import React, { useState } from 'react';

interface DecodeArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeDecoded: (code: string) => void;
}

export default function DecodeArtModal({ isOpen, onClose, onCodeDecoded }: DecodeArtModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid image file.');
    }
  };

  const handleDecode = async () => {
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    setIsDecoding(true);
    setError('');

    try {
      const result: DecodeResult = await decodeCodeFromImage(file, decryptionKey || undefined);
      
      if (result.success && result.code) {
        onCodeDecoded(result.code);
        onClose();
      } else {
        setError(result.error || 'Failed to decode code from image.');
      }
    } catch {
      setError('An error occurred while decoding the image.');
    } finally {
      setIsDecoding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18181b] border border-[#282828] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#8b5cf6] font-mono tracking-widest uppercase">
              🔮 v2.0 Preview
            </h2>
            <p className="text-xs text-[#8b5cf6]/70 font-mono">Decode Art Card (Coming Soon)</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#b5e853] hover:text-[#d6ff7f] text-2xl"
          >
            ×
          </button>
        </div>

        {/* Preview notice */}
        <div className="mb-4 p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded">
          <p className="text-[#8b5cf6] text-sm font-mono">
            This is a preview of v2.0 features. Code embedding and decryption will be available in the next major release.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#b5e853] text-sm font-mono mb-2">
              Select Art Card Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-[#b5e853] bg-[#111] border border-[#282828] rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[#b5e853] text-sm font-mono mb-2">
              Decryption Key (Optional)
            </label>
            <input
              type="password"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              placeholder="Enter key if image is encrypted"
              className="w-full bg-[#111] border border-[#282828] rounded px-3 py-2 text-[#b5e853] text-sm focus:border-[#b5e853] focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-mono">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-[#282828] text-[#b5e853] rounded font-mono hover:bg-[#282828] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDecode}
              disabled={!file || isDecoding}
              className="flex-1 py-2 bg-[#b5e853] text-[#18181b] rounded font-mono font-bold hover:bg-[#d6ff7f] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isDecoding ? 'Decoding...' : 'Decode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { type EmbedOptions } from '@/lib/steganography';
import React, { useState } from 'react';

interface EmbedOptionsProps {
  onOptionsChange: (options: EmbedOptions | undefined) => void;
}

export default function EmbedOptions({ onOptionsChange }: EmbedOptionsProps) {
  const [enableEmbedding, setEnableEmbedding] = useState(false);
  const [useEncryption, setUseEncryption] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');

  const handleChange = () => {
    if (!enableEmbedding) {
      onOptionsChange(undefined);
      return;
    }

    const options: EmbedOptions = {
      useEncryption: useEncryption && encryptionKey.length > 0,
      encryptionKey: useEncryption ? encryptionKey : undefined
    };

    onOptionsChange(options);
  };

  React.useEffect(() => {
    handleChange();
  }, [enableEmbedding, useEncryption, encryptionKey]);

  return (
    <div className="bg-[#1a1a1a] border border-[#b5e853]/20 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-[#b5e853] font-mono font-bold tracking-wide text-lg">
          🎨 Secret Art Cards
        </h3>
      </div>

      <div className="space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enableEmbedding}
            onChange={(e) => setEnableEmbedding(e.target.checked)}
            className="w-5 h-5 text-[#b5e853] bg-[#111] border-[#b5e853]/50 rounded focus:ring-[#b5e853] focus:ring-2"
          />
          <span className="text-[#b5e853] font-mono font-medium">
            Hide your code inside the art pixels
          </span>
        </label>

        {enableEmbedding && (
          <div className="ml-8 space-y-4 pl-4 border-l-2 border-[#b5e853]/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useEncryption}
                onChange={(e) => setUseEncryption(e.target.checked)}
                className="w-4 h-4 text-[#b5e853] bg-[#111] border-[#b5e853]/50 rounded focus:ring-[#b5e853] focus:ring-2"
              />
              <span className="text-[#b5e853] text-sm font-mono">
                🔐 Encrypt with password for security
              </span>
            </label>

            {useEncryption && (
              <div className="bg-[#111]/50 rounded-lg p-4">
                <label className="block text-[#b5e853] text-sm font-mono mb-3 font-medium">
                  🗝️ Encryption Password
                </label>
                <input
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Enter secure password..."
                  className="w-full bg-[#0a0a0a] border border-[#b5e853]/30 rounded-lg px-4 py-3 text-[#b5e853] text-sm focus:border-[#b5e853] focus:outline-none focus:ring-2 focus:ring-[#b5e853]/20 font-mono transition-all"
                />
                <p className="text-xs text-[#b5e853]/70 mt-2 font-mono">
                  💡 Remember this password - you&apos;ll need it to decode your art later
                </p>
              </div>
            )}
          </div>
        )}

        {enableEmbedding && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[#b5e853]/5 to-[#b5e853]/10 border border-[#b5e853]/20 rounded-lg">
            <div className="text-sm text-[#b5e853]/90 font-mono space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-base">🎨</span>
                <strong>Pixel Magic:</strong> Your code is hidden directly in the art pixels
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">🤝</span>
                Share your art and others can extract your code using the &quot;Decode Art&quot; feature
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">📦</span>
                Works reliably with downloaded PNG files - no metadata needed!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

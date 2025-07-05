import React, { useState } from 'react';

interface CodeInputProps {
  onSubmit: (code: string) => void;
  submitted?: boolean;
}

export default function CodeInput({ onSubmit, submitted = false }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a code snippet.');
      return;
    }
    
    // Check for potential embedding issues
    if (code.length > 85000) {
      setError('⚠️ Content is very large and may fail to embed. Consider reducing the size or try without embedding.');
      return;
    }
    
    setError(null);
    onSubmit(code);
  };

  const handleClear = () => {
    setCode('');
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-[#18181b] border border-[#282828] rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#282828]">
          <label className="font-semibold text-[#b5e853] tracking-widest uppercase text-sm block mb-4">
            Code Snippet
          </label>
          
          <div className="border border-[#282828] rounded-lg font-mono text-sm bg-[#111] overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here...
Supports any programming language
Large code snippets are welcome!"
              className="w-full bg-[#111] text-[#b5e853] font-mono text-sm leading-relaxed resize-vertical outline-none border-none p-5 scrollbar-thin scrollbar-track-[#111] scrollbar-thumb-[#b5e853]/30 hover:scrollbar-thumb-[#b5e853]/50"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                minHeight: '200px',
                maxHeight: '400px',
              }}
              rows={12}
            />
          </div>
          
          {code.length > 0 && (
            <div className="mt-2 flex justify-between items-center text-xs">
              <span className="text-[#b5e853] opacity-60">
                {code.length} characters • {code.split('\n').length} lines
              </span>
              <div className="flex items-center gap-2">
                {code.length > 80000 && (
                  <span className="text-red-400 text-xs font-mono">
                    ⚠️ Near capacity limit
                  </span>
                )}
                {code.length > 85000 && (
                  <span className="text-red-400 text-xs font-mono font-bold">
                    ❌ Too large - may fail to embed
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[#b5e853]/60 hover:text-[#b5e853] text-xs underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm font-mono mt-3">{error}</p>
          )}
        </div>

        <div className="p-6 bg-[#1a1a1a]">
          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-4 bg-[#b5e853] text-[#18181b] rounded-lg font-bold font-mono tracking-widest uppercase hover:bg-[#d6ff7f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
          >
            {submitted ? 'Generate New Art' : 'Generate Pixel Art'}
          </button>
        </div>
      </form>
    </div>
  );
}

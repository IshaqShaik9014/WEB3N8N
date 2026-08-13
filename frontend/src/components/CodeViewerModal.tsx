import React from 'react';

export default function CodeViewerModal({ isOpen, onClose, code, overview, appId }: any) {
  if (!isOpen) return null;

  const isReact = code?.includes('export default function') || code?.includes('import React');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-5xl h-[85vh] rounded-xl border border-gray-700 flex flex-col shadow-2xl shadow-purple-900/20 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#252526] border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-200">{isReact ? 'React Frontend Integration' : 'TEALScript Contract'}</h2>
            {appId && (
              <span className="bg-green-900/50 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-xs font-mono">
                App ID: {appId}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const blob = new Blob([code], { type: 'text/typescript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = isReact ? 'App.tsx' : 'GeneratedApp.algo.ts';
                a.click();
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors shadow"
            >
              ⬇ Download .{isReact ? 'tsx' : 'ts'}
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(code)}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              Copy Code
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white ml-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Overview */}
          {overview && (
            <div className="w-1/3 border-r border-gray-700 p-6 bg-[#1e1e1e] overflow-y-auto custom-scrollbar">
              <h3 className="text-gray-300 font-bold mb-3 uppercase tracking-wider text-xs">Contract Overview</h3>
              <div className="text-gray-400 text-sm leading-relaxed prose prose-invert">
                {overview}
              </div>
            </div>
          )}

          {/* Right Panel: Editor Area */}
          <div className={`${overview ? 'w-2/3' : 'w-full'} bg-[#1e1e1e] flex flex-col`}>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border-b border-[#1e1e1e]">
              <div className="text-[#e2c08d] text-xs font-mono">{isReact ? 'App.tsx' : 'GeneratedApp.algo.ts'}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#1e1e1e]">
              <pre className="font-mono text-sm text-[#d4d4d4] leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

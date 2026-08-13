import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export default function IdeaNode({ data }: any) {
  const { onGenerate, isGenerating, error } = data;
  const [showError, setShowError] = useState(false);
  const [localIdea, setLocalIdea] = useState('');

  return (
    <div className="w-96 bg-gray-900 border border-purple-500 shadow-2xl shadow-purple-500/20 rounded-xl p-4 flex flex-col relative group">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center">
        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded mr-2">Start</span>
        Smart Contract Idea Box
      </h2>
      <p className="text-gray-400 text-xs mb-4 leading-tight">
        Describe your dApp idea in natural language.
      </p>
      
      <textarea
        className="w-full bg-black border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none mb-3 nodrag nopan"
        rows={4}
        placeholder="E.g., A decentralized voting app where users can increment a global state counter for 'yes' or 'no'."
        value={localIdea}
        onChange={(e) => setLocalIdea(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        disabled={isGenerating}
      />
      
      <button
        onClick={() => onGenerate(localIdea)}
        disabled={!localIdea || isGenerating}
        className={`w-full font-bold py-2 px-4 rounded transition-all shadow-lg nodrag ${
          !localIdea ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/50'
        }`}
      >
        {isGenerating ? '⏳ Processing Pipeline...' : '✨ Start Pipeline'}
      </button>

      {error && (
        <div className="mt-3 p-2 bg-red-900/50 border border-red-500 text-red-200 text-xs rounded flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-bold">Pipeline Error</span>
            <button onClick={() => setShowError(!showError)} className="underline text-red-300 hover:text-red-100 nodrag">
              {showError ? 'Hide' : 'View Details'}
            </button>
          </div>
          {showError && (
            <div className="mt-2 p-2 bg-black/50 rounded max-h-32 overflow-y-auto break-all text-[10px] custom-scrollbar nodrag">
              {error}
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} id="idea-out" className="w-3 h-3 bg-purple-500" />
    </div>
  );
}

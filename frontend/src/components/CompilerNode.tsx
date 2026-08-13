import React from 'react';
import { Handle, Position } from 'reactflow';

export default function CompilerNode({ data }: any) {
  const { status, abi } = data;
  
  // status: 'idle' | 'running' | 'completed' | 'error'

  return (
    <div className={`w-80 bg-gray-900 border ${status === 'running' ? 'border-orange-500 animate-pulse' : status === 'completed' ? 'border-green-500' : 'border-gray-700'} shadow-xl rounded-xl p-4 flex flex-col relative`}>
      <Handle type="target" position={Position.Left} id="compile-in" className="w-3 h-3 bg-orange-500" />
      
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center">
          <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded mr-2">Core</span>
          TEAL Compiler
        </h2>
        {status === 'running' && <span className="text-xs text-orange-400">Compiling...</span>}
        {status === 'completed' && <span className="text-xs text-green-400">Compiled</span>}
      </div>

      <div className="text-xs text-gray-300 bg-black/50 p-3 rounded mb-2 flex-grow h-32 overflow-y-auto font-mono">
        {status === 'idle' && <span className="text-gray-500 italic font-sans">Waiting for AI Code...</span>}
        {status === 'running' && <span className="text-orange-300 font-sans">Running TEALScript Compiler...</span>}
        
        {status === 'completed' && abi && (
          <div>
            <span className="text-orange-400 font-bold block mb-1 font-sans">Generated ABI (JSON):</span>
            <pre className="text-[10px] text-gray-400 whitespace-pre-wrap">{abi}</pre>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="compile-out" className="w-3 h-3 bg-orange-500" />
    </div>
  );
}

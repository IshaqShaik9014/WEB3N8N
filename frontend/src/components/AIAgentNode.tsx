import React from 'react';
import { Handle, Position } from 'reactflow';

export default function AIAgentNode({ data }: any) {
  const { status, code, explanation, securityReview, onViewCode } = data;
  
  // status: 'idle' | 'running' | 'completed' | 'error'

  return (
    <div className={`w-80 bg-gray-900 border ${status === 'running' ? 'border-blue-500 animate-pulse' : status === 'completed' ? 'border-green-500' : 'border-gray-700'} shadow-xl rounded-xl p-4 flex flex-col relative`}>
      <Handle type="target" position={Position.Left} id="ai-in" className="w-3 h-3 bg-blue-500" />
      
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-2">Agent</span>
          AI Developer
        </h2>
        {status === 'running' && <span className="text-xs text-blue-400">Working...</span>}
        {status === 'completed' && <span className="text-xs text-green-400">Done</span>}
      </div>

      <div className="text-xs text-gray-300 bg-black/50 p-3 rounded mb-3 flex-grow h-32 overflow-y-auto">
        {status === 'idle' && <span className="text-gray-500 italic">Waiting for input...</span>}
        {status === 'running' && <span className="text-blue-300">Analyzing idea and writing TEALScript...</span>}
        
        {status === 'completed' && (
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-blue-400 font-bold block mb-1">Logic Review:</span>
              <p className="text-gray-300">{explanation}</p>
            </div>
            <div>
              <span className="text-orange-400 font-bold block mb-1">Security Checks:</span>
              <p className="text-gray-300">{securityReview}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onViewCode}
        disabled={status !== 'completed'}
        className={`w-full text-xs font-bold py-1.5 px-3 rounded transition-colors shadow nodrag ${
          status !== 'completed' ? 'bg-gray-800 text-gray-600' : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        View Generated TEALScript
      </button>

      <Handle type="source" position={Position.Right} id="ai-out" className="w-3 h-3 bg-blue-500" />
    </div>
  );
}

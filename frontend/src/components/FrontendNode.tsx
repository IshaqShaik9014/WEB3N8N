import React from 'react';
import { Handle, Position } from 'reactflow';

export default function FrontendNode({ data }: any) {
  const { status, frontendCode, onViewCode } = data;
  
  // status: 'idle' | 'running' | 'completed' | 'error'

  return (
    <div className={`w-80 bg-gray-900 border ${status === 'running' ? 'border-pink-500 animate-pulse' : status === 'completed' ? 'border-green-500' : 'border-gray-700'} shadow-xl rounded-xl p-4 flex flex-col relative`}>
      <Handle type="target" position={Position.Left} id="frontend-in" className="w-3 h-3 bg-pink-500" />
      
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center">
          <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded mr-2">dApp</span>
          Frontend Integrator
        </h2>
        {status === 'running' && <span className="text-xs text-pink-400">Building...</span>}
        {status === 'completed' && <span className="text-xs text-green-400">Ready</span>}
      </div>

      <div className="text-xs text-gray-300 bg-black/50 p-3 rounded mb-3 flex-grow h-24 overflow-y-auto">
        {status === 'idle' && <span className="text-gray-500 italic">Waiting for deployment...</span>}
        {status === 'running' && <span className="text-pink-300">Writing React.js integration component...</span>}
        
        {status === 'completed' && (
          <div className="flex flex-col gap-2 h-full justify-center">
            <span className="text-pink-400 font-bold block mb-1">✅ 1-Click dApp Ready!</span>
            <p className="text-gray-400 text-[10px]">
              Your React.js frontend component has been generated and pre-configured with your ABI and live App ID.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onViewCode}
        disabled={status !== 'completed'}
        className={`w-full text-xs font-bold py-1.5 px-3 rounded transition-colors shadow nodrag ${
          status !== 'completed' ? 'bg-gray-800 text-gray-600' : 'bg-pink-600 hover:bg-pink-500 text-white'
        }`}
      >
        View React Code
      </button>
    </div>
  );
}

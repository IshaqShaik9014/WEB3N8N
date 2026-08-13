import React from 'react';
import { Handle, Position } from 'reactflow';

export default function DeployerNode({ data }: any) {
  const { status, appId } = data;
  
  // status: 'idle' | 'running' | 'completed' | 'error'

  return (
    <div className={`w-72 bg-gray-900 border ${status === 'running' ? 'border-yellow-500 animate-pulse' : status === 'completed' ? 'border-green-500' : 'border-gray-700'} shadow-xl rounded-xl p-4 flex flex-col relative`}>
      <Handle type="target" position={Position.Left} id="deploy-in" className="w-3 h-3 bg-yellow-500" />
      
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center">
          <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded mr-2">Network</span>
          Deployer Agent
        </h2>
        {status === 'running' && <span className="text-xs text-yellow-400">Deploying...</span>}
        {status === 'completed' && <span className="text-xs text-green-400">Live</span>}
      </div>

      <div className="text-xs text-gray-300 bg-black/50 p-3 rounded mb-2 flex-grow h-24 flex flex-col justify-center items-center">
        {status === 'idle' && <span className="text-gray-500 italic">Waiting for compiler...</span>}
        {status === 'running' && (
          <div className="text-center">
            <span className="text-yellow-300 block mb-1">Sending transaction to Algorand...</span>
            <span className="text-gray-500 text-[10px]">Awaiting block confirmation</span>
          </div>
        )}
        
        {status === 'completed' && appId && (
          <div className="text-center w-full">
            <span className="text-green-400 font-bold block mb-2">✅ Deployment Success</span>
            <div className="bg-black p-2 rounded border border-green-500/30">
              <span className="text-gray-400 text-[10px] uppercase block mb-1">Application ID</span>
              <span className="font-mono text-xl text-white">{appId}</span>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="deploy-out" className="w-3 h-3 bg-yellow-500" />
    </div>
  );
}

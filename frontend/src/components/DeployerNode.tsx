import React from 'react';
import { Handle, Position } from 'reactflow';
import { Lock } from 'lucide-react';

export default function DeployerNode({ data }: any) {
  const { status, appId, paymentStatus, onPay, customMessage } = data;
  
  return (
    <div className={`w-72 bg-gray-900 border ${status === 'running' ? 'border-yellow-500 animate-pulse' : status === 'completed' ? 'border-green-500' : 'border-gray-700'} shadow-xl rounded-xl p-4 flex flex-col relative`}>
      <Handle type="target" position={Position.Left} id="deploy-in" className="w-3 h-3 bg-yellow-500" />
      
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center">
          <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded mr-2">Network</span>
          Deployer Agent
        </h2>
        {status === 'running' && <span className="text-xs text-yellow-400">Processing...</span>}
        {status === 'completed' && <span className="text-xs text-green-400">Live</span>}
      </div>

      <div className="text-xs text-gray-300 bg-black/50 p-3 rounded mb-2 flex-grow min-h-[6rem] flex flex-col justify-center items-center">
        {status === 'idle' && paymentStatus === 'unlocked' && <span className="text-gray-500 italic">Waiting for compiler...</span>}
        
        {paymentStatus === 'locked' && status === 'idle' && (
          <div className="bg-black p-3 rounded border border-yellow-500/50 flex flex-col items-center w-full">
            <Lock className="w-5 h-5 text-yellow-500 mb-2" />
            <span className="text-gray-400 text-xs text-center mb-2">Ready to Deploy</span>
            <button 
              onClick={onPay}
              className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold py-1 px-3 rounded transition-colors w-full"
            >
              Sign & Deploy (x402)
            </button>
          </div>
        )}

        {paymentStatus === 'processing' && (
          <div className="bg-black p-3 rounded border border-yellow-500/50 flex flex-col items-center w-full">
            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-yellow-400 text-xs text-center">{customMessage || "Confirming Payment..."}</span>
          </div>
        )}

        {status === 'running' && paymentStatus === 'processing' && customMessage && (
           <span className="text-yellow-300 block text-center mt-2">{customMessage}</span>
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

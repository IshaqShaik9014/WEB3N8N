import React from 'react';
import { Handle, Position } from 'reactflow';
import { Cpu } from 'lucide-react';

const ModelNode = ({ data }: any) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg border border-green-500 w-48">
      <div className="p-4 flex items-center gap-3">
        <Cpu className="text-green-400" />
        <div>
          <div className="font-bold">Gemini Pro</div>
          <div className="text-xs text-gray-400">AI Model</div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} id="model-in" />
      <Handle type="source" position={Position.Right} id="model-out" style={{ background: '#22c55e' }} />
    </div>
  );
};

export default ModelNode;

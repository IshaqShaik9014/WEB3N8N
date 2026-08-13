import React from 'react';
import { Handle, Position } from 'reactflow';
import { Wrench } from 'lucide-react';

const ToolNode = ({ data }: any) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg border border-yellow-500 w-48 relative">
      {/* Tool Input from Agent */}
      <Handle type="target" position={Position.Left} id="tool-in" style={{ background: '#eab308' }} />
      
      {/* Badge for Paid Tools (x402) */}
      {data.price && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
          {data.price} ALGO
        </div>
      )}

      <div className="p-4 flex items-center gap-3">
        <Wrench className="text-yellow-400" />
        <div>
          <div className="font-bold">{data.label || 'Tool'}</div>
          <div className="text-xs text-gray-400">Agent Tool</div>
        </div>
      </div>
    </div>
  );
};

export default ToolNode;

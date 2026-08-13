import React from 'react';
import { Handle, Position } from 'reactflow';
import { Bot } from 'lucide-react';

const AgentNode = ({ data }: any) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg border border-purple-500 w-64">
      {/* Model Input */}
      <Handle type="target" position={Position.Left} id="model" style={{ top: 20, background: '#a855f7' }} />
      {/* Sequence Input */}
      <Handle type="target" position={Position.Top} id="seq-in" />
      
      <div className="p-4 flex items-center gap-3">
        <Bot className="text-purple-400" />
        <div>
          <div className="font-bold">Web3 Agent</div>
          <div className="text-xs text-gray-400">{data.label || 'Orchestrator'}</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <input 
          className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" 
          placeholder="System Prompt..." 
          defaultValue={data.prompt}
        />
      </div>

      {/* Tool Access Output */}
      <Handle type="source" position={Position.Right} id="tools" style={{ bottom: 20, top: 'auto', background: '#3b82f6' }} />
      {/* Sequence Output */}
      <Handle type="source" position={Position.Bottom} id="seq-out" />
    </div>
  );
};

export default AgentNode;

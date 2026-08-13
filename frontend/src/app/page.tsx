"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, addEdge, applyNodeChanges, applyEdgeChanges, Connection, Edge, NodeChange, EdgeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import IdeaNode from '@/components/IdeaNode';
import AIAgentNode from '@/components/AIAgentNode';
import CompilerNode from '@/components/CompilerNode';
import DeployerNode from '@/components/DeployerNode';
import FrontendNode from '@/components/FrontendNode';
import CodeViewerModal from '@/components/CodeViewerModal';
import axios from 'axios';
import algosdk from 'algosdk';
import { PeraWalletConnect } from "@perawallet/connect";

let peraWallet: PeraWalletConnect;
if (typeof window !== 'undefined') {
  peraWallet = new PeraWalletConnect();
}

const TREASURY_ADDRESS = 'FDSKCI2DHPIOTFR2CXHPESMLAUA4Y66B6KKGJ2CDKDY3UX34W43QVN52NA';
const nodeTypes = {
  ideaNode: IdeaNode,
  aiAgentNode: AIAgentNode,
  compilerNode: CompilerNode,
  deployerNode: DeployerNode,
  frontendNode: FrontendNode,
};

const defaultEdges: Edge[] = [
  { id: 'e1', source: 'idea-1', target: 'ai-1', sourceHandle: 'idea-out', targetHandle: 'ai-in', style: { stroke: '#4b5563', strokeWidth: 2 } },
  { id: 'e2', source: 'ai-1', target: 'compiler-1', sourceHandle: 'ai-out', targetHandle: 'compile-in', style: { stroke: '#4b5563', strokeWidth: 2 } },
  { id: 'e3', source: 'compiler-1', target: 'deployer-1', sourceHandle: 'compile-out', targetHandle: 'deploy-in', style: { stroke: '#4b5563', strokeWidth: 2 } },
  { id: 'e4', source: 'deployer-1', target: 'frontend-1', sourceHandle: 'deploy-out', targetHandle: 'frontend-in', style: { stroke: '#4b5563', strokeWidth: 2 } },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>(defaultEdges);
  
  // Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideaError, setIdeaError] = useState('');
  
  // Node Specific Data & Status
  const [aiStatus, setAiStatus] = useState<'idle'|'running'|'completed'>('idle');
  const [aiData, setAiData] = useState<any>({});
  
  const [compileStatus, setCompileStatus] = useState<'idle'|'running'|'completed'>('idle');
  const [compileData, setCompileData] = useState<any>({});
  
  const [deployStatus, setDeployStatus] = useState<'idle'|'running'|'completed'>('idle');
  const [deployData, setDeployData] = useState<any>({});
  
  const [frontendStatus, setFrontendStatus] = useState<'idle'|'running'|'completed'>('idle');
  const [frontendData, setFrontendData] = useState<any>({});
  
  // Modals
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerCode, setViewerCode] = useState('');

  const [appIdPaymentStatus, setAppIdPaymentStatus] = useState<'locked'|'processing'|'unlocked'>('unlocked');
  const [frontendPaymentStatus, setFrontendPaymentStatus] = useState<'locked'|'processing'|'unlocked'>('unlocked');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setWalletAddress(accounts[0]);
      }
      peraWallet.connector?.on("disconnect", () => setWalletAddress(null));
    }).catch(console.error);
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      const newAccounts = await peraWallet.connect();
      if (newAccounts.length > 0) {
        setWalletAddress(newAccounts[0]);
      }
    } catch (error) {
      console.error("Wallet connect error:", error);
    }
  };

  const handleDisconnect = () => {
    peraWallet.disconnect();
    setWalletAddress(null);
  };

  const handlePayAppId = async () => {
    if (!walletAddress) return;
    setAppIdPaymentStatus('processing');
    try {
      const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
      const params = await algod.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: walletAddress,
        receiver: TREASURY_ADDRESS,
        amount: 10000, // 0.01 ALGO
        suggestedParams: params
      });
      algosdk.assignGroupID([txn]);
      
      const txGroup = [{ txn: txn, signers: [walletAddress] }];
      const signedTxns = await peraWallet.signTransaction([txGroup]);
      const validSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);
      if (validSignedTxns.length === 0) throw new Error('Transaction was not signed');
      
      await algod.sendRawTransaction(validSignedTxns).do();
      await algosdk.waitForConfirmation(algod, txn.txID().toString(), 4);
      
      setAppIdPaymentStatus('unlocked');
      
      // Resume pipeline to Frontend Node
      setEdges(eds => eds.map(e => {
        if (e.id === 'e3') return { ...e, animated: false, style: { stroke: '#22c55e', strokeWidth: 2 } };
        if (e.id === 'e4') return { ...e, animated: true, style: { stroke: '#ec4899', strokeWidth: 3 } };
        return e;
      }));

      setFrontendStatus('running');
      await new Promise(r => setTimeout(r, 1500)); // Simulate time
      setFrontendStatus('completed');
      setFrontendPaymentStatus('locked'); // Lock the frontend code

      // Stop animating e4
      setEdges(eds => eds.map(e => {
        if (e.id === 'e4') return { ...e, animated: false, style: { stroke: '#22c55e', strokeWidth: 2 } };
        return e;
      }));

    } catch (error) {
      console.error(error);
      setAppIdPaymentStatus('locked');
      alert('Payment failed or cancelled.');
    }
  };

  const handlePayFrontend = async () => {
    if (!walletAddress) return;
    setFrontendPaymentStatus('processing');
    try {
      const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
      const params = await algod.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: walletAddress,
        receiver: TREASURY_ADDRESS,
        amount: 40000, // 0.04 ALGO
        suggestedParams: params
      });
      algosdk.assignGroupID([txn]);
      
      const txGroup = [{ txn: txn, signers: [walletAddress] }];
      const signedTxns = await peraWallet.signTransaction([txGroup]);
      const validSignedTxns = signedTxns.filter((t): t is Uint8Array => t !== null);
      if (validSignedTxns.length === 0) throw new Error('Transaction was not signed');
      
      await algod.sendRawTransaction(validSignedTxns).do();
      await algosdk.waitForConfirmation(algod, txn.txID().toString(), 4);
      
      setFrontendPaymentStatus('unlocked');
    } catch (error) {
      console.error(error);
      setFrontendPaymentStatus('locked');
      alert('Payment failed or cancelled.');
    }
  };

  const handleStartPipeline = async (ideaText: string) => {
    if (!ideaText) return;
    setIsGenerating(true);
    setIdeaError('');
    
    // Reset all statuses
    setAiStatus('running');
    setAiData({});
    setCompileStatus('idle');
    setCompileData({});
    setDeployStatus('idle');
    setDeployData({});
    setFrontendStatus('idle');
    setFrontendData({});
    setAppIdPaymentStatus('unlocked');
    setFrontendPaymentStatus('unlocked');

    // Animate edge 1
    setEdges(eds => eds.map(e => e.id === 'e1' ? { ...e, animated: true, style: { stroke: '#3b82f6', strokeWidth: 3 } } : e));

    try {
      const res = await axios.post('https://web3n8n.onrender.com/api/pipelines/generate-contract', { idea: ideaText });
      const data = res.data;

      // 1. AI Node Completes
      setAiStatus('completed');
      setAiData({ code: data.code, explanation: data.explanation, securityReview: data.securityReview });
      
      // Stop animating e1, start e2
      setEdges(eds => eds.map(e => {
        if (e.id === 'e1') return { ...e, animated: false, style: { stroke: '#22c55e', strokeWidth: 2 } };
        if (e.id === 'e2') return { ...e, animated: true, style: { stroke: '#f97316', strokeWidth: 3 } };
        return e;
      }));

      // 2. Compiler Node runs
      setCompileStatus('running');
      await new Promise(r => setTimeout(r, 1500)); // Simulate time
      setCompileStatus('completed');
      setCompileData({ abi: data.abi });

      // Stop animating e2, start e3
      setEdges(eds => eds.map(e => {
        if (e.id === 'e2') return { ...e, animated: false, style: { stroke: '#22c55e', strokeWidth: 2 } };
        if (e.id === 'e3') return { ...e, animated: true, style: { stroke: '#eab308', strokeWidth: 3 } };
        return e;
      }));

      // 3. Deployer Node runs
      setDeployStatus('running');
      await new Promise(r => setTimeout(r, 2000)); // Simulate time
      setDeployStatus('completed');
      setDeployData({ appId: data.appId });
      
      // Halt the pipeline here, lock the app id!
      setAppIdPaymentStatus('locked');
      setFrontendData({ frontendCode: data.frontendCode }); // Store it but don't show it yet

    } catch (err: any) {
      setIdeaError(err.response?.data?.error || 'Failed to generate contract.');
      setAiStatus('idle');
      setEdges(defaultEdges);
    }
    
    setIsGenerating(false);
  };

  // Initialize nodes
  useEffect(() => {
    setNodes([
      { id: 'idea-1', type: 'ideaNode', position: { x: 50, y: 150 }, data: { onGenerate: handleStartPipeline, isGenerating, error: ideaError } },
      { id: 'ai-1', type: 'aiAgentNode', position: { x: 450, y: 100 }, data: { status: aiStatus, ...aiData, onViewCode: () => { setViewerCode(aiData.code); setViewerOpen(true); } } },
      { id: 'compiler-1', type: 'compilerNode', position: { x: 800, y: 100 }, data: { status: compileStatus, ...compileData } },
      { id: 'deployer-1', type: 'deployerNode', position: { x: 1150, y: 120 }, data: { status: deployStatus, ...deployData, paymentStatus: appIdPaymentStatus, onPay: handlePayAppId } },
      { id: 'frontend-1', type: 'frontendNode', position: { x: 1500, y: 120 }, data: { status: frontendStatus, ...frontendData, paymentStatus: frontendPaymentStatus, onPay: handlePayFrontend, onViewCode: () => { setViewerCode(frontendData.frontendCode); setViewerOpen(true); } } },
    ]);
  }, [isGenerating, ideaError, aiStatus, aiData, compileStatus, compileData, deployStatus, deployData, frontendStatus, frontendData, appIdPaymentStatus, frontendPaymentStatus]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds: any) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds: any) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds: any) => addEdge(params, eds)), []);

  if (!mounted) return null;
  if (!walletAddress) {
    return (
      <div className="flex h-screen w-full bg-gray-950 text-white flex-col items-center justify-center">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
          Web3N8N
        </h1>
        <p className="text-gray-400 mb-10 text-lg">Connect your Algorand Wallet to enter the studio.</p>
        
        <div className="flex flex-col gap-4 w-64">
            <button 
              onClick={handleConnect}
              className="bg-green-600 hover:bg-green-500 border border-green-500 transition-all text-white font-bold py-3 px-4 rounded shadow-lg flex items-center justify-center"
            >
              Connect Pera Wallet
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-white font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6 z-10 shrink-0">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
          Web3N8N <span className="text-gray-500 text-sm font-normal ml-2">Studio</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-400 font-mono">
              {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
            </span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-950"
        >
          <Background color="#333" gap={16} />
          <Controls className="bg-gray-800 text-white fill-white border-gray-700" />
        </ReactFlow>
      </div>
      
      {viewerOpen && (
        <CodeViewerModal 
          isOpen={viewerOpen} 
          onClose={() => setViewerOpen(false)}
          code={viewerCode}
        />
      )}
    </div>
  );
}

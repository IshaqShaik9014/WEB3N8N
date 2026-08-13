"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PeraWalletConnect } from "@perawallet/connect";
import Link from 'next/link';

let peraWallet: PeraWalletConnect;
if (typeof window !== 'undefined') {
  peraWallet = new PeraWalletConnect();
}

export default function HistoryDashboard() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setWalletAddress(accounts[0]);
      }
      peraWallet.connector?.on("disconnect", () => setWalletAddress(null));
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      axios.get(`https://web3n8n.onrender.com/api/pipelines/history/${walletAddress}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error("Failed to fetch history:", err));
    }
  }, [walletAddress]);

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

  if (loading) {
    return <div className="flex h-screen w-full bg-gray-950 items-center justify-center text-white">Loading...</div>;
  }

  if (!walletAddress) {
    return (
      <div className="flex h-screen w-full bg-gray-950 text-white flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-300">Contract History</h1>
        <p className="text-gray-500 mb-8">Connect your wallet to view your generated contracts.</p>
        <button 
          onClick={handleConnect}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded shadow-lg"
        >
          Connect Pera Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Your Contract History
            </h1>
            <p className="text-gray-500 text-sm mt-1">Wallet: {walletAddress}</p>
          </div>
          <Link href="/" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
            &larr; Back to Studio
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-lg border border-gray-800">
            You haven't generated any contracts yet. Go to the Studio to start!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((contract) => (
              <div key={contract._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded font-mono border border-blue-500/20">
                    #{contract.contractNumber}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-200 mb-2 line-clamp-2" title={contract.idea}>
                  {contract.idea}
                </h3>

                <div className="mt-4 space-y-2 mb-6 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">App ID:</span>
                    <span className={contract.appId ? "text-green-400 font-mono" : "text-yellow-500 italic"}>
                      {contract.appId ? contract.appId : "Not Deployed"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deploy Cost:</span>
                    <span className="text-gray-300">{contract.deployCost / 1000000} ALGO</span>
                  </div>
                </div>

                <Link 
                  href={`/?idea=${encodeURIComponent(contract.idea)}`}
                  className="w-full text-center bg-gray-800 hover:bg-gray-700 text-white py-2 rounded font-medium border border-gray-700 transition-colors"
                >
                  Edit in Studio &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

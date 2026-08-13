"use client";

import React from 'react';
import { WalletProvider } from '@txnlab/use-wallet-react';
import { WalletManager, NetworkId, WalletId } from '@txnlab/use-wallet';

const walletManager = new WalletManager({
  wallets: [
    { id: WalletId.PERA },
    { id: WalletId.DEFLY }
  ],
  network: NetworkId.TESTNET
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}

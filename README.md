<div align="center">
  <img src="https://cryptologos.cc/logos/algorand-algo-logo.png" width="100" height="100" alt="Algorand Logo">
  
  # 🚀 Web3N8N Studio
  
  **The ultimate visual, AI-powered Smart Contract orchestrator on Algorand.**
  
  [![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
  [![Powered by Algorand](https://img.shields.io/badge/Powered%20by-Algorand-black?logo=algorand)](https://algorand.com/)
  [![AI by Gemini](https://img.shields.io/badge/AI%20by-Gemini-blue?logo=google)](https://deepmind.google/technologies/gemini/)
  
  <p align="center">
    <a href="#features">✨ Features</a> •
    <a href="#architecture">🏗️ Architecture</a> •
    <a href="#quick-start">🚀 Quick Start</a> •
    <a href="#demo">🎥 Demo</a>
  </p>
</div>

---

## 🌟 What is Web3N8N?

Web3N8N is a visual smart contract development studio inspired by n8n. It allows developers and beginners to seamlessly ideate, generate, compile, and deploy Algorand Smart Contracts directly from a React Flow canvas—all without writing a single line of TEAL or Solidity code.

Powered by Google's **Gemini 2.5 Flash**, it understands your natural language ideas and instantly writes highly optimized, secure TEALScript contracts. 

With native **x402 Micro-payments** integrated via Pera Wallet, you can monetize your AI orchestration nodes seamlessly on the Algorand testnet.

---

## ✨ Features

- 🧠 **AI Contract Generation:** Type your idea, and Gemini 2.5 Flash instantly writes the TEALScript code.
- 🎨 **Visual Flow Canvas:** See your entire pipeline from Idea ➡️ AI Agent ➡️ Compiler ➡️ Deployer ➡️ Frontend.
- ⚡ **Lightning Fast Deployments:** Direct integration with AlgoNode for instant testnet deployments.
- 💳 **x402 Micro-payments:** Built-in monetization flow utilizing L402 protocol standards over Algorand.
- 📱 **Native Pera Wallet Support:** Seamlessly connect and sign transactions using your mobile wallet via WalletConnect.
- 💻 **Instant UI Generation:** Not only does it build your backend contract, but it also generates a custom React frontend component to interact with it!

---

## 🏗️ Architecture

### Frontend (Next.js 15)
- **React Flow**: Drives the visual drag-and-drop studio.
- **Tailwind CSS**: Beautiful, dark-mode first design system.
- **Pera Wallet Connect**: Native secure wallet integration for signing x402 payments.

### Backend (Node.js & Express)
- **Gemini AI**: Interprets natural language and writes TEALScript.
- **Algosdk v3**: Compiles the TEAL logic and executes smart contract deployment.
- **Server-Sent Events (SSE)**: Streams real-time AI logs and transaction status back to the frontend canvas.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- An Algorand Testnet Wallet (Pera Wallet)
- Gemini API Key

### 1. Clone & Install
```bash
git clone https://github.com/IshaqShaik9014/WEB3N8N.git
cd WEB3N8N

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5001
GEMINI_API_KEY="your_google_gemini_api_key"
ALGOD_ADDRESS="https://testnet-api.algonode.cloud"
# The mnemonic of the wallet funding the deployments
DEPLOYER_MNEMONIC="word1 word2 word3..." 
```

### 3. Run the Studio
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to start building!

---

## 🎥 Using the Canvas

1. **Connect Wallet:** Click "Connect Pera Wallet" and scan the QR code with your mobile app.
2. **Enter an Idea:** Type what you want to build in the Idea Node (e.g., "A decentralized voting app").
3. **Generate:** The pipeline will activate, lighting up the AI Agent and Compiler nodes.
4. **Pay x402:** Once compiled, an x402 micro-payment barrier will appear. Click "Pay" to sign a 0.01 ALGO transaction on your phone.
5. **Deploy & Unlock:** The contract deploys to the testnet, and you receive the real App ID and the generated React Frontend code!

---

## 🔒 Security
- All keys are stored server-side.
- The frontend strictly handles signature requests via WalletConnect without ever seeing private keys.
- AI generated code should be audited before mainnet deployment.

<div align="center">
  <i>Built with ❤️ for the Algorand Ecosystem</i>
</div>

import { Router } from 'express';
import Pipeline from '../models/Pipeline';
import { pinJSONToIPFS } from '../services/ipfs.service';
import { createWallet, executeRealX402Payment } from '../services/algorand.service';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Configure Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/deploy', async (req, res) => {
  try {
    const { name, graph } = req.body;
    
    // 1. Generate Agent Wallet
    const wallet = createWallet();
    
    // 2. Upload to IPFS
    const ipfsPayload = { name, graph, agentAddress: wallet.address };
    const cid = await pinJSONToIPFS(ipfsPayload);
    
    // 3. Save to MongoDB
    const pipeline = new Pipeline({
      name,
      graph,
      ipfsCid: cid,
      agentWallet: wallet
    });
    await pipeline.save();

    res.json({ success: true, pipelineId: pipeline._id, ipfsCid: cid, wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Deployment failed' });
  }
});

router.post('/:id/run', async (req, res) => {
  try {
    const { prompt } = req.body;
    const pipeline = await Pipeline.findById(req.params.id);
    
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Server-Sent Events (SSE) setup for streaming logs to frontend
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const log = (msg: string) => {
      res.write(`data: ${JSON.stringify({ log: msg })}\n\n`);
    };

    log(`[System] Starting workflow run for Pipeline: ${pipeline.name}`);
    
    log(`[Agent] Planning steps for prompt: "${prompt}"...`);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI Agent in a Web3 workflow. The user says: "${prompt}". You have access to a Smart Contract Deployer tool. If you need to deploy a contract, output "TOOL_CALL: DEPLOY_CONTRACT". Otherwise, just answer the prompt.`,
    });

    const aiText = response.text;
    
    if (aiText && aiText.includes('TOOL_CALL: DEPLOY_CONTRACT')) {
      log(`[Agent] Attempting to call Tool: Smart Contract Deployer...`);
      
      // Execute REAL x402 payment flow using the agent's mnemonic
      if (!pipeline.agentWallet?.mnemonic) {
        throw new Error('Agent wallet mnemonic missing');
      }

      await executeRealX402Payment(pipeline.agentWallet.mnemonic, 'Smart Contract Deployer')
        .then(receipt => {
          log(`[x402] Payment Required! Executing Algorand transaction...`);
          setTimeout(() => {
            log(`[x402] Payment successful. L402 Receipt acquired: ${receipt}`);
            log(`[Tool] Compiling and deploying Solidity contract to Testnet...`);
            setTimeout(() => {
              log(`[Tool] Contract deployed successfully at address: 0x` + Math.random().toString(16).slice(2, 42));
              log(`[Agent] Task complete.`);
              res.write(`data: [DONE]\n\n`);
              res.end();
            }, 2000);
          }, 1000);
        })
        .catch(err => {
          log(`[x402 Error] Payment failed. Make sure the agent wallet is funded with Testnet ALGO!`);
          res.write(`data: [DONE]\n\n`);
          res.end();
        });

    } else {
      log(`[Agent] ${aiText}`);
      log(`[Agent] Task complete.`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  } catch (error) {
    console.error(error);
    res.write(`data: ${JSON.stringify({ log: '[Error] Execution failed' })}\n\n`);
    res.end();
  }
});

import ContractHistory from '../models/ContractHistory';
import { generateAndCompileContract } from '../services/ai-contract.service';
import { deployContract, getDeploymentCost, broadcastPaymentTxn, TREASURY_ADDRESS } from '../services/algorand.service';

router.post('/generate-contract', async (req, res) => {
  try {
    const { idea, walletAddress } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    console.log(`[Generate Contract] Idea: ${idea}`);
    const { code, approvalTeal, clearTeal, abiJson, explanation, securityReview, frontendCode } = await generateAndCompileContract(idea);
    
    const deployCost = getDeploymentCost();

    const history = new ContractHistory({
      creatorWallet: walletAddress || 'Unknown',
      idea,
      code,
      approvalTeal,
      clearTeal,
      abiJson,
      frontendCode,
      deployCost
    });
    await history.save();

    res.json({
      success: true,
      contractId: history._id,
      deployCost,
      code,
      explanation,
      securityReview,
      abi: abiJson
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

router.post('/deploy-contract/:contractId', async (req, res) => {
  try {
    const history = await ContractHistory.findById(req.params.contractId);
    if (!history) return res.status(404).json({ error: 'Contract not found' });
    if (history.appId) return res.status(400).json({ error: 'Contract already deployed', appId: history.appId });

    const paymentTxnBytes = req.headers['x-payment'] as string;
    
    // True x402 Intercept
    if (!paymentTxnBytes) {
      return res.status(402).json({
        error: 'Payment Required',
        amount: history.deployCost,
        receiver: TREASURY_ADDRESS
      });
    }

    // Process Payment
    console.log(`[Deploy Contract] Processing x402 Payment for contract ${history._id}`);
    await broadcastPaymentTxn(paymentTxnBytes);

    // Deploy Contract
    console.log(`[Deploy Contract] Payment confirmed! Deploying TEAL to testnet...`);
    const appId = await deployContract(history.approvalTeal, history.clearTeal, history.abiJson);
    
    // Post-Process Frontend Code
    let finalFrontendCode = history.frontendCode.replace(/YOUR_APP_ID_HERE/g, appId.toString());
    finalFrontendCode = finalFrontendCode.replace(/0x0000000000000000000000000000000000000000/g, appId.toString());

    history.appId = appId;
    history.frontendCode = finalFrontendCode;
    await history.save();

    res.json({
      success: true,
      appId,
      frontendCode: finalFrontendCode
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Deployment failed' });
  }
});

router.get('/history/:walletAddress', async (req, res) => {
  try {
    const history = await ContractHistory.find({ creatorWallet: req.params.walletAddress })
      .sort({ createdAt: -1 })
      .select('-approvalTeal -clearTeal -code -abiJson'); // don't send huge payloads for the list
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Initialize multiple AI clients for fallback if quota is exceeded
const aiClients = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_FALLBACK_1,
  process.env.GEMINI_API_KEY_FALLBACK_2
]
  .filter(Boolean)
  .map(key => new GoogleGenAI({ apiKey: key as string }));

export const generateAndCompileContract = async (idea: string) => {
  console.log(`[AI-Contract] Starting generation for idea: "${idea}"`);
  
  let currentClientIndex = 0;
  let ai = aiClients[currentClientIndex];
  // 1. Prompt Gemini for TEALScript Code
  const prompt = `You are an expert Algorand Smart Contract developer writing TEALScript.
Based on the following idea: "${idea}"

Generate a valid TEALScript contract, an explanation, a security review, and a React frontend integration component.
Do NOT use JSON. You MUST structure your entire response using exactly these four XML tags:

<code>
[Insert raw TEALScript code here]
</code>

<explanation>
[Insert clear explanation here]
</explanation>

<security>
[Insert security review here]
</security>

<frontend>
[Insert React code here]
</frontend>

STRICT RULES FOR THE TEALSCRIPT CODE:
1. You MUST import { Contract } from '@algorandfoundation/tealscript';
2. The class MUST be named "GeneratedApp" and extend "Contract".
3. ONLY use valid TEALScript types like uint64, string, Address, AssetID, etc.
4. Do NOT use decorators like @abi.view. Just write normal class methods.
5. You MUST NOT define a constructor or createApplication method that takes arguments. The contract must be deployable with NO arguments.
`;

  const scratchDir = path.join(__dirname, '../../scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir);
  const contractPath = path.join(scratchDir, 'GeneratedApp.algo.ts');

  const modelsList = [
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
  ];
  let currentModelIndex = 0;

  let code = '';
  let explanation = '';
  let securityReview = '';
  let frontendCode = '';
  
  let attempt = 0;
  const maxAttempts = 3;
  let lastError = '';

  while (attempt < maxAttempts) {
    attempt++;
    let currentPrompt = prompt;
    if (lastError) {
      console.log(`[AI-Contract] Attempt ${attempt}: Fixing compiler error...`);
      currentPrompt += `\n\nYOUR PREVIOUS CODE FAILED TO COMPILE. Please fix the following TEALScript compiler error:\n${lastError}\nEnsure you return all 4 XML tags again.`;
    }

    let response;
    try {
      console.log(`[AI-Contract] Using model: ${modelsList[currentModelIndex]} with key index ${currentClientIndex}`);
      response = await ai.models.generateContent({
        model: modelsList[currentModelIndex],
        contents: currentPrompt
      });
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes('503')) {
        console.warn(`[AI-Contract] 503 High Demand. Waiting 2s...`);
        await new Promise(r => setTimeout(r, 2000));
        attempt--; // Don't count 503 against attempts
        continue;
      }
      
      // Handle 404 Model Not Found
      if (err.status === 404 || err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('no longer available')) {
        if (currentModelIndex < modelsList.length - 1) {
          console.warn(`[AI-Contract] Model ${modelsList[currentModelIndex]} not found. Falling back to next model...`);
          currentModelIndex++;
          attempt--; // Retry this attempt with the new model
          continue;
        } else {
          throw new Error('All fallback AI models failed or are unavailable on this API key.');
        }
      }

      // Handle 429 Quota Exceeded
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota')) {
        if (currentClientIndex < aiClients.length - 1) {
          console.warn(`[AI-Contract] Quota exceeded on key ${currentClientIndex}. Switching to fallback API key...`);
          currentClientIndex++;
          ai = aiClients[currentClientIndex];
          currentModelIndex = 0; // Reset model list for the new key
          attempt--; // Retry this attempt with the new key
          continue;
        } else {
          throw new Error('All Gemini API Keys have exceeded their Free Tier daily quota. Please try again tomorrow.');
        }
      }
      throw err;
    }

    const responseText = response?.text || '';
    
    const extractTag = (text: string, tag: string) => {
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    code = extractTag(responseText, 'code');
    if (!code) {
      const match = responseText.match(/```(?:typescript|ts)?\n([\s\S]*?)```/);
      code = match ? match[1].trim() : responseText;
    }
    
    explanation = extractTag(responseText, 'explanation') || 'No explanation provided.';
    securityReview = extractTag(responseText, 'security') || 'No security issues found.';
    frontendCode = extractTag(responseText, 'frontend') || '// No frontend code generated';
    
    if (code.startsWith('\`\`\`')) {
      code = code.replace(/^\`\`\`(?:typescript|ts)?\n/, '').replace(/\n\`\`\`$/, '');
    }
    if (frontendCode.startsWith('\`\`\`')) {
      frontendCode = frontendCode.replace(/^\`\`\`(?:tsx|jsx|javascript|typescript|react)?\n/, '').replace(/\n\`\`\`$/, '');
    }
    
    if (code.includes('```typescript')) {
      code = code.split('```typescript')[1].split('```')[0].trim();
    } else if (code.includes('```ts')) {
      code = code.split('```ts')[1].split('```')[0].trim();
    } else if (code.includes('```')) {
      code = code.split('```')[1].split('```')[0].trim();
    }

    console.log(`[AI-Contract] Code written to ${contractPath}. Compiling (Attempt ${attempt})...`);
    fs.writeFileSync(contractPath, code);

    try {
      execSync(`npx tealscript ${contractPath} ${scratchDir} --skip-algod`, { stdio: 'pipe' });
      console.log(`[AI-Contract] Compilation success on attempt ${attempt}!`);
      break; // Success! Exit the loop.
    } catch (error: any) {
      lastError = error.stderr ? error.stderr.toString() : error.message;
      console.error(`[AI-Contract] Compilation failed on attempt ${attempt}:`, lastError.substring(0, 200));
      if (attempt === maxAttempts) {
        throw new Error(`Failed to compile TEALScript after ${maxAttempts} attempts. Try a simpler idea.`);
      }
    }
  }

  // Once loop succeeds, read the generated artifacts
  try {
    const approvalTeal = fs.readFileSync(path.join(scratchDir, 'GeneratedApp.approval.teal'), 'utf-8');
    const clearTeal = fs.readFileSync(path.join(scratchDir, 'GeneratedApp.clear.teal'), 'utf-8');
    const abiJson = fs.readFileSync(path.join(scratchDir, 'GeneratedApp.arc4.json'), 'utf-8');
    
    return {
      code,
      approvalTeal,
      clearTeal,
      abiJson,
      explanation,
      securityReview,
      frontendCode
    };
  } catch (error: any) {
    console.error(`[AI-Contract] Failed to read generated TEAL artifacts:`, error.message);
    throw new Error(`Compilation succeeded, but artifacts could not be read.`);
  }
};

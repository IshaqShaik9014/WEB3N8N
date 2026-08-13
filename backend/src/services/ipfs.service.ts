import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;

export const pinJSONToIPFS = async (jsonData: any): Promise<string> => {
  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: `web3n8n-workflow-${Date.now()}.json`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`
        }
      }
    );
    return res.data.IpfsHash; // This is the CID
  } catch (error) {
    console.error('Error pinning to IPFS via Pinata:', error);
    throw error;
  }
};

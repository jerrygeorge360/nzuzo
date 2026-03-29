import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.FAUCET_PORT || 3001;

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const TOKEN_ADDRESS = "0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD";
const DROP_AMOUNT = 10000n * 1000000n; // 10,000 mUSDC (6 decimals)

if (!PRIVATE_KEY || !RPC_URL) {
    console.error('Missing configuration: PRIVATE_KEY or SEPOLIA_RPC_URL');
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const TOKEN_ABI = ["function mint(address to, uint64 amount) external"];
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

app.use(cors());
app.use(express.json());

app.post('/request', async (req, res) => {
    const { address } = req.body;

    if (!address || !ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid address provided.' });
    }

    try {
        console.log(`[Faucet] Processing request for ${address}...`);
        
        // Use a gas limit to avoid issues with estimation or FHE complexities
        const tx = await tokenContract.mint(address, DROP_AMOUNT, {
            gasLimit: 1_000_000
        });

        console.log(`[Faucet] Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`[Faucet] Transaction confirmed: ${tx.hash}`);

        res.json({
            success: true,
            message: 'Tokens minted successfully.',
            txHash: tx.hash
        });
    } catch (error: any) {
        console.error('[Faucet] Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to process faucet request.'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', address: wallet.address });
});

app.listen(port, () => {
    console.log(`Nzuzo Faucet Service started on port ${port}`);
    console.log(`Contract: ${TOKEN_ADDRESS}`);
    console.log(`Funder:   ${wallet.address}`);
});

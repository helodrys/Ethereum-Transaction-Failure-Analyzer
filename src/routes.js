import express from 'express'; 
import { analyzetransaction }from './analyzer.js';

const router = express.Router();

//End point

router.get('/analyze/:txHash', async (req, res) => {
    const { txHash } = req.params;

    // Validate hash
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
        return res.status(400).json({ 
            error: 'Invalid transaction hash format' 
        });
    }
    try {
        const result = await analyzetransaction(txHash);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            error: "Analysis failed",
            details: error.message
        });
    }
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

export default router;
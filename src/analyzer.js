import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";    

const URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
const provider = new ethers.JsonRpcProvider(URL);

export async function analyzetransaction(txHash) {
    const tx = await provider.getTransaction(txHash);
    const txReceipt = await provider.getTransactionReceipt(txHash);
    // console.log(tx);
    // console.log("-----------------------------\n");
    if (!tx || !txReceipt) {
        throw new Error("Transaction not found");
    }
    const gasdata = await getGasCostUSD(txReceipt, tx);
    console.log("===========ANALYZING TRANSACTION===========");
    if (txReceipt.status === 1) {
        const answer = {
            status: "success",
            transactionHash: tx.hash,
            blockNumber: txReceipt.blockNumber,
            gasUsed: txReceipt.gasUsed.toString(),
            to: tx.to,
            from: tx.from,
            gasCostEth: gasdata.eth,
            gasCostUSD: gasdata.usd + " $"
        }
        return answer;
    }else if (txReceipt.status === 0) {
        console.log("Transaction failed");
        console.log(`Gas Used: ${txReceipt.gasUsed.toString()}`);
        const result = await analyzeFailure(tx, txReceipt);
        return result;
    }

}
async function analyzeFailure(tx, receipt) {
    const gasdata = await getGasCostUSD(receipt, tx);
    let revertReason = 'Unknown';
    let errorType = 'Unknown';
    console.log("===========ANALYZING FAILED TRANSACTION===========");

    try {
        await provider.call({
            to: tx.to,
            from: tx.from,
            data: tx.data,
            value: tx.value,
        }, receipt.blockNumber);
    } catch (error){
       if (error.reason) {
        return  {
            status: "failed",
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            revertReason: error.reason || "Unknown",
            from: tx.from,
            to: tx.to,
            gasUsed: receipt.gasUsed.toString(),
            gasCostEth: gasdata.eth,
            gasCostUSD: gasdata.usd + " $"            
        }
       }
    }
}
let cachedprice = null
let lastfetch = 0

async function getGasCostUSD(receipt, tx) {

    if (!cachedprice || (Date.now() - lastfetch > 60000)) {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
        const data = await response.json();
        const ethPrice = data.ethereum.usd;
        cachedprice = ethPrice;
        lastfetch = Date.now();
    }
    const gasCost = receipt.gasUsed * receipt.gasPrice; 
    const gasCostETH = ethers.formatEther(gasCost)
    const gasCostUSD = parseFloat(gasCostETH) * cachedprice;

        return {
            eth: gasCostETH,
            usd: gasCostUSD.toFixed(2)
        };
}

export default analyzetransaction;

// 0x9f541b1f5ccd22c9260321f66b2e3a3a485237eb19e12f7e1c48147e77c8315c -> failed hashed



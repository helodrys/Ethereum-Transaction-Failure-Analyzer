import express from 'express';
import dotenv from 'dotenv';
import router from './routes.js'

dotenv.config()

const app = express()
const server_port = process.env.PORT || 3000;

app.use(express.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

app.use('/api', router)

app.get("/", (req,res) => {
    res.json({
        service: "Transaction analyzer API",
        endpoints: {
            analyze: "GET /api/analyze/:txHash",
            health: "GET /api/health"
        } 
    })
})

app.listen(server_port,() => {
    console.log(`API is running on PORT: ${server_port}`)
})
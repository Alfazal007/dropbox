import express from "express"
import { metadaRouter } from "./routes/metadata.router"
import { redisClient } from "./constants/redis"

const app = express()

app.use(express.json())
app.use("/api/v1/metadata", metadaRouter)

async function startApp() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    app.listen(8001, () => {
        console.log("Metadata server listening on port 8001")
    })
}

startApp()

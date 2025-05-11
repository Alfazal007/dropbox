import express from "express"
import { configDotenv } from "dotenv"
import { cloudDataRouter } from "./routes/cloudData.router"

configDotenv()

const app = express()
app.use(express.json({
    limit: "10mb"
}))

app.use("/api/v1/data", cloudDataRouter)

app.listen(8002, () => {
    console.log("App listening on port 8002")
})


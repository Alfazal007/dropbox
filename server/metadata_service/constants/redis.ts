import { createClient } from "redis"

const redisClient = createClient({
    url: process.env.REDIS_URL as string
})

redisClient.on("error", (err) => {
    console.log("REDIS CONNECTION ISSUE, TERMINATING THE APPLICATION")
    console.log(err)
    process.exit(1)
})

export {
    redisClient
}

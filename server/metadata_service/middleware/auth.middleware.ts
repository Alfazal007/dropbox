import type { NextFunction, Request, Response } from "express";
import { redisClient } from "../constants/redis";
import { tryCatch } from "../helpers/tryCatch";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { username, token, machineCount } = req.params;
    if (!username || !token || !machineCount) {
        res.status(401).json({
            message: "Recheck username and token and try again"
        })
        return
    }
    let machineCountInt = parseInt(machineCount)
    if (!machineCountInt) {
        res.status(400).json({
            message: "Invalid machine count"
        })
        return
    }
    if (!redisClient.isOpen) {
        await redisClient.connect()
    }
    const redisData = await tryCatch(redisClient.get(`${machineCount}${username}`))
    if (redisData.error) {
        res.status(500).json({
            message: "Issue talking to redis"
        })
        return
    }
    if (!redisData.data) {
        res.status(400).json({
            message: "Login again"
        })
        return
    }

    let slashIndex = redisData.data.indexOf("/")
    let user_id = redisData.data.substring(0, slashIndex)
    let token_redis = redisData.data.substring(slashIndex + 1, redisData.data.length)
    if (!redisData || (token_redis !== token)) {
        res.status(401).json({
            message: "Login and try again"
        })
        return
    }
    req.token = redisData.data
    req.username = username
    req.user_id = parseInt(user_id)
    req.machine_count = machineCountInt
    next()
}

export {
    authMiddleware
}

import type { NextFunction, Request, Response } from "express";
import { redisClient } from "../constants/redis";

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
    const redisData = await redisClient.get(`${machineCount}${username}`)
    if (!redisData || (redisData !== token)) {
        res.status(401).json({
            message: "Login and try again"
        })
        return
    }
    req.token = redisData
    req.username = username
    req.machine_count = machineCountInt
    next()
}

export {
    authMiddleware
}

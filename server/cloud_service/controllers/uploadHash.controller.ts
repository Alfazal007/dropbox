import type { Request, Response } from "express";

async function uploadHash(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    console.log(req.body)
    res.status(200).json({
        message: "working"
    })
}

export {
    uploadHash
}

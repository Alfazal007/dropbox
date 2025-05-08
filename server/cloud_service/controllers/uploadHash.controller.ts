import type { Request, Response } from "express";

async function uploadHash(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    // TODO:: write the client first
}

export {
    uploadHash
}

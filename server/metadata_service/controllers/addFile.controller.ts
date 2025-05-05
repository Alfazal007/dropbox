import type { Request, Response } from "express"

async function addFileHandler(req: Request, res: Response) {
    res.status(200).json({
        message: "hello"
    })
    return
}

export {
    addFileHandler
}

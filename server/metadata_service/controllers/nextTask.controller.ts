import type { Request, Response } from "express"

async function whatToUploadNext(req: Request, res: Response) {
    const { user_id, username, token } = req
    res.status(200).json({
        message: "hello"
    })
}

export {
    whatToUploadNext
}

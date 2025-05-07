import type { Request, Response } from "express"
import { startUploadFileType } from "../types/zodTypes/uploadNextType"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../constants/prisma"

async function updateStatusWebhook(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    const parsedData = startUploadFileType.safeParse(req.body)
    if (!parsedData.success) {
        const errors: string[] = []
        parsedData.error.errors.map((err) => {
            errors.push(err.message)
        })
        res.status(400).json(errors)
        return
    }
    if (parsedData.data.apiKey !== process.env.APIKEY) {
        res.status(401).json({
            message: "Invalid api key"
        })
        return
    }
    const updateDbStatusResult = await tryCatch(prisma.metadata.update({
        where: {
            id: parsedData.data.fileId
        },
        data: {
            uploaded: true
        }
    }))
    if (updateDbStatusResult.error) {
        res.status(500).json({
            message: "Issue updating the database"
        })
        return
    }
    res.status(200).json({
        message: "Updated the status"
    })
}

export {
    updateStatusWebhook
}

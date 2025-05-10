import type { Request, Response } from "express";
import { sentDataTypes } from "../types/zodTypes/actualDataSentType";
import { tryCatch } from "../helpers/tryCatch";
import { prisma } from "../constants/prisma";
import { CloudinaryManager } from "../constants/cloudinary";

async function uploadHash(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    const parsedData = sentDataTypes.safeParse(req.body)
    if (!parsedData.success) {
        const errors: string[] = []
        parsedData.error.errors.forEach((err) => {
            errors.push(err.message)
        })
        res.status(400).json({
            errors
        })
        return
    }

    const dataFromDb = await tryCatch(prisma.metadata.findFirst({
        where: {
            AND: [
                {
                    id: parsedData.data.fileId
                },
                {
                    uploaded: false
                },
                {
                    machine_id: req.machine_count
                },
                {
                    user_id: req.user_id
                }
            ]
        }
    }))
    if (dataFromDb.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    if (!dataFromDb.data) {
        res.status(404).json({
            message: "Not found"
        })
        return
    }
    let hashPresent = false
    for (let i = 0; i < dataFromDb.data.hashes.length; i++) {
        if (parsedData.data.hash == dataFromDb.data.hashes[i]) {
            hashPresent = true
            break
        }
    }
    if (!hashPresent) {
        res.status(400).json({
            message: "Invalid hash"
        })
        return
    }
    const publicId = `dropbox/${req.user_id}/${parsedData.data.hash}`
    const isSuccess = await CloudinaryManager.getInstance().sendRawData(publicId, parsedData.data.file)
    if (!isSuccess) {
        res.status(500).json({
            message: "try again later"
        })
        return
    }
    res.status(200).json()
}

export {
    uploadHash
}

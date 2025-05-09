import type { Request, Response } from "express";
import { isDataPresentTypes } from "../types/zodTypes/isDataPresent";
import { tryCatch } from "../helpers/tryCatch";
import { prisma } from "../constants/prisma";
import { CloudinaryManager } from "../constants/cloudinary";

async function isDataPresent(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    const parsedData = isDataPresentTypes.safeParse(req.body)
    if (!parsedData.success) {
        const errors: string[] = []
        parsedData.error.errors.forEach((err) => {
            errors.push(err.message)
        })
        res.status(400).json({
            error: errors
        })
        return
    }
    console.log("File id ", parsedData.data.fileId)
    console.log("User id ", req.user_id)
    const dataFromDbResult = await tryCatch(prisma.metadata.findFirst({
        where: {
            AND: [
                {
                    id: parsedData.data.fileId,
                },
                {
                    user_id: req.user_id
                }
            ]
        }
    }))
    if (dataFromDbResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    // TODO:: Remove this line
    console.log(dataFromDbResult)
    if (!dataFromDbResult.data) {
        res.status(404).json({
            message: "Not found the file id"
        })
        return
    }

    let hashExists = false
    for (let i = 0; i < dataFromDbResult.data.hashes.length; i++) {
        if (dataFromDbResult.data.hashes[i] == parsedData.data.hash) {
            hashExists = true
            break
        }
    }

    if (!hashExists) {
        // TODO:: Remove this line
        console.log("Not foind the hash")
        res.status(404).json({
            message: "Hash not found"
        })
        return
    }

    const publicId = `dropbox/${req.user_id}/${parsedData.data.fileId}/${parsedData.data.hash}`
    const resourceExists = await CloudinaryManager.getInstance().resourceExists(publicId)
    if (!resourceExists[0]) {
        res.status(200).json({
            found: false
        })
        return
    }
    res.status(200).json({
        found: true
    })
}

export {
    isDataPresent
}

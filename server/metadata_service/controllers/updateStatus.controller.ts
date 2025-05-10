import type { Request, Response } from "express"
import { updateStatusType } from "../types/zodTypes/uploadNextType"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../constants/prisma"
import { CloudinaryManager } from "../constants/cloudinary"

async function updateStatus(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    const parsedData = updateStatusType.safeParse(req.body)
    if (!parsedData.success) {
        const errors: string[] = []
        parsedData.error.errors.map((err) => {
            errors.push(err.message)
        })
        res.status(400).json(errors)
        return
    }

    const requiredFileFromDb = await tryCatch(prisma.metadata.findFirst({
        where: {
            AND: [
                {
                    user_id: req.user_id
                },
                {
                    id: parsedData.data.fileId
                },
                {
                    machine_id: req.machine_count
                },
                {
                    uploaded: false
                }
            ]
        }
    }))
    if (requiredFileFromDb.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    if (!requiredFileFromDb.data) {
        res.status(404).json({
            message: "Issue talking to the server"
        })
        return
    }
    const hashes = requiredFileFromDb.data.hashes
    hashes.forEach(async (hash) => {
        const publicId = `dropbox/${req.user_id}/${hash}`
        const existsData = await CloudinaryManager.getInstance().resourceExists(publicId)
        if (!existsData) {
            console.log("Hash is missing")
            res.status(400).json({
                message: "Hash missing on cloud"
            })
            return
        }
    })

    // all hashes do exists so update the database
    const updateResult = await tryCatch(prisma.metadata.update({
        where: {
            id: requiredFileFromDb.data.id
        },
        data: {
            uploaded: true
        }
    }))
    if (updateResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    res.status(200).json({
        message: "Updated the status"
    })
}

export {
    updateStatus
}

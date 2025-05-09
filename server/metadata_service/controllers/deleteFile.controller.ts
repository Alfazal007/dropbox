import type { Request, Response } from "express"
import { deleteFileType } from "../types/zodTypes/deleteFileType"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../constants/prisma"

async function deleteFileHandler(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    const parsedData = deleteFileType.safeParse(req.body)
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
    const dataToDelete = await tryCatch(prisma.metadata.findFirst({
        where: {
            AND: [
                {
                    id: parsedData.data.fileId
                },
                {
                    machine_id: req.machine_count
                },
                {
                    user_id: req.user_id
                },
                {
                    uploaded: false
                }
            ]
        }
    }))
    if (dataToDelete.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    if (!dataToDelete.data) {
        res.status(404).json({
            message: "Data not found"
        })
    }
    const deleteResult = await tryCatch(prisma.metadata.delete({
        where: {
            id: parsedData.data.fileId
        }
    }))
    if (deleteResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    res.status(200).json({})
    return
}

export {
    deleteFileHandler
}

import type { Request, Response } from "express"
import { nextToDownloadFileType } from "../types/zodTypes/nextDownloadFile"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../constants/prisma"

// TODO::need to rewrite this function 
async function nextDownloadHandler(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "No request body provided"
        })
        return
    }
    const parsedData = nextToDownloadFileType.safeParse(req.body)
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
    const nextToDownloadFileResult = await tryCatch(
        prisma.metadata.findFirst({
            where: {
                AND: [
                    {
                        uploaded: true
                    },
                    {
                        user_id: req.user_id
                    },
                    {
                        machine_id: {
                            not: req.machine_count
                        }
                    },
                    {
                        isLatest: true
                    },
                    {
                        id: {
                            gt: parsedData.data.fileId
                        }
                    }
                ]
            },
            orderBy: {
                id: "asc"
            }
        },
        )
    )
    if (nextToDownloadFileResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    if (!nextToDownloadFileResult.data) {
        res.status(200).json({
            id: -1,
            user_id: -1,
            file_path: "",
            version_number: -1,
            hashes: [],
            uploaded: false,
            machine_id: -1,
            isLatest: false,
        })
        return
    }
    res.status(200).json({
        ...nextToDownloadFileResult.data
    })

}

export {
    nextDownloadHandler
}

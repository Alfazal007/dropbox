import type { Request, Response } from "express"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../constants/prisma"

async function whatToUploadNext(req: Request, res: Response) {
    const { user_id } = req
    const unuploadedMetaDataResult = await tryCatch(prisma.metadata.findMany({
        where: {
            AND: [
                {
                    user_id
                },
                {
                    uploaded: false
                }
            ]
        }
    }))
    if (unuploadedMetaDataResult.error) {
        res.status(500).json({
            error: "Issue fetching the data from the database"
        })
        return
    }
    res.status(200).json({
        result: unuploadedMetaDataResult.data
    })
}

export {
    whatToUploadNext
}

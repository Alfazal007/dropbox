import type { Request, Response } from "express";
import { tryCatch } from "../helpers/tryCatch";
import { prisma } from "../constants/prisma";

async function whatToSend(req: Request, res: Response) {
    const dataUserShouldSend = await tryCatch(prisma.metadata.findFirst({
        where: {
            AND: [
                {
                    machine_id: req.machine_count,
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
    if (dataUserShouldSend.error) {
        res.status(500).json({
            error: "Issue talking to the database"
        })
        return
    }
    if (!dataUserShouldSend.data) {
        res.status(200).json({})
        return
    }
    res.status(200).json({
        path: dataUserShouldSend.data.file_path
    })
    return
}

export {
    whatToSend
}

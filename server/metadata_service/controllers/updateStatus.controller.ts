import type { Request, Response } from "express"
import { updateStatusType } from "../types/zodTypes/uploadNextType"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../constants/prisma"
import { CloudinaryManager } from "../constants/cloudinary"
import { Prisma } from "../generated/prisma/wasm";

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


    const txResult = await tryCatch(prisma.$transaction(async (tx) => {
        const requiredFileFromDb = await tryCatch(tx.metadata.findFirst({
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
            console.log("1")
            console.log(requiredFileFromDb.error)
            await tx.$executeRaw`ROLLBACK`;
            res.status(500).json({
                message: "Issue talking to the database"
            })
            return
        }
        if (!requiredFileFromDb.data) {
            await tx.$executeRaw`ROLLBACK`;
            res.status(404).json({
                message: "Issue talking to the server"
            })
            return
        }
        const hashes = requiredFileFromDb.data.hashes

        for (let i = 0; i < hashes.length; i++) {
            let hash = hashes[i]
            const publicId = `dropbox/${req.user_id}/${hash}`
            const existsData = await CloudinaryManager.getInstance().resourceExists(publicId)
            console.log({ publicId })
            console.log({ existsData })
            if (!existsData) {
                console.log("Hash is missing")
                await tx.$executeRaw`ROLLBACK`;
                res.status(400).json({
                    message: "Hash missing on cloud"
                })
                return
            }
        }

        // all hashes do exists so update the database
        const updateResult = await tryCatch(tx.metadata.update({
            where: {
                id: requiredFileFromDb.data.id
            },
            data: {
                uploaded: true,
                isLatest: true
            }
        }))
        if (updateResult.error) {
            console.log("2")
            console.log(updateResult.error)
            await tx.$executeRaw`ROLLBACK`;
            res.status(500).json({
                message: "Issue talking to the database"
            })
            return
        }
        const prevLatestVersion = await tryCatch(tx.metadata.findFirst({
            where: {
                AND: [
                    {
                        user_id: req.user_id
                    },
                    {
                        uploaded: true
                    },
                    {
                        file_path: requiredFileFromDb.data.file_path
                    },
                    {
                        isLatest: true
                    }
                ]
            },
            orderBy: {
                id: "asc"
            }
        }))
        if (prevLatestVersion.error) {
            console.log("3")
            console.log(prevLatestVersion.error)
            await tx.$executeRaw`ROLLBACK`;
            res.status(500).json({
                message: "Issue talking to the database"
            })
            return
        }
        if (!prevLatestVersion.data) {
            console.log("4")
            console.log(prevLatestVersion.data)
            await tx.$executeRaw`ROLLBACK`;
            res.status(500).json({
                message: "Issue talking to the database"
            })
            return
        }

        if (prevLatestVersion.data.id != requiredFileFromDb.data.id) {
            const updatedData = await tryCatch(tx.metadata.update({
                where: {
                    id: prevLatestVersion.data.id
                },
                data: {
                    isLatest: false
                }
            }))
            if (updatedData.error) {
                console.log("5")
                console.log(updatedData.error)
                await tx.$executeRaw`ROLLBACK`;
                res.status(500).json({
                    message: "Issue talking to the database"
                })
                return
            }
        }
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }))
    if (txResult.error) {
        console.log("6")
        console.log(txResult.error)
        res.status(500).json({
            message: "Issue creating the file"
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

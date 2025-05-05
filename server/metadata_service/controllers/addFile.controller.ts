import type { Request, Response } from "express"
import { addFileType } from "../types/zodTypes/addFileType";
import { prisma } from "../constants/prisma";
import { tryCatch } from "../helpers/tryCatch";
import { Prisma, type Metadata } from "../generated/prisma/wasm";

async function addFileHandler(req: Request, res: Response) {
    if (!req.body) {
        res.status(400).json({
            message: "Request body not provided"
        })
        return
    }
    const parsedData = addFileType.safeParse(req.body)
    if (!parsedData.success) {
        const errors: string[] = []
        parsedData.error.errors.map((err) => {
            errors.push(err.message)
        })
        res.status(400).json(errors)
        return
    }

    const txResult = await tryCatch(prisma.$transaction(async (tx) => {
        const existingVersion = await tryCatch(tx.$queryRaw<Metadata[]>`
  SELECT * FROM \"Metadata\"
  WHERE file_path = ${parsedData.data.filePath}
    AND user_id = ${req.user_id}
  ORDER BY id DESC
  LIMIT 1
  FOR UPDATE
`);

        if (existingVersion.error) {
            await tx.$executeRaw`ROLLBACK`;
            res.status(500).json({
                error: "Issue talking to the server"
            })
            return
        }
        let versionOfFile = 0

        if (existingVersion.data.length > 0) {
            versionOfFile = existingVersion.data[0].version_number + 1
        }

        let newFileEntry = await tryCatch(
            tx.metadata.create({
                data: {
                    file_path: parsedData.data.filePath,
                    hashes: parsedData.data.hashesOfFile,
                    user_id: req.user_id,
                    version_number: versionOfFile
                }
            })
        )
        if (newFileEntry.error) {
            console.log(newFileEntry.error)
            await tx.$executeRaw`ROLLBACK`;
            res.status(500).json({
                error: "Issue talking to the server"
            })
            return
        }
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }))

    if (txResult.error) {
        res.status(500).json({
            message: "Issue creating the file"
        })
        return
    }
    res.status(201).json({
        message: "created the file"
    })
    return
}

export {
    addFileHandler
}

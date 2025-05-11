import { z } from "zod"

const nextToDownloadFileType = z.object({
    fileId: z.number({ message: "File id not provided" })
})

export {
    nextToDownloadFileType
}

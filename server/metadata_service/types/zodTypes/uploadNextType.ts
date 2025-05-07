import { z } from "zod"

const startUploadFileType = z.object({
    apiKey: z.string({ message: "Api key not provided" }),
    fileId: z.number({ message: "File id not provided" })
})

export {
    startUploadFileType
}

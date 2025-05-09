import { z } from "zod"

const deleteFileType = z.object({
    fileId: z.number({ message: "File id not provided" })
})

export {
    deleteFileType
}

import { z } from "zod"

const updateStatusType = z.object({
    fileId: z.number({ message: "File id not provided" })
})

export {
    updateStatusType
}

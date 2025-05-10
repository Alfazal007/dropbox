import { z } from "zod"

const sentDataTypes = z.object({
    fileId: z.number({ message: "File id not provided" }),
    hash: z.string({ message: "Hash not provided" }),
    file: z.string({ message: "File not provided" }),
})

export {
    sentDataTypes
}


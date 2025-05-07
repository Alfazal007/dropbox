import { z } from "zod"

const isDataPresentTypes = z.object({
    fileId: z.number({ message: "File id not provided" }),
    hash: z.string({ message: "Hash not provided" })
})

export {
    isDataPresentTypes
}

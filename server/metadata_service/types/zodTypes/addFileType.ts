import { z } from "zod"

const addFileType = z.object({
    filePath: z.string({ message: "File path not provided" }).min(1, { message: "Invalid file path provided" }),
    hashesOfFile: z.array(z.string(), { message: "Hashes of file not provided" }).min(1, { message: "Empty hash is not valid" })
})

export {
    addFileType
}

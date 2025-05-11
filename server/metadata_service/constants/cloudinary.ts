import { v2 as cloudinary } from "cloudinary"
import { tryCatch } from "../helpers/tryCatch"

class CloudinaryManager {
    static instance: CloudinaryManager
    private constructor() { }

    static getInstance(): CloudinaryManager {
        if (!this.instance) {
            this.instance = new CloudinaryManager()
            cloudinary.config({
                api_key: process.env.CLOUDINARYAPIKEY,
                cloud_name: process.env.CLOUDINARYCLOUDNAME,
                api_secret: process.env.CLOUDINARYAPISECRET
            })
        }
        return this.instance
    }

    async resourceExists(publicId: string): Promise<boolean> {
        const resourceExists = await tryCatch(cloudinary.api.resource(publicId, {
            resource_type: "raw"
        }))
        if (resourceExists.error) {
            return false
        }
        if (!resourceExists.data.asset_id) {
            return false
        }
        return true
    }
}

export {
    CloudinaryManager
}

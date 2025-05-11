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

    async resourceExists(publicId: string): Promise<[boolean, boolean]> {
        const resourceExists = await tryCatch(cloudinary.api.resource(publicId))
        if (resourceExists.error) {
            return [false, true]
        }
        return [resourceExists.data, false]
    }

    async sendRawData(publicId: string, base64data: string): Promise<boolean> {
        const dataUri = `data:application/octet-stream;base64,${base64data}`;
        const response = await tryCatch(cloudinary.uploader.upload(dataUri, {
            public_id: publicId,
            resource_type: "raw",
            invalidate: true
        }))
        console.log({ response })
        if (response.error) {
            return false
        }
        return true
    }
}

export {
    CloudinaryManager
}

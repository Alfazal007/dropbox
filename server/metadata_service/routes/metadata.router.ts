import { Router } from "express";
import { addFileHandler } from "../controllers/addFile.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { whatToUploadNext } from "../controllers/nextTask.controller";
import { updateStatusWebhook } from "../controllers/startUpload.controller";

const metadaRouter = Router()

metadaRouter.route("/addfile/:username/:token/:machineCount").post(authMiddleware, addFileHandler)
metadaRouter.route("/uploadNext/:username/:token/:machineCount").get(authMiddleware, whatToUploadNext)
metadaRouter.route("/webhook/updateStatus").post(updateStatusWebhook)

export {
    metadaRouter
}


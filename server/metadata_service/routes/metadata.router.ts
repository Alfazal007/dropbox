import { Router } from "express";
import { addFileHandler } from "../controllers/addFile.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { updateStatus } from "../controllers/updateStatus.controller";
import { deleteFileHandler } from "../controllers/deleteFile.controller";

const metadaRouter = Router()

metadaRouter.route("/addfile/:username/:token/:machineCount").post(authMiddleware, addFileHandler)
metadaRouter.route("/deleteFile/:username/:token/:machineCount").post(authMiddleware, deleteFileHandler)
metadaRouter.route("/updateStatus/:username/:token/:machineCount").post(authMiddleware, updateStatus)

export {
    metadaRouter
}


import { Router } from "express";
import { addFileHandler } from "../controllers/addFile.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { whatToUploadNext } from "../controllers/nextTask.controller";

const metadaRouter = Router()

metadaRouter.route("/addfile/:username/:token/:machineCount").post(authMiddleware, addFileHandler)
metadaRouter.route("/addfile/:username/:token/:machineCount").post(authMiddleware, whatToUploadNext)

export {
    metadaRouter
}


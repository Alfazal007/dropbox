import { Router } from "express";
import { addFileHandler } from "../controllers/addFile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const metadaRouter = Router()

metadaRouter.route("/addfile/:username/:token/:machineCount").post(authMiddleware, addFileHandler)

export {
    metadaRouter
}


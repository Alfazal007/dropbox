import { Router } from "express";
import { isDataPresent } from "../controllers/isDataPresent.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadHash } from "../controllers/uploadHash.controller";
import { whatToSend } from "../controllers/whatToSend.controller";

const cloudDataRouter = Router()

cloudDataRouter.route("/isDataPresent/:username/:token/:machineCount").post(authMiddleware, isDataPresent)
cloudDataRouter.route("/whatToSend/:username/:token/:machineCount").get(authMiddleware, whatToSend)
cloudDataRouter.route("/sendData/:username/:token/:machineCount").post(authMiddleware, uploadHash)

export {
    cloudDataRouter
}

import { Router } from "express";
import { isDataPresent } from "../controllers/isDataPresent.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const cloudDataRouter = Router()

// this endpoint is to check if a chunk is already sent and uploaded to s3
cloudDataRouter.route("/isDataPresent/:username/:token/:machineCount").post(authMiddleware, isDataPresent)

export {
    cloudDataRouter
}

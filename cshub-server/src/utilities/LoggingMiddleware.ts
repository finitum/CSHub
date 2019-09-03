import { IJWTToken } from "../../../cshub-shared/src/models";
import { Request } from "express";
import logger from "./Logger";

export const logMiddleware = (req: Request, userObj: IJWTToken | null = null) => {
    if (req.method !== "OPTIONS") {
        const userData = userObj !== null ? `, uid: ${userObj.user.id}` : "";
        logger.info(`[${req.headers["x-forwarded-for"] || req.connection.remoteAddress}${userData}] - ${req.path}`);
    }
};

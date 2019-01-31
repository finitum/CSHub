import {IJWTToken} from "../../../cshub-shared/src/models";
import {Request} from "express";
import logger from "./Logger";


export const logMiddleware = (req: Request, userObj: IJWTToken = null) => {

    const userData = userObj !== null ? `, uid: ${userObj.user.id}` : "";
    logger.info(`[${req.ip}${userData}] - ${req.path}`);
};

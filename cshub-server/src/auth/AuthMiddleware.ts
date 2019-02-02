import {Request, Response} from "express";
import dayjs from "dayjs";

import {IJWTToken} from "../../../cshub-shared/src/models/IJWTToken";

import {app} from "../index";
import {sign, validateAccessToken} from "./JWTHandler";
import {Settings} from "../settings";
import {logMiddleware} from "../utilities/LoggingMiddleware";

app.use((req: Request, res: Response, next: Function) => {


    const tokenValidity = checkTokenValidity(req);

    if (tokenValidity.valid) {

        if (typeof tokenValidity.tokenObj.user !== "undefined") {
            const newtoken: string = sign(tokenValidity.tokenObj.user);

            res.cookie("token", newtoken, {
                maxAge: Settings.TOKENAGEMILLISECONDS,
                domain: Settings.DOMAIN
            });

            logMiddleware(req, tokenValidity.tokenObj);
        } else {
            logMiddleware(req, null);
        }

    } else {
        logMiddleware(req, null);
        res.clearCookie("token");
    }

    next();
});

export type ValidationType = { valid: boolean, tokenObj?: IJWTToken };
export const checkTokenValidity = (req: Request): ValidationType => {

    // This checks the incoming JWT token, validates it, checks if it's still valid.
    // If valid, create a new one (so no cookie stealing)
    // If invalid, remove the cookie
    if (req.cookies !== null && req.cookies["token"] !== null) {

        const tokenObj: IJWTToken = validateAccessToken(req.cookies.token);

        if (tokenObj !== undefined && dayjs(tokenObj.expirydate * 1000).isAfter(dayjs()) && tokenObj.user.verified && !tokenObj.user.blocked) {
            return {valid: true, tokenObj};
        } else {
            return {valid: false};
        }
    }
    return {valid: false};
};

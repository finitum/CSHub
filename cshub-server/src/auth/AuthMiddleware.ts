import { Application, Request } from "express";
import dayjs from "dayjs";

import { IJWTToken } from "../../../cshub-shared/src/models";

import { sign, validateAccessToken } from "./JWTHandler";
import { Settings } from "../settings";
import { logMiddleware } from "../utilities/LoggingMiddleware";

export function addAuthMiddleware(app: Application): void {
    app.use((req, res, next) => {
        const tokenValidity = checkTokenValidityFromRequest(req);

        if (tokenValidity) {
            const newtoken: string = sign(tokenValidity.user);

            res.cookie("token", newtoken, {
                maxAge: Settings.TOKENAGEMILLISECONDS,
                domain: Settings.DOMAIN,
            });

            logMiddleware(req, tokenValidity);
        } else {
            logMiddleware(req, null);
            res.clearCookie("token");
        }

        next();
    });
}

export type ValidationType = false | IJWTToken;

export const checkTokenValidityFromJWT = (jwt: string): ValidationType => {
    if (!jwt) {
        return false;
    }

    // This checks the incoming JWT token, validates it, checks if it's still valid.
    // If valid, create a new one (so no cookie stealing)
    // If invalid, remove the cookie
    const tokenObj = validateAccessToken(jwt);

    if (
        tokenObj !== undefined &&
        dayjs(tokenObj.expirydate * 1000).isAfter(dayjs()) &&
        tokenObj.user.verified &&
        !tokenObj.user.blocked
    ) {
        return tokenObj;
    } else {
        return false;
    }
};

export const checkTokenValidityFromRequest = (req: Request): ValidationType => {
    if (req.cookies === null) {
        return false;
    }

    const cookie = req.cookies["token"];
    if (cookie === undefined) {
        return false;
    }

    return checkTokenValidityFromJWT(cookie);
};

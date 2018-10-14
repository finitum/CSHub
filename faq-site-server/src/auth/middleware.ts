import {Request, Response} from "express";
import moment from "moment";

import {IJWTToken} from "../../../faq-site-shared/models/IJWTToken";

import {app} from "../index";
import {sign, validateAccessToken} from "./jwt";
import {Settings} from "../settings";

app.use((req: Request, res: Response, next: Function) => {


    const tokenVailidity = checkTokenValidity(req);

    if (tokenVailidity.valid) {

        if (tokenVailidity.tokenObj.user !== undefined) {
            const newtoken: string = sign(tokenVailidity.tokenObj.user);

            res.cookie("token", newtoken, {
                maxAge: Settings.TOKENAGEMILLISECONDS
            });
        }

    } else {
        res.clearCookie("token");
    }

    // Add some headers so we don't have to deal with CORS problems
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", Settings.SITEADDRESS);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,UPDATE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");

    next();
});

export const checkTokenValidity = (req: Request): {valid: boolean, tokenObj?: IJWTToken} => {

    // This checks the incoming JWT token, validates it, checks if it's still valid.
    // If valid, create a new one (so no cookie stealing)
    // If invalid, remove the cookie
    if (req.cookies !== null && req.cookies["token"] !== null) {

        const tokenObj: IJWTToken = validateAccessToken(req.cookies.token);

        if (tokenObj !== undefined && moment.unix(tokenObj.expirydate).isAfter(moment())) {
            return {valid: true, tokenObj};
        } else {
            return {valid: false};
        }
    }
    return {valid: false};
};

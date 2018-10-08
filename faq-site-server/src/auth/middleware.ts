import {Request, Response} from "express";
import moment from "moment";

import {IJWTToken} from "../../../faq-site-shared/models/IJWTToken";

import {app} from "../index";
import {sign, validateAccessToken} from "./jwt";
import {Settings} from "../settings";

app.use((req: Request, res: Response, next: Function) => {

    if (req.cookies !== null && req.cookies["token"] !== null) {

        const tokenObj: IJWTToken = validateAccessToken(req.cookies.token);

        if (tokenObj !== undefined && moment.unix(tokenObj.expirydate).isAfter(moment())) {

            const newtoken: string = sign(tokenObj.user);

            res.cookie("token", newtoken, {
               maxAge: 7200000 // Two hours
           });
        } else {
            res.clearCookie("token");
        }
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", Settings.ALLOWORIGIN);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,UPDATE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");

    next();
});

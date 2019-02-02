import {Request, Response} from "express";
import {Settings} from "../settings";

export const CORSMiddleware = (req: Request, res: Response, next: Function) => {

    // Add some headers so we don't have to deal with CORS problems
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", `${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}`);
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, version");

    next();
};

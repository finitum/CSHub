import { Request, Response } from "express";
import { Settings } from "../settings";

export const CORSMiddleware = (req: Request, res: Response, next: Function) => {
    // Add some headers so we don't have to deal with CORS problems as much
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", `${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}`);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, version, x-topic-version, x-post-version, x-exclude-last-edit, x-include-last-edit, x-studies-version"
    );

    next();
};

import {app} from "../index";
import {Request, Response} from "express";
import logger from "../utilities/Logger";
import {readFileSync} from "fs";

const SHA = JSON.parse(readFileSync("./package.json").toString())["gitSHA"];

app.use((req: Request, res: Response, next: Function) => {
    const versionMatch = SHA === req.header("Version");

    const msg = versionMatch ? "Versions match" : "Version mismatch";
    logger.verbose(msg);

    if (!versionMatch) {
        res.status(500).send();
    } else {
        next();
    }

});

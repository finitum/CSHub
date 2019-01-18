import {app} from "../index";
import {Request, Response} from "express";
import logger from "../utilities/Logger";
import {readFileSync} from "fs";

const SHA = JSON.parse(readFileSync("./package.json").toString())["gitSHA"];

app.use((req: Request, res: Response, next: Function) => {
    // logger.info("Client version: " + req.header("Version"));
    const msg = SHA === req.header("Version") ? "Versions match" : "Version mismatch";
    logger.info(msg);
    next();
});

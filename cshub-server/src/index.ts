import logger from "./utilities/Logger";
import { Settings } from "./settings";

import "reflect-metadata";
import "./db/orm-connection";

import { CORSMiddleware } from "./utilities/CORSMiddleware";
import http from "http";
import express from "express";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export const app: express.Application = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(CORSMiddleware);

app.options("*", CORSMiddleware);

import "./auth/AuthMiddleware";
import "./utilities/VersionMiddleware";

// Run the server on port 3000
export const server = http.createServer(app).listen(Settings.PORT);

// Here all the connectors will be defined
import "./endpoints";
import "./realtime-edit";
import { query } from "./db/database-query";

logger.info("Express server started with settings:");
logger.info(JSON.stringify(Settings));

setInterval(() => {
    query("SELECT 1");
}, 60 * 5 * 1000);

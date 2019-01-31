import logger from "./utilities/Logger";

import {Settings} from "./settings";

import http from "http";
import express from "express";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export const app: express.Application = express();

// Use some middleware to allow all CORS and to parse the incoming body and cookies
app.use(cors({
    origin: Settings.SITEADDRESS,
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({limit: "1mb"}));

app.use(cookieParser());

import "./auth/AuthMiddleware";
import "./utilities/VersionMiddleware";

// Run the server on port 3000
export const server = http.createServer(app).listen(Settings.PORT);

// Here all the connectors will be defined
import "./components";
import {query} from "./utilities/DatabaseConnection";

logger.info("Express server started with settings:");
logger.info(JSON.stringify(Settings));

setInterval(() => {
    query("SELECT 1");
}, 60 * 5 * 1000);

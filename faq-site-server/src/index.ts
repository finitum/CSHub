import winston, {format} from "winston";

// Create the logger object, it will log to two different files, depending on the severity of the log
export const logger = winston.createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
    ]
});

// The logger object will also log to the console for convinience
logger.add(new winston.transports.Console({
    format: winston.format.simple()
}));

import {Settings} from "./settings";

import https from "https";
import http from "http";
import express from "express";
import fs from "fs";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export const app: express.Application = express();

// Use some middleware to allow all CORS and to parse the incoming body and cookies
app.use(cors({
    origin: Settings.ALLOWORIGIN,
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

import "./auth/middleware";

let server: http.Server | https.Server;

if (Settings.LIVE) {

    // Read the public and private keys
    const options = {
        key: fs.readFileSync("certs/csedelft-privkey.pem"),
        cert: fs.readFileSync("certs/csedelft-pubkey.pem")
    };
    // Run the server on port 443 if live
    server = https.createServer(options, app).listen(443);

    // Use port 80 (http), but redirect to 443 (https)
    http.createServer((req, res) => {
        res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`});
        res.end();
    }).listen(80);

} else {
    // Run the server on port 3000 if running local
    server = http.createServer(app).listen(3000);
}

// Serve the built vue files
app.use(express.static("../faq-site-client/dist"));

// Here all the connectors will be defined
import "./components";

logger.info("Express server started");

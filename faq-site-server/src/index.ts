import {Settings} from "./settings";

import https from "https";
import http from "http";
import express from "express";
import fs from "fs";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export const app: express.Application = express();

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

import "./components";

console.log("Express server started");

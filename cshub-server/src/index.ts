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
import "./endpoints/utils";

// Run the server on port 3000
export const server = http.createServer(app).listen(Settings.PORT);

// Here all the connectors will be defined
import "./endpoints";
import "./realtime-edit";
import { query } from "./db/database-query";
import { generateRandomTopicHash } from "./utilities/TopicsUtils";

logger.info("Express server started with settings:");
logger.info(JSON.stringify(Settings));

app.on("db-connect", async () => {
    const topicname = "DefaultTopic";

    // check if a DefaultTopic exists
    const exists =
        (await query(
            `
            SELECT * FROM topics
            WHERE name = ?
            `,
            topicname
        )).getLength() > 0;

    if(!exists) {
        const hash = await generateRandomTopicHash();
        const id = await query(
            `
        INSERT INTO topics
        SET  name     = ?,
             parentid = ?,
             hash     = ?
             
        
        `,
            topicname,
            null,
            hash
        );
    }
});

setInterval(() => {
    query("SELECT 1");
}, 60 * 5 * 1000);

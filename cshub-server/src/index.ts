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

// Create a default topic and study if it doesn't exist so you aren't stuck.
// From this default topic, an Admin can create more studies/topics
// The default topic doesn't seem strictly necessary but no studies can exist without
// a root topic.
app.on("db-connect", async () => {
    const DefaultTopicName = "DefaultTopic";
    const DefaultStudyName = "DefaultStudy";

    // check if a DefaultTopic exists
    const DefaultTopicExists =
        (await query(
            `
            SELECT * FROM topics
            WHERE name = ?
            `,
            DefaultTopicName
        )).getLength() > 0;

    let id;
    if (!DefaultTopicExists) {
        const hash = await generateRandomTopicHash();
        id = (await query(
            `
        INSERT INTO topics
        SET  name     = ?,
             parentid = ?,
             hash     = ?
        `,
            DefaultTopicName,
            null,
            hash
        )).getInsertId();
    } else {
        id = (await query(
            `
            SELECT id FROM topics WHERE name = ?
            `,
            DefaultTopicName
        )).getStringFromDB("id", 0);
    }

    await query(
        `
        REPLACE INTO studies
        SET  name       = ?,
             topTopicId = ?
        `,
        DefaultStudyName,
        id
    );

});

setInterval(() => {
    query("SELECT 1");
}, 60 * 5 * 1000);

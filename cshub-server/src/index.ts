import logger from "./utilities/Logger";
import { Settings } from "./settings";

import "reflect-metadata";
import { CORSMiddleware } from "./utilities/CORSMiddleware";
import http, { Server } from "http";
import express from "express";

import { query } from "./db/database-query";
import { generateRandomTopicHash } from "./utilities/TopicsUtils";
import { getRepository } from "typeorm";
import { Topic } from "./db/entities/topic";
import { Study } from "./db/entities/study";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { connectDb } from "./db/orm-connection";

export const app: express.Application = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(CORSMiddleware);

app.options("*", CORSMiddleware);

import "./auth/AuthMiddleware";
import "./utilities/VersionMiddleware";
import "./endpoints/utils";

// Here all the connectors will be defined
import "./endpoints";
import { registerSockets } from "./realtime-edit/socket-receiver";

export let server: Server;

connectDb().then(() => {
    // Run the server on port
    server = http.createServer(app).listen(Settings.PORT);

    registerSockets();

    logger.info("Express server started with settings:");
    logger.info(JSON.stringify(Settings));

    // Create a default topic and study if it doesn't exist so you aren't stuck.
    // From this default topic, an Admin can create more studies/topics
    // The default topic doesn't seem strictly necessary but no studies can exist without
    // a root topic.
    app.on("db-connect", async () => {
        const defaultTopicName = "DefaultTopic";
        const defaultStudyName = "DefaultStudy";

        const studyRepository = getRepository(Study);
        const topicRepository = getRepository(Topic);

        if ((await topicRepository.count()) === 0 || (await studyRepository.count()) === 0) {
            logger.info("Inserting default topic and study!");

            // If so, create new topic
            const hash = await generateRandomTopicHash();

            const newTopic = new Topic();
            newTopic.name = defaultTopicName;
            newTopic.parentId = null;
            newTopic.hash = hash;

            const inserted = await topicRepository.save(newTopic);

            const study = new Study();
            study.name = defaultStudyName;
            study.topTopicId = inserted.id;

            await studyRepository.save(study);
        }
    });

    setInterval(() => {
        query("SELECT 1");
    }, 60 * 5 * 1000);
});

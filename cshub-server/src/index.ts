import logger from "./utilities/Logger";
import { Settings } from "./settings";

import "reflect-metadata";
import { corsMiddleware } from "./utilities/CORSMiddleware";
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
corsMiddleware(app);

import "./auth/AuthMiddleware";
import "./utilities/VersionMiddleware";
import "./endpoints/utils";

// Here all the connectors will be defined
import "./endpoints";
import { registerSockets } from "./realtime-edit/socket-receiver";
import { User } from "./db/entities/user";
import { EmailDomain } from "./db/entities/emaildomain";
import { hashPassword } from "./auth/HashPassword";
import { getRandomNumberLarge } from "../../cshub-shared/src/utilities/Random";

export let server: Server;

connectDb().then(async () => {
    // Run the server on port
    server = http.createServer(app).listen(Settings.PORT);

    registerSockets();

    logger.info("Express server started with settings:");
    logger.info(JSON.stringify(Settings));

    // Create a default topic and study if it doesn't exist so you aren't stuck.
    // From this default topic, an Admin can create more studies/topics
    // The default topic doesn't seem strictly necessary but no studies can exist without
    // a root topic
    const defaultTopicName = "DefaultTopic";
    const defaultStudyName = "DefaultStudy";
    const defaultAdminName = "DefaultAdmin";
    const defaultDomainName = "DefaultDomain";

    const studyRepository = getRepository(Study);
    const topicRepository = getRepository(Topic);
    const userRepository = getRepository(User);
    const domainRepository = getRepository(EmailDomain);

    const studyCount = await studyRepository.count();
    const amountOfAdmins = await userRepository.count({
        where: {
            admin: true,
        },
    });

    logger.info("Testing for default topic, study, domain and admin!");

    let topic = await topicRepository.findOne();
    if (!topic) {
        // If so, create new topic
        const hash = await generateRandomTopicHash();

        const newTopic = new Topic();
        newTopic.name = defaultTopicName;
        newTopic.parentid = null;
        newTopic.hash = hash;
        topic = await topicRepository.save(newTopic);
    }

    if (studyCount === 0) {
        const study = new Study();
        study.name = defaultStudyName;
        study.topTopic = topic;
        await studyRepository.save(study);
    }

    let domain = await domainRepository.findOne();
    if (!domain) {
        const newDomain = new EmailDomain();
        newDomain.domain = defaultDomainName;
        domain = await domainRepository.save(newDomain);
    }

    if (amountOfAdmins === 0) {
        const newAdmin = new User();
        newAdmin.admin = true;
        newAdmin.email = defaultAdminName;
        newAdmin.domain = domain;
        newAdmin.verified = true;
        newAdmin.firstname = "admin";
        newAdmin.lastname = "admin";

        const password = getRandomNumberLarge().toString();
        newAdmin.password = await hashPassword(password);
        logger.info(`Created new admin, username: ${defaultAdminName}, password: ${password}`);

        await userRepository.insert(newAdmin);
    }

    setInterval(() => {
        query("SELECT 1");
    }, 60 * 5 * 1000);
});

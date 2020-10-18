import "reflect-metadata";

import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as cluster from "cluster";
import { cpus } from "os";

import { Settings } from "./settings";
import logger from "./utilities/Logger";

import { connectDb } from "./db/orm-connection";

import { addAuthMiddleware } from "./auth/AuthMiddleware";
import { addVersionMiddleware } from "./utilities/VersionMiddleware";
import { addClassTransformMiddleware } from "./endpoints/utils";
import { addCorsMiddleware } from "./utilities/CORSMiddleware";

import { registerSockets } from "./realtime-edit/socket-receiver";
import { registerEndpoints } from "./endpoints";
import { initializeDatabase } from "./init";

function createApp() {
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(cookieParser());

    addCorsMiddleware(app);
    addAuthMiddleware(app);
    addVersionMiddleware(app);
    addClassTransformMiddleware(app);

    return app;
}

if (cluster.isMaster) {
    connectDb().then(async () => {
        await initializeDatabase();

        logger.info("Master started with settings:");
        logger.info(JSON.stringify(Settings));
    });

    const cpuCount = cpus().length;
    for (let i = 0; i < cpuCount; i += 1) {
        logger.verbose(`Starting fork ${i}`);
        cluster.fork();
    }
} else {
    connectDb().then(() => {
        const app = createApp();
        const server = http.createServer(app).listen(Settings.PORT);

        registerEndpoints(app);
        if (cluster.worker.id === 1) {
            logger.info("Starting socket server");
            registerSockets(server);
        }

        logger.info("Fork started");
    });
}

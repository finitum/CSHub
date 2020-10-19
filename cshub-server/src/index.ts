import "reflect-metadata";

import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import * as cluster from "cluster";
import * as net from "net";
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
import { Worker } from "cluster";

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

    const workers: Worker[] = [];

    const spawn = (i: number) => {
        logger.verbose(`Starting fork ${i}`);
        workers.push(cluster.fork());

        workers[i].on("exit", (code, signal) => {
            logger.verbose(`Restarting fork ${i}`);
            spawn(i);
        });
    };

    const cpuCount = cpus().length;
    for (let i = 0; i < cpuCount; i += 1) {
        spawn(i);
    }

    net.createServer({ pauseOnConnect: true }, (c) => {
        const worker = Math.floor(Math.random() * workers.length);
        workers[worker].send("exec", c);
    }).listen(Settings.PORT);
} else {
    connectDb().then(() => {
        const app = createApp();
        const server = http.createServer(app).listen(0);

        registerEndpoints(app);
        if (cluster.worker.id === 1) {
            logger.info("Starting socket server");
            registerSockets(server);
        }

        process.on("message", function (m, c) {
            if ("exec" === m) {
                server.emit("connection", c);
                c.resume();
            }
        });

        logger.info("Fork started");
    });
}

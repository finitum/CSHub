import { ConnectionOptions, createConnection, Logger, QueryRunner } from "typeorm";

import { Settings } from "../settings";

import { User } from "./entities/user";
import { Topic } from "./entities/topic";
import { Post } from "./entities/post";
import { Edit } from "./entities/edit";
import { Study } from "./entities/study";

import tunnel from "tunnel-ssh";
import fs from "fs";
import logger from "../utilities/Logger";
import { CacheVersion } from "./entities/cacheversion";
import { Question } from "./entities/practice/question";
import { app } from "../index";
import { Answer } from "./entities/practice/answer";
import { Variable } from "./entities/practice/variable";

class CustomLogger implements Logger {
    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner): any {
        logger.log(level, message);
    }

    logMigration(message: string, queryRunner?: QueryRunner): any {
        logger.info(message);
    }

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        logger.verbose(query);
    }
    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        logger.error(`Query error: ${error} for query ${query}`);
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        logger.error(`Slow query, takes ${time} for ${query}`);
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
        logger.info(message);
    }
}

const options: ConnectionOptions = {
    type: "mariadb",
    host: Settings.DATABASE.HOST,
    port: Settings.DATABASE.PORT,
    username: Settings.DATABASE.USER,
    password: Settings.DATABASE.PASSWORD,
    database: Settings.DATABASE.NAME,
    multipleStatements: true,
    logger: new CustomLogger(),
    entities: [User, Topic, Post, Edit, Study, Answer, Question, CacheVersion, Variable],
    synchronize: !Settings.LIVE // DON'T RUN THIS LIVE, THIS WILL CHANGE SCHEMA
};

if (Settings.USESSH) {
    const sshConfig = {
        username: Settings.SSH.USER,
        privateKey: fs.readFileSync(Settings.SSH.PRIVATEKEYLOCATION),
        host: Settings.SSH.HOST,
        port: Settings.SSH.PORT,
        dstHost: "localhost",
        dstPort: 3306,
        localHost: "localhost",
        localPort: Settings.DATABASE.PORT
    };

    tunnel(sshConfig, (error, server) => {
        if (error) {
            throw error;
        }

        createConnection(options).catch(reason => logger.error(reason));
    });
} else {
    createConnection(options)
        .then(() => {
            app.emit("db-connect");
        })
        .catch(reason => logger.error(reason));
}

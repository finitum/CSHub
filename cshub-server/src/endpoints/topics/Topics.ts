import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { Topics, GetTopicsCallBack } from "../../../../cshub-shared/src/api-calls";
import { getTopicTree } from "../../utilities/TopicsUtils";
import { getRepository } from "typeorm";
import { CacheVersion } from "../../db/entities/cacheversion";

app.get(Topics.getURL, (req: Request, res: Response) => {
    let version = -1;
    const versionHeader = req.header(Topics.topicVersionHeader);
    if (versionHeader) {
        version = +versionHeader;
        logger.info("Received TopicVersion: " + version);
    }

    let study: number | undefined = undefined;
    const studyQueryParam = req.query[Topics.studyQueryParam];
    if (studyQueryParam) {
        study = +studyQueryParam;
        logger.info("Received Study: " + study);
    }

    const repository = getRepository(CacheVersion);

    repository
        .findOne({
            where: {
                type: "TOPICS"
            }
        })
        .then(versionData => {
            if (versionData && versionData.version === version) {
                res.status(304).send(); // Not Modified
            } else {
                getTopicTree(study).then(result => {
                    if (result === null) {
                        logger.error(`No topics found`);
                        res.status(500).send();
                    } else {
                        res.json(new GetTopicsCallBack(versionData ? versionData.version : 0, result));
                    }
                });
            }
        });
});

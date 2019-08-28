import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { Topics, GetTopicsCallBack } from "../../../../cshub-shared/src/api-calls";
import { getTopicTree } from "../../utilities/TopicsUtils";
import { getRepository } from "typeorm";
import { CacheVersion } from "../../db/entities/cacheversion";
import { Topic } from "../../db/entities/topic";

app.get(Topics.getURL, async (req: Request, res: Response) => {
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

    const versionData = await repository.findOne({
        where: {
            type: "TOPICS"
        }
    });

    const makeJsonifiable = (topic: Topic) => {
        delete topic.parent;

        for (const child of topic.children) {
            makeJsonifiable(child);
        }
    };

    if (!versionData) {
        const cacheVersion = new CacheVersion();
        cacheVersion.version = 0;
        cacheVersion.type = "TOPICS";
        repository.save(cacheVersion);
    } else if (versionData && versionData.version === version) {
        res.status(304).send(); // Not Modified
    } else {
        const topicTree = await getTopicTree(study);

        if (topicTree === null) {
            logger.error(`No topics found`);
            res.status(500).send();
        } else {
            if (topicTree.length > 1) {
                logger.error("More than 1 top topic?");
                res.status(500).send();
                return;
            }

            const topTopic = topicTree[0];

            makeJsonifiable(topTopic);

            res.json(new GetTopicsCallBack(versionData ? versionData.version : 0, topTopic));
        }
    }
});

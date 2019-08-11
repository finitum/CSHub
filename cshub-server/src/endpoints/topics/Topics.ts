import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {Topics, GetTopicsCallBack} from "../../../../cshub-shared/src/api-calls";
import {getTopicTree} from "../../utilities/TopicsUtils";
import {getRepository} from "typeorm";
import {CacheVersion} from "../../db/entities/cacheversion";

app.get(Topics.getURL, (req: Request, res: Response) => {

    const topicVersion: number = +req.header(Topics.topicVersionHeader);
    logger.info("Received TopicVersion: " + topicVersion);

    let study: number | undefined = undefined;
    if (req.query[Topics.studyQueryParam]) {
        study = +req.query[Topics.studyQueryParam];
        logger.info("Received Study: " + study);
    }

    const repository = getRepository(CacheVersion);

    repository.findOne({
        where: {
            type: "TOPICS"
        }
    })
        .then(versionData => {
            const version = versionData.version;
            if (version === topicVersion) {
                res.status(304).send(); // Not Modified
            } else {
                const topics = getTopicTree(study);
                topics
                    .then((result) => {
                        if (result === null) {
                            logger.error(`No topics found`);
                            res.status(500).send();
                        } else {
                            res.json(new GetTopicsCallBack(version, result));
                        }
                    });
            }
        });
});

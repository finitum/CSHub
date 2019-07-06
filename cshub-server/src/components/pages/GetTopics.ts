import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {GetTopics, GetTopicsCallBack} from "../../../../cshub-shared/src/api-calls";
import {getTopicTree} from "../../utilities/TopicsUtils";
import {DatabaseResultSet, query} from "../../db/database-query";

app.get(GetTopics.getURL, (req: Request, res: Response) => {

    const topicVersion: number = +req.header(GetTopics.topicVersionHeader);
    logger.info("Received TopicVersion: " + topicVersion);

    query(`
        SELECT version
        FROM cacheversion
        WHERE type = "TOPICS"`)
        .then((versionData: DatabaseResultSet) => {
            const version = versionData.getNumberFromDB("version");

            if (version === topicVersion) {
                res.status(304).send(); // Not Modified
            } else {
                const topics = getTopicTree();
                topics
                    .then((result) => {
                        if (result === null) {
                            logger.error(`No topics found`);
                            res.status(500).send();
                        } else {
                            res.json(new GetTopicsCallBack(result, version));
                        }
                    });
            }
        });
});

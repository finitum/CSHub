import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {Topics, GetTopicsCallBack} from "../../../../cshub-shared/src/api-calls";
import {getTopicTree} from "../../utilities/TopicsUtils";
import {DatabaseResultSet, query} from "../../db/database-query";
import {ServerError} from "../../../../cshub-shared/src/models/ServerError";

app.get(Topics.getURL, (req: Request, res: Response) => {

    const topicVersion: number = +req.header(Topics.topicVersionHeader);
    logger.info("Received TopicVersion: " + topicVersion);

    const study: number = +req.query[Topics.studyQueryParam];
    if (!study) {
        res.status(400).send(new ServerError("Not a valid study id"));
        return;
    }
    logger.info("Received Study: " + study);

    query(`
        SELECT cacheVersion
        FROM studies T1
        INNER JOIN topics t on T1.topTopicId = t.id
        WHERE T1.id = ?`, study)
        .then((versionData: DatabaseResultSet) => {
            const version = versionData.getNumberFromDB("cacheVersion");

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
                            res.json(new GetTopicsCallBack(result, version));
                        }
                    });
            }
        });
});

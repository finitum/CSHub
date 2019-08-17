import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";
import { DatabaseResultSet, query } from "../../db/database-query";

import { TopicPosts, GetTopicPostsCallBack } from "../../../../cshub-shared/src/api-calls";
import { getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import { getTopicFromHash } from "../../../../cshub-shared/src/utilities/Topics";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";

app.get(TopicPosts.getURL, (req: Request, res: Response) => {
    const topicHash = Number(req.params.topichash);

    if (isNaN(topicHash)) {
        res.sendStatus(400);
    }

    const topics = getTopicTree();
    topics
        .then(topicsResult => {
            if (topicsResult === null || typeof topicsResult === "undefined") {
                logger.error(`No topics found, so can't get posts`);
                res.status(500).send();
            } else {
                let topicHashes: number[] = [];

                // Can't be 0 anymore, due to studies
                if (topicHash !== 0) {
                    const currTopic = getTopicFromHash(topicHash, topicsResult);
                    topicHashes = getChildHashes(currTopic ? [currTopic] : []);
                } else {
                    res.status(400).send(new ServerError("Naah, topic 0 does not exist mate"));
                    return;
                }

                if (topicHashes.length > 0) {
                    // Retreiving all post hashes of the current topic
                    query(
                        `
                      SELECT T1.hash
                      FROM posts T1
                             INNER JOIN topics T2 ON T1.topic = T2.id
                      WHERE deleted = 0
                        AND T1.wip = 0
                        AND T2.hash IN (?)
                        AND (T1.isIndex = 0 OR T1.topic = (SELECT id FROM topics WHERE hash = ?))
                      ORDER BY T1.isIndex DESC, T1.datetime DESC
                    `,
                        topicHashes,
                        topicHash
                    )
                        .then((posts: DatabaseResultSet) => {
                            const postHashes: number[] = [];

                            for (const post of posts.convertRowsToResultObjects()) {
                                postHashes.push(post.getNumberFromDB("hash"));
                            }

                            const callbackObj = new GetTopicPostsCallBack(postHashes);

                            res.json(callbackObj);
                        })
                        .catch(err => {
                            logger.error(`Getting posts hash failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                } else {
                    res.json(new GetTopicPostsCallBack([]));
                }
            }
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send();
        });
});

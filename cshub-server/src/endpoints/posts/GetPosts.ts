import { Request, Response } from "express";
import { findTopicInTree, getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import logger from "../../utilities/Logger";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { DatabaseResultSet } from "../../db/database-query";
import { PostHashes } from "../../../../cshub-shared/src/api-calls/endpoints/posts";

export const getPosts = (
    req: Request,
    res: Response,
    queryGetter: (topicHashes: number[], currentTopicHash: number) => Promise<DatabaseResultSet>,
): void => {
    const topicHash = Number(req.params.topichash);

    if (isNaN(topicHash)) {
        res.sendStatus(400);
    }

    const topics = getTopicTree();
    topics
        .then((topicsResult) => {
            if (topicsResult === null || typeof topicsResult === "undefined") {
                logger.error(`No topics found, so can't get posts`);
                res.status(500).send();
            } else {
                let topicHashes: number[] = [];

                // Can't be 0 anymore, due to studies
                if (topicHash !== 0) {
                    const currTopic = findTopicInTree(topicHash, topicsResult);
                    topicHashes = getChildHashes(currTopic ? [currTopic] : []);
                } else {
                    res.status(400).send(new ServerError("Naah, topic 0 does not exist mate"));
                    return;
                }

                if (topicHashes.length > 0) {
                    // Retreiving all post hashes of the current topic
                    queryGetter(topicHashes, topicHash)
                        .then((posts: DatabaseResultSet) => {
                            const postHashes: number[] = [];

                            for (const post of posts.convertRowsToResultObjects()) {
                                postHashes.push(post.getNumberFromDB("hash"));
                            }

                            const callbackObj = new PostHashes(postHashes);

                            res.json(callbackObj);
                        })
                        .catch((err) => {
                            logger.error(`Getting posts hash failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                } else {
                    res.json(new PostHashes([]));
                }
            }
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).send();
        });
};

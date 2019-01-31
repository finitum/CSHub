import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";

import {GetTopicPostsCallBack, GetTopicPosts} from "../../../../cshub-shared/src/api-calls";
import {getTopicTree} from "../../utilities/TopicsUtils";
import {ITopic} from "../../../../cshub-shared/src/models";
import {getTopicFromHash} from "../../../../cshub-shared/src/utilities/Topics";
import tracker from "../../utilities/Tracking";

app.post(GetTopicPosts.getURL, (req: Request, res: Response) => {

    const topicPostsRequest: GetTopicPosts = req.body as GetTopicPosts;

    const reqURL = "/topic/" + topicPostsRequest.topicHash;
    tracker.pageview(reqURL).send();

    logger.verbose(reqURL);

    const getChildHashes = (inputTopic: ITopic[]): number[] => {

        const currentTopicHashes: number[] = [];

        for (const topic of inputTopic) {
            if (typeof topic.children !== "undefined" && topic.children !== null) {
                currentTopicHashes.push(...getChildHashes(topic.children));
            }
            currentTopicHashes.push(topic.hash);
        }

        return currentTopicHashes;
    };

    const topics = getTopicTree();
    topics
        .then((topicsResult) => {
            if (topicsResult === null || typeof topicsResult === "undefined") {
                logger.error(`No topics found, so can't get posts`);
                res.status(500).send();
            } else {

                let topicHashes: number[] = [];

                // If no current topic, so on the homepage
                if (topicPostsRequest.topicHash === 0) {
                    topicHashes = getChildHashes(topicsResult);
                } else {
                    const currTopic = getTopicFromHash(topicPostsRequest.topicHash, topicsResult);
                    topicHashes = getChildHashes([currTopic]);
                }

                if (topicHashes.length > 0) {
                    // Retreiving all post hashes of the current topic
                    query(`
                      SELECT T1.hash
                      FROM posts T1
                             INNER JOIN topics T2 ON T1.topic = T2.id
                             INNER JOIN edits T3 ON T1.id = T3.post
                      WHERE deleted = 0
                        AND T3.approved = 1
                        AND T2.hash IN (?)
                        AND (T1.isIndex = 0 OR T1.topic = (SELECT id FROM topics WHERE hash = ?))
                      GROUP BY T3.post
                      ORDER BY T1.isIndex DESC, T1.datetime DESC
                    `, topicHashes, topicPostsRequest.topicHash)
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
        });
});

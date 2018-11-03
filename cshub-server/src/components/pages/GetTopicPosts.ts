import async from "async";
import {Request, Response} from "express";

import {app, logger} from "../../";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";

import {GetTopicPostsCallBack, GetTopicPosts} from "../../../../cshub-shared/api-calls";
import {getTopicTree} from "../../utilities/TopicsUtils";
import {ITopic} from "../../../../cshub-shared/models";
import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";

app.post(GetTopicPosts.getURL, (req: Request, res: Response) => {

    const topicPostsRequest: GetTopicPosts = req.body as GetTopicPosts;

    const getChildHashes = (inputTopic: ITopic[]): number[] => {

        const currentTopicHashes: number[] = [];

        for (const topic of inputTopic) {
            if (typeof topic.children !== "undefined") {
                currentTopicHashes.push(...getChildHashes(topic.children));
            }
            currentTopicHashes.push(topic.hash);
        }

        return currentTopicHashes;
    };

    const topics = getTopicTree();
    topics
        .then((topicsResult) => {
            if (topicsResult === null) {
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
                  WHERE approved = 1 AND T2.hash IN (?)
                  ORDER BY datetime DESC
                `, topicHashes, topicPostsRequest.startFromResult)
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

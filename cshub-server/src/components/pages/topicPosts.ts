import async from "async";
import {Request, Response} from "express";

import {app, logger} from "../../";
import {DatabaseResultSet, query} from "../../utilities/database-connection";

import {TopicPostsCallBack, TopicPostsRequest} from "../../../../cshub-shared/api-calls";
import {getTopicTree} from "../../utilities/topics-utils";
import {ITopic} from "../../../../cshub-shared/models";
import {getTopicFromHash} from "../../../../cshub-shared/utilities/topics";

app.post(TopicPostsRequest.getURL, (req: Request, res: Response) => {

    const topicPostsRequest: TopicPostsRequest = req.body as TopicPostsRequest;

    const getChildHashes = (inputTopic: ITopic[]): number[] => {

        const currentTopicHashes: number[] = [];

        for (const topic of inputTopic) {
            if (topic.children !== undefined) {
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

                            const callbackObj = new TopicPostsCallBack(postHashes);

                            res.json(callbackObj);
                        })
                        .catch(err => {
                            logger.error(`Getting posts hash failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                } else {
                    res.json(new TopicPostsCallBack([]));
                }

            }
        });
});

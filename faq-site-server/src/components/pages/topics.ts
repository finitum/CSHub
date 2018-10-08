import {Request, Response} from "express";

import {app, logger} from "../../";
import {DatabaseResultSet, query} from "../../database-connection";

import {ITopic} from "../../../../faq-site-shared/models";
import {TopicsCallBack, TopicsRequest} from "../../../../faq-site-shared/api-calls/pages/TopicsRequest";

app.get(TopicsRequest.getURL, (req: Request, res: Response) => {

    const topics = getTopicTree();
    topics
        .then((result) => {
            if (result === null) {
                logger.error(`No topics found`);
                res.status(500).send();
            } else {
                res.json(new TopicsCallBack(result));
            }
        });
});

// This is a recursive function which will get the topic from its hashs, if not, check the children (by calling iself on the children)
export const getTopicFromHash = (topicHash: number, topics: ITopic[]): ITopic => {
    for (const topic of topics) {
        if (topic.hash === topicHash) {
            return topic;
        } else if (topic.children !== undefined) {
            const currTopic =  getTopicFromHash(topicHash, topic.children);
            if (currTopic !== null) {
                return currTopic;
            }
        }
    }
    return null;
};

// This is called quite often, it will retreive all the topics from the database and parse them into the correct model
export const getTopicTree = (): Promise<ITopic[] | null> => {
    return query(`
      SELECT id, parentid, name, hash
      FROM topics
    `)
        .then((topics: DatabaseResultSet) => {

            const topicsParsed: ITopic[] = [];

            // This will return an array of the children of a certain topic, through recursion as well.
            const getChildTopics = (id: number): ITopic[] => {

                const childTopicsParsed: ITopic[] = [];
                // Get all the topics which have this topic as their parent, then get the child topics of these as well to create the actual topic tree
                // This topic tree has the first topics that don't have a parent as their topics, and then they all have their corresponding children
                const childTopics = topics.getRows().filter(x => DatabaseResultSet.getNumberFromDB("parentid", x) === id);
                if (childTopics.length > 0) {

                    for (const topic of childTopics) {

                        const children: ITopic[] = getChildTopics(DatabaseResultSet.getNumberFromDB("id", topic));

                        const currTopic: ITopic = {
                            name: DatabaseResultSet.getStringFromDB("name", topic),
                            id: DatabaseResultSet.getNumberFromDB("id", topic),
                            hash: DatabaseResultSet.getNumberFromDB("hash", topic)
                        };

                        // If this topic has children, add them to the object
                        if (children !== null) {
                            currTopic.children = children;
                        }

                        childTopicsParsed.push(currTopic);
                    }

                    return childTopicsParsed;
                } else {
                    return null;
                }
            };

            // Get all the topics that don't have a parent, and get all their children to get our topic array
            for (const topic of topics.getRows().filter(x => DatabaseResultSet.getNumberFromDB("parentid", x) === 0)) {

                const children = getChildTopics(DatabaseResultSet.getNumberFromDB("id", topic));

                const currTopic: ITopic = {
                    name: DatabaseResultSet.getStringFromDB("name", topic),
                    id: DatabaseResultSet.getNumberFromDB("id", topic),
                    hash: DatabaseResultSet.getNumberFromDB("hash", topic)
                };

                if (children !== null) {
                    currTopic.children = children;
                }

                topicsParsed.push(currTopic);
            }

            return topicsParsed;
        })
        .catch(err => {
            return null;
        });
};

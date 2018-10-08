import {Request, Response} from "express";

import {app} from "../../";
import {DatabaseResultSet, query} from "../../database-connection";

import {ITopic} from "../../../../faq-site-shared/models";
import {TopicsCallBack, TopicsRequest} from "../../../../faq-site-shared/api-calls/pages/TopicsRequest";

app.get(TopicsRequest.getURL, (req: Request, res: Response) => {

    const topics = getTopics();
    topics
        .then((result) => {
            if (result === null) {
                res.status(503).send();
            } else {
                res.json(new TopicsCallBack(result));
            }
        });
});

export const getTopics = (): Promise<ITopic[] | null> => {
    return query(`
      SELECT id, parentid, name
      FROM topics
    `)
        .then((topics: DatabaseResultSet) => {

            const topicsParsed: ITopic[] = [];

            const getChildTopics = (id: number): ITopic[] => {

                const childTopicsParsed: ITopic[] = [];
                const childTopics = topics.getRows().filter(x => DatabaseResultSet.getNumberFromDB("parentid", x) === id);
                if (childTopics.length > 0) {

                    for (const topic of childTopics) {

                        const children: ITopic[] = getChildTopics(DatabaseResultSet.getNumberFromDB("id", topic));

                        const currTopic: ITopic = {
                            name: DatabaseResultSet.getStringFromDB("name", topic),
                            id: DatabaseResultSet.getNumberFromDB("id", topic)
                        };

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

            for (const topic of topics.getRows().filter(x => DatabaseResultSet.getNumberFromDB("parentid", x) === 0)) {

                const children: ITopic[] = getChildTopics(DatabaseResultSet.getNumberFromDB("id", topic));

                const currTopic: ITopic = {
                    name: DatabaseResultSet.getStringFromDB("name", topic),
                    id: DatabaseResultSet.getNumberFromDB("id", topic)
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

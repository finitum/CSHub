import {ITopic} from "../../../cshub-shared/src/models";
import {DatabaseResultSet, query} from "./DatabaseConnection";
import {getTopicFromHash} from "../../../cshub-shared/src/utilities/Topics";

export const generateRandomTopicHash = (): Promise<number> => {
    const hash = parseInt((Math.random() * 1000000000).toString(), 10);

    // Right now, using getTopicTree each time is terribly inefficient, but in the future we want to optimize this one. So just use this one for now and the optimizations will be in this method so not much refactoring has to be done.
    return getTopicTree()
        .then((topics) => {
            const topic = getTopicFromHash(hash, topics);
            if (topic === null) {
                return hash;
            } else {
                return generateRandomTopicHash();
            }
        });
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

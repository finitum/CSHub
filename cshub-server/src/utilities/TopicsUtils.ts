import {ITopic} from "../../../cshub-shared/src/models";
import {DatabaseResultSet, query} from "../db/database-query";
import {getTopicFromHash} from "../../../cshub-shared/src/utilities/Topics";
import {getRandomNumberLarge} from "../../../cshub-shared/src/utilities/Random";

export const generateRandomTopicHash = (): Promise<number> => {
    const hash = getRandomNumberLarge();

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
export const getTopicTree = (study?: number): Promise<ITopic[] | null> => {
    return query(`
        SELECT t.id, parentid, t.name, hash, s.id AS studyId
        FROM topics t
                 LEFT JOIN studies s on t.id = s.topTopicId
    `)
        .then((topics: DatabaseResultSet) => {

            const topicsParsed: ITopic[] = [];

            // This will return an array of the children of a certain topic, through recursion as well.
            const getChildTopics = (id: number): ITopic[] => {

                if (id === 0) {
                    id = null;
                }

                const childTopicsParsed: ITopic[] = [];
                // Get all the topics which have this topic as their parent, then get the child topics of these as well to create the actual topic tree
                // This topic tree has the first topics that don't have a parent as their topics, and then they all have their corresponding children
                const childTopics = topics.convertRowsToResultObjects().filter(x => x.getNumberFromDB("parentid") === id);
                if (childTopics.length > 0) {

                    for (const topic of childTopics) {

                        const children: ITopic[] = getChildTopics(topic.getNumberFromDB("id"));

                        const currTopic: ITopic = {
                            name: topic.getStringFromDB("name"),
                            id: topic.getNumberFromDB("id"),
                            hash: topic.getNumberFromDB("hash"),
                            study: topic.getNumberFromDB("studyId")
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
            for (const topic of topics.convertRowsToResultObjects().filter(x => x.getNumberFromDB("parentid") === null)) {

                const children = getChildTopics(topic.getNumberFromDB("id"));

                const currTopic: ITopic = {
                    name: topic.getStringFromDB("name"),
                    id: topic.getNumberFromDB("id"),
                    hash: topic.getNumberFromDB("hash"),
                    study: topic.getNumberFromDB("studyId")
                };

                if (children !== null) {
                    currTopic.children = children;
                }

                topicsParsed.push(currTopic);
            }

            const getTreeForStudy = (topicTree: ITopic[], study: number): ITopic => {
                for (const topic of topicTree) {
                    if (topic.study === study) {
                        return topic;
                    } else {
                        const treeForStudy = getTreeForStudy(topic.children, study);
                        if (treeForStudy) {
                            return treeForStudy;
                        }
                    }
                }

                return null;
            };

            if (study) {
                return [getTreeForStudy(topicsParsed, study)];
            } else {
                return topicsParsed;
            }

        })
        .catch(err => {
            return null;
        });
};

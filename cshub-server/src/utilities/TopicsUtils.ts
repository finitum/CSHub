import {DatabaseResultSet, query} from "../db/database-query";
import {getTopicFromHash} from "../../../cshub-shared/src/utilities/Topics";
import {getRandomNumberLarge} from "../../../cshub-shared/src/utilities/Random";
import {ITopic} from "../../../cshub-shared/src/entities/topic";
import {IStudy} from "../../../cshub-shared/src/entities/study";

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

export const findTopicInTree = (topicHash: number, topics: ITopic[]): ITopic => {

    for (const topic of topics) {
        if (topic.hash === topicHash) {
            return topic;
        } else if (topic.children) {
            const topicInChildren = findTopicInTree(topicHash, topic.children);
            if (topicInChildren) {
                return topicInChildren;
            }
        }
    }

    return null;
};


export const findStudyIdsOfTopic = (topic: ITopic): IStudy[] => {

    const studyIds: IStudy[] = [];

    const study = topic.study;
    if (study) {
        studyIds.push(study);
    }

    if (topic.parent) {
        const parentStudyIds = findStudyIdsOfTopic(topic.parent);
        studyIds.push(...parentStudyIds);
    }

    return studyIds;
};

// Retrieving all the studies that contain that topic id
export const getStudiesFromTopic = (topicHash: number): Promise<IStudy[]> => {

    return getTopicTree()
        .then(value => {

            if (value) {
                const topic = findTopicInTree(topicHash, value);

                if (topic) {
                    return findStudyIdsOfTopic(topic);
                }
            }

            return [];
        });
};

// This is called quite often, it will retreive all the topics from the database and parse them into the correct model
export const getTopicTree = (study?: number): Promise<ITopic[]> => {
    return query(`
        SELECT t.id, parentid, t.name, hash, s.id AS studyId, t.cacheVersion, s.name as studyName
        FROM topics t
                 LEFT JOIN studies s on t.id = s.topTopicId
    `)
        .then((topics: DatabaseResultSet) => {

            // This will return an array of the children of a certain topic, through recursion as well.
            const getChildTopics = (parent?: ITopic): ITopic[] => {

                let parentId: number = null;
                if (parent) {
                    parentId = parent.id;
                }

                const childTopicsParsed: ITopic[] = [];
                // Get all the topics which have this topic as their parent, then get the child topics of these as well to create the actual topic tree
                // This topic tree has the first topics that don't have a parent as their topics, and then they all have their corresponding children
                const childTopics = topics.convertRowsToResultObjects().filter(x => x.getNumberFromDB("parentid") === parentId);
                if (childTopics.length > 0) {

                    for (const topic of childTopics) {

                        const currTopic: ITopic = {
                            name: topic.getStringFromDB("name"),
                            id: topic.getNumberFromDB("id"),
                            hash: topic.getNumberFromDB("hash"),
                            cacheVersion: topic.getNumberFromDB("cacheVersion"),
                            parent
                        };

                        const numberFromDB = topic.getNumberFromDB("studyId");
                        if (numberFromDB) {
                            currTopic.study =  {
                                id: numberFromDB,
                                name: topic.getStringFromDB("studyName")
                            };
                        }

                        const children: ITopic[] = getChildTopics(currTopic);

                        // If this topic has children, add them to the object
                        if (children !== null) {
                            currTopic.children = children;
                        }

                        childTopicsParsed.push(currTopic);
                    }

                    return childTopicsParsed;
                } else {
                    return [];
                }
            };

            const topicsParsed = getChildTopics();

            const getTreeForStudy = (topicTree: ITopic[], study: number): ITopic => {
                for (const topic of topicTree) {
                    if (topic.study.id === study) {
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

import { getRandomNumberLarge } from "../../../cshub-shared/src/utilities/Random";
import { IStudy } from "../../../cshub-shared/src/entities/study";
import { getRepository } from "typeorm";
import { Topic } from "../db/entities/topic";
import { ITopic } from "../../../cshub-shared/src/entities/topic";

export const generateRandomTopicHash = (): Promise<number> => {
    const hash = getRandomNumberLarge();

    // Right now, using getTopicTree each time is terribly inefficient, but in the future we want to optimize this one. So just use this one for now and the optimizations will be in this method so not much refactoring has to be done.
    return getTopicTree().then(topics => {
        if (topics) {
            const topic = findTopicInTree(hash, topics);
            if (topic === null) {
                return hash;
            } else {
                return generateRandomTopicHash();
            }
        } else {
            return generateRandomTopicHash();
        }
    });
};

export const findTopicInTree = (topicHash: number, topics: Topic[]): Topic | null => {
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

export const findStudyIdsOfTopic = (topic: Topic): IStudy[] => {
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

export const getChildHashes = (inputTopic: ITopic[]): number[] => {
    const currentTopicHashes: number[] = [];

    for (const topic of inputTopic) {
        currentTopicHashes.push(...getChildHashes(topic.children));
        currentTopicHashes.push(topic.hash);
    }

    return currentTopicHashes;
};

// Retrieving all the studies that contain that topic id
export const getStudiesFromTopic = (topicHash: number): Promise<IStudy[]> => {
    return getTopicTree().then(value => {
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
export const getTopicTree = (study?: number): Promise<Topic[] | null> => {
    const topicRepository = getRepository(Topic);

    return topicRepository
        .find({
            relations: ["parent", "study"]
        })
        .then(topics => {
            const parseCurrentLayer = (parent: Topic | null) => {
                const topicsWithParent = topics.filter(topic => {
                    if (parent === null) {
                        return topic.parent === null;
                    } else {
                        return topic.parent && topic.parent.id === parent.id;
                    }
                });

                if (parent) {
                    parent.children = topicsWithParent;
                }

                for (const topic of topicsWithParent) {
                    const children = topics.filter(childTopic => {
                        return childTopic.parent && childTopic.parent.id === topic.id;
                    });
                    topic.children = children;

                    for (const child of children) {
                        parseCurrentLayer(child);
                    }
                }
            };

            parseCurrentLayer(null);

            const getTreeForStudy = (topicTree: Topic[], study: number): Topic | null => {
                for (const topic of topicTree) {
                    if (topic.study && topic.study.id === study) {
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
                const treeForStudy = getTreeForStudy(topics, study);
                if (treeForStudy) {
                    return [treeForStudy];
                }
            } else {
                return topics.filter(topic => topic.parent === null);
            }

            return null;
        })
        .catch(err => {
            return null;
        });
};

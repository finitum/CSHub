import { app } from "../../index";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { query } from "../../db/database-query";
import { AlreadySentError } from "../utils";
import logger from "../../utilities/Logger";
import { RestructureTopics, TopicOrNew } from "../../../../cshub-shared/src/api-calls/endpoints/topics";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Topic } from "../../db/entities/topic";
import { Study } from "../../db/entities/study";
import { findTopicInTree, generateRandomTopicHash, getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { Post } from "../../db/entities/post";

app.put(RestructureTopics.postURL, async (req: Request, res: Response) => {
    const restructureTopicsRequest: RestructureTopics = req.body as RestructureTopics;

    try {
        const studyId = +req.params.id;
        if (isNaN(studyId)) {
            res.status(400).json(new ServerError("No valid studyId!"));
            return;
        }

        const authenticated = checkTokenValidityFromRequest(req);
        if (authenticated === false) {
            res.sendStatus(401);
            return;
        } else if (!authenticated.user.admin && !authenticated.user.studies.map(s => s.id).includes(studyId)) {
            res.sendStatus(403);
            return;
        }

        const topicRepository = getRepository(Topic);
        const studyRepository = getRepository(Study);

        const study = await studyRepository.findOne({ id: studyId });
        if (!study) {
            res.sendStatus(404);
            return;
        }

        const topTopic = await topicRepository.findOne({
            id: study.topTopicId
        });
        if (!topTopic) {
            res.sendStatus(500);
            logger.error("No top topic");
            return;
        } else if (topTopic.id !== restructureTopicsRequest.topTopic.id) {
            res.sendStatus(400);
            return;
        }

        const topicTree = await getTopicTree(study.id);

        if (!topicTree) {
            res.sendStatus(500);
            logger.error("No topic tree");
            return;
        }

        const actualTopTopic = findTopicInTree(topTopic.hash, topicTree);

        if (!actualTopTopic) {
            res.sendStatus(500);
            logger.error("No actual top topic");
            return;
        }

        const getNonNewChildHashes = (inputTopic: TopicOrNew[]): number[] => {
            const currentTopicHashes: number[] = [];

            for (const topic of inputTopic) {
                currentTopicHashes.push(...getNonNewChildHashes(topic.children));
                if (topic.id !== null && topic.hash !== null) {
                    currentTopicHashes.push(topic.hash);
                }
            }

            return currentTopicHashes;
        };

        const postRepository = getRepository(Post);

        const originalChildHashes = getChildHashes([actualTopTopic]);
        const nonNewChildHashes = getNonNewChildHashes([restructureTopicsRequest.topTopic]);

        const deletedHashes = originalChildHashes.filter(hash => !nonNewChildHashes.includes(hash));
        for (const deletedHash of deletedHashes) {
            const topicInTree = findTopicInTree(deletedHash, topicTree);
            if (topicInTree) {
                const childHashes = getChildHashes([topicInTree]);
                const posts = await postRepository
                    .createQueryBuilder("post")
                    .select(["post.id", "topic.name"])
                    .leftJoin("post.topic", "topic")
                    .where("topic.hash IN (:...childHashes)", {
                        childHashes
                    })
                    .getRawMany();

                if (posts.length > 0) {
                    res.status(400).json(
                        new ServerError(`You are deleting a topic (${posts[0].topic_name}) which has underlying posts!`)
                    );
                    return;
                }
            }
        }

        const insertNewTopics = async (parentTopic: TopicOrNew): Promise<TopicOrNew> => {
            for (let i = 0; i < parentTopic.children.length; i++) {
                const childTopic = parentTopic.children[i];

                if (childTopic.id === null || childTopic.hash === null) {
                    const inputsValidation = validateMultipleInputs({
                        input: childTopic.name,
                        validationObject: {
                            minlength: 2,
                            maxlength: 40
                        }
                    });

                    if (!inputsValidation.valid) {
                        res.status(400);
                        throw new AlreadySentError();
                    }

                    const topicHash = await generateRandomTopicHash();

                    const topicRepository = getRepository(Topic);
                    const newTopic = new Topic();
                    newTopic.parentid = parentTopic.id;
                    newTopic.hash = topicHash;
                    newTopic.name = childTopic.name;
                    const topicInserted = await topicRepository.save(newTopic);

                    parentTopic.children[i] = {
                        ...topicInserted,
                        children: childTopic.children
                    };
                }

                await insertNewTopics(childTopic);
            }

            return parentTopic;
        };

        const newTopicTree = await insertNewTopics(restructureTopicsRequest.topTopic);

        const recursiveUpdate = async (topic: TopicOrNew) => {
            for (const childTopic of topic.children) {
                if (childTopic.id === null || childTopic.hash === null) {
                    res.sendStatus(500);
                    logger.error("Id or hash null");
                    throw new AlreadySentError();
                } else {
                    const validation = validateMultipleInputs({
                        input: childTopic.name,
                        validationObject: {
                            minlength: 2,
                            maxlength: 40
                        }
                    });

                    if (!validation.valid) {
                        logger.error(`Invalid Request`);
                        res.sendStatus(400);
                        throw new AlreadySentError();
                    }

                    if (topic.id === null || topic.hash === null) {
                        res.sendStatus(500);
                        logger.error("Id or hash null");
                        throw new AlreadySentError();
                    }

                    const parent = new Topic();
                    parent.id = topic.id;

                    await topicRepository.update(childTopic.id, {
                        name: childTopic.name,
                        parent
                    });
                }

                await recursiveUpdate(childTopic);
            }
        };

        await recursiveUpdate(newTopicTree);

        for (const hash of deletedHashes) {
            await topicRepository.delete({ hash });
        }

        await query(`
            UPDATE cacheversion
            SET version = version + 1
            WHERE type = 'TOPICS'
        `);

        res.sendStatus(201);
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            logger.error(err);
            res.sendStatus(500);
        }
    }
});

import { app } from "../../index";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { query } from "../../db/database-query";
import { AlreadySentError } from "../utils";
import logger from "../../utilities/Logger";
import { RestructureTopics } from "../../../../cshub-shared/src/api-calls/endpoints/topics";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Topic } from "../../db/entities/topic";
import { Study } from "../../db/entities/study";
import {
    findStudyIdsOfTopic,
    findTopicInTree,
    generateRandomTopicHash,
    getChildHashes,
    getTopicTree
} from "../../utilities/TopicsUtils";
import { xor, isEmpty } from "lodash";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";

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

        await updateOldTree(restructureTopicsRequest, studyId, req, res);
        await insertNewTopics(restructureTopicsRequest, studyId, req, res);

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

const updateOldTree = async (requestObj: RestructureTopics, studyNr: number, req: Request, res: Response) => {
    const topicRepository = getRepository(Topic);
    const studyRepository = getRepository(Study);

    const study = await studyRepository.findOne({ id: studyNr });
    if (!study) {
        res.sendStatus(404);
        throw new AlreadySentError();
    }

    const topTopic = await topicRepository.findOne({
        id: study.topTopicId
    });
    if (!topTopic) {
        res.sendStatus(500);
        throw new AlreadySentError();
    } else if (topTopic.id !== requestObj.topTopic.id) {
        res.sendStatus(400);
        throw new AlreadySentError();
    }

    const topicTree = await getTopicTree(study.id);

    if (!topicTree) {
        res.sendStatus(500);
        throw new AlreadySentError();
    }

    const actualTopTopic = findTopicInTree(topTopic.hash, topicTree);

    if (!actualTopTopic) {
        return res.sendStatus(500);
    }

    const expectedMinimumChildHashes = getChildHashes([actualTopTopic]);
    const actualChildHashes = getChildHashes([requestObj.topTopic]);

    if (!isEmpty(xor(expectedMinimumChildHashes, actualChildHashes))) {
        res.status(400).json(new ServerError("Not the same amount of elements as known tree!"));
        throw new AlreadySentError();
    }

    const recursiveUpdate = async (topic: ITopic) => {
        for (const childTopic of topic.children) {
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

            await topicRepository.update(childTopic.id, {
                name: childTopic.name,
                parent: topic
            });

            await recursiveUpdate(childTopic);
        }
    };

    await recursiveUpdate(requestObj.topTopic);
};

const insertNewTopics = async (requestObj: RestructureTopics, studyNr: number, req: Request, res: Response) => {
    const inputsValidation = validateMultipleInputs(
        ...requestObj.newTopics.map(topic => {
            return {
                input: topic.name,
                validationObject: {
                    minlength: 2,
                    maxlength: 40
                }
            };
        }),
        ...requestObj.newTopics.map(topic => {
            return {
                input: topic.parentHash
            };
        })
    );

    // check if the request was valid
    if (!inputsValidation.valid) {
        logger.error(`Invalid Request`);
        res.sendStatus(400);
        throw new AlreadySentError();
    }

    // test if there are any topics in the tree
    const topics = await getTopicTree(studyNr);
    if (topics === null) {
        logger.error(`No Topics Found`);
        res.status(500).json(new ServerError("Server did oopsie"));
        throw new AlreadySentError();
    }

    for (const newTopic of requestObj.newTopics) {
        // check if the parent topic actually exists
        const parentTopic = findTopicInTree(newTopic.parentHash, topics);
        if (parentTopic === null) {
            logger.error(`No Parent Topic Found`);
            res.status(400).json(new ServerError("Parent topic not found!"));
            throw new AlreadySentError();
        }

        const studiesWithParentTopic = findStudyIdsOfTopic(parentTopic);
        if (!studiesWithParentTopic.some(study => study.id === studyNr)) {
            logger.error(`Study id doesn't correspond to parent id`);
            res.status(400).json(new ServerError("Study id doesn't correspond to parent id!"));
            throw new AlreadySentError();
        }

        const topicHash = await generateRandomTopicHash();

        await query(
            `
            INSERT INTO topics
            SET name     = ?,
                parentid = ?,
                hash     = ?
        `,
            newTopic.name,
            parentTopic.id,
            topicHash
        );
    }
};

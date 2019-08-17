import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { SubmitTopic } from "../../../../cshub-shared/src/api-calls";

import { validateMultipleInputs } from "../../utilities/StringUtils";
import { findTopicInTree, generateRandomTopicHash, getTopicTree } from "../../utilities/TopicsUtils";
import { query } from "../../db/database-query";
import { canCreateTopicRequest } from "../../auth/validateRights/TopicAccess";
import { hasAccessToTopicRequest } from "../../auth/validateRights/PostAccess";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";

app.post(SubmitTopic.getURL, async (req: Request, res: Response) => {
    const submitTopicRequest: SubmitTopic = req.body as SubmitTopic;
    const inputsValidation = validateMultipleInputs(
        {
            input: submitTopicRequest.topicTitle,
            validationObject: {
                minlength: 2,
                maxlength: 35
            }
        },
        { input: submitTopicRequest.topicParentHash }
    );

    // check if the request was valid
    if (!inputsValidation.valid) {
        logger.error(`Invalid Request`);
        res.sendStatus(400);
        return;
    }

    // check if the user can save anything
    const AccessRights = await hasAccessToTopicRequest(submitTopicRequest.topicParentHash, req);
    if (!AccessRights.canSave) {
        logger.error(`No Save Access`);
        return res.sendStatus(403);
    }

    // check if the user has access to creating topics
    const access = await canCreateTopicRequest(submitTopicRequest.topicParentHash, req);
    if (!access) {
        logger.error(`No Access`);
        return res.sendStatus(401);
    }

    // test if there are any topics in the tree
    const topics = await getTopicTree();
    if (topics === null) {
        logger.error(`No Topics Found`);
        return res.status(500).json(new ServerError("Server did oopsie"));
    }

    // check if the parent topic actually exists
    const requestTopic = findTopicInTree(submitTopicRequest.topicParentHash, topics);
    if (requestTopic === null) {
        logger.error(`No Parent Topic Found`);
        return res.status(400).json(new ServerError("Parent topic not found!"));
    }

    // check if there isn't already a topic with this name
    if (
        (await query(
            `
            SELECT id
            FROM topics
            WHERE name = ?
        `,
            submitTopicRequest.topicTitle
        )).convertRowsToResultObjects().length !== 0
    ) {
        logger.error("Topic already exists!");
        return res.status(409).json(new ServerError("Topic already exists!"));
    }

    // All checks have passed. Insert the new topic in the DB

    const topicHash = await generateRandomTopicHash();
    await query(
        `
            INSERT INTO topics
            SET name     = ?,
                parentid = ?,
                hash     = ?
        `,
        submitTopicRequest.topicTitle,
        requestTopic.id,
        topicHash
    );

    await query(`
        UPDATE cacheversion
        SET version = version + 1
        WHERE type = 'TOPICS'
    `);

    return res.sendStatus(201);
});

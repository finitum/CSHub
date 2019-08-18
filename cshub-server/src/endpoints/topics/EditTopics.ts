import { app } from "../../index";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { query } from "../../db/database-query";
import { AlreadySentError } from "../utils";
import logger from "../../utilities/Logger";
import { RenameTopic } from "../../../../cshub-shared/src/api-calls/endpoints/topics/EditTopics";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { Topic } from "../../db/entities/topic";

app.put(RenameTopic.postURL, async (req: Request, res: Response) => {
    const topicRepository = getRepository(Topic);
    const renameTopicRequest: RenameTopic = req.body as RenameTopic;

    try {
        const id = checkRequest(req, res);

        if (renameTopicRequest.newName.length > 20) {
            res.status(400).json(new ServerError("Name too long!"));
            return;
        }

        if (renameTopicRequest.newName.length < 3) {
            res.status(400).json(new ServerError("Name too short!"));
            return;
        }

        await topicRepository.update(id, { name: renameTopicRequest.newName });

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

const checkRequest = (req: Request, res: Response): number => {
    const authenticated = checkTokenValidityFromRequest(req);
    if (authenticated === false) {
        res.sendStatus(401);
        throw new AlreadySentError();
    } else if (!authenticated.user.admin) {
        res.sendStatus(403);
        throw new AlreadySentError();
    }

    const id = +req.params.id;
    if (isNaN(id)) {
        res.status(400).json(new ServerError("No valid topic id!"));
        throw new AlreadySentError();
    }

    return id;
};

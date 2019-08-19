import { app } from "../../index";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { query } from "../../db/database-query";
import { AlreadySentError } from "../utils";
import logger from "../../utilities/Logger";
import { RenameTopic, RestructureTopics } from "../../../../cshub-shared/src/api-calls/endpoints/topics/EditTopics";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { Topic } from "../../db/entities/topic";
import {Study} from "../../db/entities/study";

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


app.put(RestructureTopics.postURL, async (req: Request, res: Response) => {
    const topicRepository = getRepository(Topic);
    const studyRepository = getRepository(Study);
    const restructureTopicsRequest: RestructureTopics = req.body as RestructureTopics;

    try {
        const studyId = checkRequest(req, res);

        const study = await studyRepository.findOne({ id: studyId });
        if (!study) {
            return res.sendStatus(403);
        }
        const topTopic = await topicRepository.findOne(study.topTopic);
        if (!topTopic) {
            return res.sendStatus(500);
        }

        const recursiveUpdate = (topic: ITopic) => {
            for (const childTopic of topic.children) {
                topicRepository.update(childTopic.id, { parent: topic });
                recursiveUpdate(childTopic);
            }
        };

        for (const topic of restructureTopicsRequest.topics){
            topicRepository.update(topic.id, { parent: topTopic });
            recursiveUpdate(topic);
        }


        // await topicRepository.update(id, { name: renameTopicRequest.newName });

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

const flatten = (root: ITopic): ITopic[] => {
    const res = [root]
    for (const i of root.children){
        res.push(...flatten(i));
    }

    return res;
};

const checkRequest = (req: Request, res: Response): number => {
    const authenticated = checkTokenValidityFromRequest(req);

    const id = +req.params.id;
    if (isNaN(id)) {
        res.status(400).json(new ServerError("No valid topic id!"));
        throw new AlreadySentError();
    }

    if (authenticated === false) {
        res.sendStatus(401);
        throw new AlreadySentError();
    } else if (!authenticated.user.admin && !authenticated.user.studies.map(s => s.id).includes(id)) {
        res.sendStatus(403);
        throw new AlreadySentError();
    }

    return id;
};

import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { app } from "../../";

import { GetStudiesCallback, Studies, AllStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
import { HideStudies, UnhideStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/HideStudies";
import { RenameStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/RenameStudies";
import { CreateStudies, CreateStudiesCallback } from "../../../../cshub-shared/src/api-calls/endpoints/study/CreateStudies";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Study } from "../../db/entities/study";
import logger from "../../utilities/Logger";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { Topic } from "../../db/entities/topic";
import {generateRandomTopicHash} from "../../utilities/TopicsUtils";

// returns only the visible studies (hidden==false)
app.get(Studies.getURL, (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

    studyRepository
        .find({
            relations: ["topTopic"]
        })
        .then(value => {
            res.json(new GetStudiesCallback(value.filter((item) => item.hidden === false)));
        })
        .catch(reason => {
            logger.error(reason);
            res.sendStatus(500);
        });
});

// returns all studies if you are admin
app.get(AllStudies.getURL, (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

    const authenticated = checkTokenValidityFromRequest(req);
    if (authenticated === false) {
        return res.sendStatus(401);
    } else if (!authenticated.user.admin) {
        return res.sendStatus(403);
    }

    studyRepository
        .find({
            relations: ["topTopic"]
        })
        .then(value => {
            res.json(new GetStudiesCallback(value));
        })
        .catch(reason => {
            logger.error(reason);
            res.sendStatus(500);
        });
});

app.post(CreateStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);
    const topicRepository = getRepository(Topic);
    const createStudiesRequest: CreateStudies = req.body as CreateStudies;

    const authenticated = checkTokenValidityFromRequest(req);
    if (authenticated === false) {
        return res.sendStatus(401);
    } else if (!authenticated.user.admin) {
        return res.sendStatus(403);
    }

    if (createStudiesRequest.name.length < 3 || createStudiesRequest.name.length > 20){
        return res.status(409).json(new ServerError("Invalid length"));
    }



    try {
        const topic = await topicRepository.save({
            name: createStudiesRequest.name,
            hash: await generateRandomTopicHash(),
            parent: null
        });

        const study = await studyRepository.save({
            name: createStudiesRequest.name,
            topTopic: topic,
            hidden: createStudiesRequest.hidden
        });

        return res.status(201).json(new CreateStudiesCallback(study));
    } catch (e) {
        return res.sendStatus(500);
    }
});

app.post(HideStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);
    const hideStudiesRequest: HideStudies = req.body as HideStudies;

    const authenticated = checkTokenValidityFromRequest(req);
    if (authenticated === false) {
        return res.sendStatus(401);
    } else if (!authenticated.user.admin) {
        return res.sendStatus(403);
    }

    const visible = await studyRepository.find({ hidden: false })

    try {
        if (visible.length == 1 && visible[0].id === hideStudiesRequest.study.id){
            return res
                .status(409)
                .json(new ServerError("You may not hide the last visible study! There must always be one visible study"));
        }
        await studyRepository.update(hideStudiesRequest.study.id, { hidden: true });
    } catch (e) {
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
});

app.post(UnhideStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

    const hideStudiesRequest: HideStudies = req.body as HideStudies;
    try {
        const authenticated = checkTokenValidityFromRequest(req);
        if (authenticated === false) {
            return res.sendStatus(401);
        } else if (!authenticated.user.admin) {
            return res.sendStatus(403);
        }

        await studyRepository.update(hideStudiesRequest.study.id, { hidden: false });
    } catch (err) {
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
});

app.post(RenameStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);
    const renameStudiesRequest: HideStudies = req.body as HideStudies;

    const authenticated = checkTokenValidityFromRequest(req);
    if (authenticated === false) {
        return res.sendStatus(401);
    } else if (!authenticated.user.admin) {
        return res.sendStatus(403);
    }

    try {
        if (renameStudiesRequest.study.name.length > 20) {
            return res.sendStatus(406);
        }

        await studyRepository.update(renameStudiesRequest.study.id, { name: renameStudiesRequest.study.name });
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }
    return res.sendStatus(201);
});

import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { app } from "../../";

import {
    GetStudiesCallback,
    Studies,
    AllStudies,
    GetAllStudiesCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
import { HideStudies, UnhideStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/HideStudies";
import { RenameStudies } from "../../../../cshub-shared/src/api-calls/endpoints/study/RenameStudies";
import {
    CreateStudies,
    CreateStudiesCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/study/CreateStudies";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Study } from "../../db/entities/study";
import logger from "../../utilities/Logger";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { Topic } from "../../db/entities/topic";
import { generateRandomTopicHash } from "../../utilities/TopicsUtils";
import { AlreadySentError } from "../utils";
import { CacheVersion } from "../../db/entities/cacheversion";
import { query } from "../../db/database-query";

// returns only the visible studies (hidden==false)
app.get(Studies.getURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

    let version = -1;
    const versionHeader = req.header(Studies.studiesVersionHeader);
    if (versionHeader) {
        version = +versionHeader;
        logger.info("Received StudyVersion: " + version);
    }

    const repository = getRepository(CacheVersion);

    const versionData = await repository.findOne({
        where: {
            type: "STUDIES"
        }
    });

    if (!versionData) {
        const cacheVersion = new CacheVersion();
        cacheVersion.version = 0;
        cacheVersion.type = "STUDIES";
        repository.save(cacheVersion);
    } else if (versionData && versionData.version === version) {
        res.status(304).send();
        return;
    }

    studyRepository
        .find({
            where: {
                hidden: false
            },
            relations: ["topTopic"]
        })
        .then(value => {
            res.json(new GetStudiesCallback(versionData ? versionData.version : 0, value));
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
            res.json(new GetAllStudiesCallback(value));
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

    if (createStudiesRequest.name.length < 3 || createStudiesRequest.name.length > 20) {
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

        await query(`
            UPDATE cacheversion
            SET version = version + 1
            WHERE type = 'STUDIES'
        `);

        return res.status(201).json(new CreateStudiesCallback(study));
    } catch (e) {
        return res.sendStatus(500);
    }
});

app.put(HideStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

    const visible = await studyRepository.find({ hidden: false });

    try {
        const id = checkRequest(req, res);

        if (visible.length == 1 && visible[0].id === id) {
            res.status(400).json(
                new ServerError("You may not hide the last visible study! There must always be one visible study")
            );
            return;
        }

        await studyRepository.update(id, { hidden: true });

        await query(`
            UPDATE cacheversion
            SET version = version + 1
            WHERE type = 'STUDIES'
        `);

        res.sendStatus(201);
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            logger.error(err);
            res.sendStatus(500);
        }
    }
});

app.put(UnhideStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

    try {
        const id = checkRequest(req, res);

        await studyRepository.update(id, { hidden: false });

        await query(`
            UPDATE cacheversion
            SET version = version + 1
            WHERE type = 'STUDIES'
        `);

        res.sendStatus(201);
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            logger.error(err);
            res.sendStatus(500);
        }
    }
});

app.put(RenameStudies.postURL, async (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);
    const renameStudiesRequest: RenameStudies = req.body as RenameStudies;

    try {
        const id = checkRequest(req, res);

        if (renameStudiesRequest.newName.length > 20) {
            res.status(400).json(new ServerError("Name too long!"));
            return;
        }

        if (renameStudiesRequest.newName.length < 3) {
            res.status(400).json(new ServerError("Name too short!"));
            return;
        }

        await studyRepository.update(id, { name: renameStudiesRequest.newName });

        await query(`
            UPDATE cacheversion
            SET version = version + 1
            WHERE type = 'STUDIES'
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
        res.status(400).json(new ServerError("No valid study id!"));
        throw new AlreadySentError();
    }

    return id;
};

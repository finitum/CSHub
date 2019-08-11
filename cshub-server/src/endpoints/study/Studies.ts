import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { app } from "../../";

import { GetStudiesCallback, Studies } from "../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
import { Study } from "../../db/entities/study";
import logger from "../../utilities/Logger";

app.get(Studies.getURL, (req: Request, res: Response) => {
    const studyRepository = getRepository(Study);

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

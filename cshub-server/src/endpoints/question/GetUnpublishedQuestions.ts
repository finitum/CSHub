import { Request, Response } from "express";

import { app } from "../../";

import { getRepository, In } from "typeorm";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Question } from "../../db/entities/practice/question";
import { getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import {
    GetUnpublishedQuestions,
    GetUnpublishedQuestionsCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/question/GetUnpublishedQuestions";

app.get(GetUnpublishedQuestions.getURL, (req: Request, res: Response) => {
    const studyQueryParam = req.query[GetUnpublishedQuestions.studyQueryParam];
    if (!studyQueryParam) {
        res.status(400).send(new ServerError("Study query param not found", false));
        return;
    }

    getTopicTree(studyQueryParam)
        .then(value => {
            if (value) {
                const childHashes = getChildHashes(value);

                const repository = getRepository(Question);

                repository
                    .find({
                        where: {
                            topicId: In(childHashes)
                        },
                        relations: ["answers"]
                    })
                    .then(questions => {
                        res.json(new GetUnpublishedQuestionsCallback(questions));
                    })
                    .catch(() => {
                        res.status(500).send(new ServerError("Server did oopsie"));
                    });
            }
        })
        .catch(() => {
            res.status(500).send(new ServerError("Server did oopsie"));
        });
});

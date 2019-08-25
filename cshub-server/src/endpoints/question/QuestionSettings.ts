import { app } from "../../";
import { Request, Response } from "express";
import { hasAccessToTopicRequest } from "../../auth/validateRights/PostAccess";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import {
    QuestionSettings,
    QuestionSettingsEditType
} from "../../../../cshub-shared/src/api-calls/endpoints/question/QuestionSettings";
import { AlreadySentError } from "../utils";
import { getRepository } from "typeorm";
import { Question } from "../../db/entities/practice/question";

app.put(QuestionSettings.getURL, async (req: Request, res: Response) => {
    const questionId: number = +req.params.id;
    const action: string = req.params.action;

    if (typeof action === "undefined" || isNaN(questionId)) {
        res.sendStatus(400);
        return;
    }

    const questionRepository = getRepository(Question);

    const question = await questionRepository.findOne({
        where: {
            id: questionId
        },
        relations: ["topic", "replacesQuestion"]
    });

    if (question === undefined) {
        res.sendStatus(404);
        throw new AlreadySentError();
    }

    const access = await hasAccessToTopicRequest(question.topic.hash, req);

    switch (action) {
        case QuestionSettingsEditType[QuestionSettingsEditType.APPROVE].toLowerCase():
            if (access.canSave) {
                await questionRepository
                    .createQueryBuilder()
                    .update()
                    .set({
                        active: true,
                        replacesQuestion: undefined
                    })
                    .where("id = :id", { id: questionId })
                    .execute();

                if (question.replacesQuestion) {
                    await questionRepository
                        .createQueryBuilder()
                        .update()
                        .set({
                            active: false,
                            deleted: true
                        })
                        .where("id = :id", { id: question.replacesQuestion.id })
                        .execute();
                }

                res.sendStatus(201);
            } else {
                res.status(403).send();
            }
            break;
        case QuestionSettingsEditType[QuestionSettingsEditType.DELETE].toLowerCase():
            if (access.canSave) {
                questionRepository
                    .createQueryBuilder()
                    .update()
                    .set({
                        active: false,
                        deleted: true
                    })
                    .where("id = :id", { id: questionId })
                    .execute();

                res.sendStatus(201);
            } else {
                res.status(403).send();
            }
            break;
        default:
            res.status(400).json(new ServerError("Did not understand the PostSettingsEditType"));
    }
});

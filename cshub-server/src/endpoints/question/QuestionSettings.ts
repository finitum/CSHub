import { app } from "../../";
import { Request, Response } from "express";
import { DatabaseResultSet, query } from "../../db/database-query";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { PostSettings, PostSettingsCallback, PostSettingsEditType } from "../../../../cshub-shared/src/api-calls";
import { hasAccessToPostRequest, hasAccessToTopicRequest } from "../../auth/validateRights/PostAccess";
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

    questionRepository
        .findOne({
            where: {
                id: questionId
            },
            relations: ["topic"]
        })
        .then(question => {
            if (question === undefined) {
                res.sendStatus(404);
                throw new AlreadySentError();
            }

            return hasAccessToTopicRequest(question.topic.hash, req);
        })
        .then(topicAccess => {
            switch (action) {
                case QuestionSettingsEditType[QuestionSettingsEditType.APPROVE].toLowerCase():
                    if (topicAccess.canSave) {
                        questionRepository
                            .createQueryBuilder()
                            .update()
                            .set({
                                active: true
                            })
                            .where("id = :id", { id: questionId })
                            .execute();
                    } else {
                        res.status(403).send();
                    }
                    break;
                case QuestionSettingsEditType[QuestionSettingsEditType.DELETE].toLowerCase():
                    if (topicAccess.canSave) {
                        questionRepository
                            .createQueryBuilder()
                            .update()
                            .set({
                                active: false
                            })
                            .where("id = :id", { id: questionId })
                            .execute();
                    } else {
                        res.status(403).send();
                    }
                    break;
                default:
                    res.status(400).json(new ServerError("Did not understand the PostSettingsEditType"));
            }
        })
        .catch(err => {
            if (!(err instanceof AlreadySentError)) {
                res.status(500).send(new ServerError("Server die oopsie"));
            }
        });
});

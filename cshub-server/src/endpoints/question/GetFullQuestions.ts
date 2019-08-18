import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { getRepository, In } from "typeorm";
import { FullAnswerType, GetQuestions } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Question } from "../../db/entities/practice/question";
import { findTopicInTree, getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import {
    GetFullQuestions,
    GetFullQuestionsCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/question/GetFullQuestions";
import { parseAndValidateQuestion } from "./QuestionUtils";

app.get(GetFullQuestions.getURL, (req: Request, res: Response) => {
    const topicQueryParam = req.query[GetQuestions.topicQueryParam];
    if (!topicQueryParam) {
        res.status(400).send(new ServerError("Topic query param not found", false));
        return;
    }

    const topicHash = +topicQueryParam;
    logger.info("Received Topic: " + topicHash);

    getTopicTree()
        .then(value => {
            if (value) {
                const topic = findTopicInTree(topicHash, value);

                if (topic) {
                    const childHashes = getChildHashes([topic]);

                    const repository = getRepository(Question);

                    repository
                        .find({
                            where: {
                                topicId: In(childHashes)
                            },
                            relations: ["answers"]
                        })
                        .then(questions => {
                            res.json(
                                new GetFullQuestionsCallback(
                                    questions.map(question => parseAndValidateQuestion(question, res))
                                )
                            );
                        })
                        .catch(err => {
                            logger.error(err);
                            res.status(500).send(new ServerError("Server did oopsie"));
                        });
                } else {
                    res.status(404).send(new ServerError("Topic not found"));
                    return;
                }
            }
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send(new ServerError("Server did oopsie"));
        });
});

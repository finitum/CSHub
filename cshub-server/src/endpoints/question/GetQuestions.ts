import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { getRepository, In } from "typeorm";
import {
    GetQuestions,
    GetQuestionsCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/question/GetQuestions";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Question } from "../../db/entities/practice/question";
import { findTopicInTree, getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";

app.get(GetQuestions.getURL, (req: Request, res: Response) => {
    const topicQueryParam = req.query[GetQuestions.topicQueryParam];
    if (!topicQueryParam) {
        res.status(400).send(new ServerError("Topic query param not found", false));
        return;
    }

    const topicHash = +topicQueryParam;
    logger.info("Received Topic: " + topicHash);

    let amount = 15;
    const amountQueryParam = req.query[GetQuestions.questionAmountQueryParam];
    if (amountQueryParam) {
        amount = +amountQueryParam;
        logger.info("Amount of questions: " + amountQueryParam);

        if (amount > 50) {
            res.status(400).send(new ServerError("No more than 50 questions bruh", false));
            return;
        }
    }

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
                            res.json(new GetQuestionsCallback(questions));
                        })
                        .catch(() => {
                            res.status(500).send(new ServerError("Server did oopsie"));
                        });
                } else {
                    res.status(404).send(new ServerError("Topic not found"));
                    return;
                }
            }
        })
        .catch(() => {
            res.status(500).send(new ServerError("Server did oopsie"));
        });
});

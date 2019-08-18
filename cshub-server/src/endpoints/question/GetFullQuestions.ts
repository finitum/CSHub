import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { getRepository, In } from "typeorm";
import { FullAnswerType, GetQuestions } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Question } from "../../db/entities/practice/question";
import { findTopicInTree, getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import {
    FullQuestionWithId,
    GetFullQuestions,
    GetFullQuestionsCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/question/GetFullQuestions";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import { ClosedAnswer } from "../../db/entities/practice/closed-answer";
import { OpenNumberAnswer } from "../../db/entities/practice/open-number-answer";
import { OpenTextAnswer } from "../../db/entities/practice/open-text-answer";

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
                                    questions.map(question => {
                                        let answerType: FullAnswerType;

                                        switch (question.type) {
                                            case QuestionType.SINGLECLOSED:
                                            case QuestionType.MULTICLOSED:
                                                answerType = {
                                                    type: question.type,
                                                    answers: question.answers.map(answer => {
                                                        const answerCast = answer as ClosedAnswer;
                                                        return {
                                                            answerText: answerCast.closedAnswerText,
                                                            correct: answerCast.correct
                                                        };
                                                    })
                                                };
                                                break;
                                            case QuestionType.OPENNUMBER:
                                                const openNumber = question.answers[0] as OpenNumberAnswer;
                                                answerType = {
                                                    type: QuestionType.OPENNUMBER,
                                                    number: openNumber.openAnswerNumber,
                                                    precision: openNumber.precision
                                                };
                                                break;
                                            case QuestionType.OPENTEXT:
                                                const openText = question.answers[0] as OpenTextAnswer;
                                                answerType = {
                                                    type: QuestionType.OPENTEXT,
                                                    answer: openText.openAnswerText
                                                };
                                                break;
                                            default:
                                                throw new Error("");
                                        }

                                        const fullQuestion: FullQuestionWithId = {
                                            id: question.id,
                                            question: question.question,
                                            explanation: question.explanation,
                                            ...answerType
                                        };

                                        return fullQuestion;
                                    })
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

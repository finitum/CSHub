import { app } from "../../index";
import { Request, Response } from "express";
import {
    GetFullQuestion,
    GetFullQuestionCallback,
    GetQuestion,
    GetQuestionCallback
} from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import logger from "../../utilities/Logger";
import { getRepository } from "typeorm";
import { Question } from "../../db/entities/practice/question";
import { parseAndValidateQuestion } from "./QuestionUtils";
import {
    PracticeAnswerType,
    PracticeQuestion
} from "../../../../cshub-shared/src/api-calls/endpoints/question/models/PracticeQuestion";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import { AlreadySentError } from "../utils";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";

app.get(GetFullQuestion.getURL, (req: Request, res: Response) => {
    const questionId = Number(req.params.id);
    if (isNaN(questionId)) {
        res.status(400).json(new ServerError("Invalid question id!"));
    }

    const tokenResult = checkTokenValidityFromRequest(req);
    if (!tokenResult) {
        res.sendStatus(401);
    }

    const repository = getRepository(Question);

    repository
        .findOne({
            where: {
                id: questionId,
                deleted: false
            },
            relations: ["answers"]
        })
        .then(question => {
            if (question) {
                res.json(new GetFullQuestionCallback(parseAndValidateQuestion(question, res)));
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send(new ServerError("Server did oopsie"));
        });
});

app.get(GetQuestion.getURL, (req: Request, res: Response) => {
    const questionId = Number(req.params.id);
    if (isNaN(questionId)) {
        res.status(400).json(new ServerError("Invalid question id!"));
    }

    const repository = getRepository(Question);

    repository
        .findOne({
            where: {
                id: questionId,
                deleted: false
            },
            relations: ["answers"]
        })
        .then(question => {
            if (question) {
                const parsedQuestion = parseAndValidateQuestion(question, res);

                let strippedAnswer: PracticeAnswerType;
                switch (parsedQuestion.type) {
                    case QuestionType.MULTICLOSED:
                    case QuestionType.SINGLECLOSED:
                        strippedAnswer = {
                            type: parsedQuestion.type,
                            answers: parsedQuestion.answers.map(parsedAnswer => {
                                return {
                                    answer: parsedAnswer.answerText,
                                    id: parsedAnswer.answerId
                                };
                            })
                        };
                        break;
                    case QuestionType.OPENNUMBER:
                    case QuestionType.OPENTEXT:
                        strippedAnswer = {
                            type: parsedQuestion.type
                        };
                        break;
                    default:
                        logger.error("Missing switch case");
                        res.status(500).send();
                        throw new AlreadySentError();
                }

                const strippedQuestion: PracticeQuestion = {
                    id: parsedQuestion.id,
                    question: parsedQuestion.question,
                    ...strippedAnswer
                };

                res.json(new GetQuestionCallback(strippedQuestion));
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => {
            logger.error(err);
            res.status(500).send(new ServerError("Server did oopsie"));
        });
});

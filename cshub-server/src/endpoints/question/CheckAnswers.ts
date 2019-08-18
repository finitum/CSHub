import { Request, Response } from "express";

import { app } from "../../";

import { getRepository, In } from "typeorm";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import {
    CheckAnswers,
    CheckAnswersCallback,
    CheckAnswerType,
    CheckedAnswerType
} from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { Question } from "../../db/entities/practice/question";
import logger from "../../utilities/Logger";
import { AlreadySentError } from "../utils";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import { ClosedAnswer } from "../../db/entities/practice/closed-answer";
import { parseAndValidateQuestion } from "./QuestionUtils";

app.post(CheckAnswers.getURL, (req: Request, res: Response) => {
    const checkAnswers = req.body as CheckAnswers;

    if (checkAnswers.answers.length === 0) {
        res.status(400).send(new ServerError("No answers :("));
        return;
    }

    function checkClosedQuestion(clientAnswer: CheckAnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === question.type) {
            const parsedQuestion = parseAndValidateQuestion(question, res);

            if (parsedQuestion.type !== QuestionType.SINGLECLOSED && parsedQuestion.type !== QuestionType.MULTICLOSED) {
                logger.error("Incompatible types!");
                res.sendStatus(500);
                throw new AlreadySentError();
            }

            const correctAnswers = (question.answers as ClosedAnswer[])
                .filter(answer => answer.correct)
                .map(answer => answer.id);

            let sharedPart = {
                questionId: question.id,
                answer: clientAnswer,
                explanation: question.explanation
            };

            if (clientAnswer.type === QuestionType.SINGLECLOSED && question.type === QuestionType.SINGLECLOSED) {
                const userAnswer = clientAnswer.answerId;

                return {
                    ...sharedPart,
                    correctAnswer: {
                        type: QuestionType.SINGLECLOSED,
                        answerId: correctAnswers[0]
                    },
                    correct: userAnswer === correctAnswers[0]
                };
            } else if (clientAnswer.type === QuestionType.MULTICLOSED && question.type === QuestionType.MULTICLOSED) {
                const userAnswers = clientAnswer.answerIds;

                return {
                    ...sharedPart,
                    correctAnswer: {
                        type: QuestionType.MULTICLOSED,
                        answerIds: correctAnswers
                    },
                    correct:
                        userAnswers.length === correctAnswers.length && // if the length is the same and every correct answer is found in the user's answers, it's correct
                        correctAnswers.every(correctAnswer => userAnswers.includes(correctAnswer))
                };
            } else {
                res.status(400).send(new ServerError("Uuuh we don't agree on the amount of answers!"));
                throw new AlreadySentError();
            }
        } else {
            res.status(400).send(new ServerError("This answer shouldn't be a list of ids!"));
            throw new AlreadySentError();
        }
    }

    function checkOpenNumberQuestion(clientAnswer: CheckAnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === QuestionType.OPENNUMBER) {
            const parsedQuestion = parseAndValidateQuestion(question, res);

            if (parsedQuestion.type !== QuestionType.OPENNUMBER) {
                logger.error("Incompatible types!");
                res.sendStatus(500);
                throw new AlreadySentError();
            }

            const precision = parsedQuestion.precision;

            const correctAnswerRounded = parsedQuestion.number.toPrecision(precision);
            const userAnswerRounded = clientAnswer.number.toPrecision(precision);

            return {
                questionId: question.id,
                answer: clientAnswer,
                correctAnswer: {
                    type: QuestionType.OPENNUMBER,
                    number: parsedQuestion.number
                },
                correct: correctAnswerRounded === userAnswerRounded,
                explanation: question.explanation
            };
        } else {
            res.status(400).send(new ServerError("This answer shouldn't be a number!"));
            throw new AlreadySentError();
        }
    }

    function checkOpenTextQuestion(clientAnswer: CheckAnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === QuestionType.OPENTEXT) {
            const parsedQuestion = parseAndValidateQuestion(question, res);

            if (parsedQuestion.type !== QuestionType.OPENTEXT) {
                logger.error("Incompatible types!");
                res.sendStatus(500);
                throw new AlreadySentError();
            }

            return {
                questionId: question.id,
                answer: clientAnswer,
                correctAnswer: {
                    type: QuestionType.OPENTEXT,
                    text: parsedQuestion.answer
                },
                correct: null,
                explanation: question.explanation
            };
        } else {
            res.status(400).send(new ServerError("This answer shouldn't be a string!"));
            throw new AlreadySentError();
        }
    }

    const parseAnswer = (question: Question, clientAnswer: CheckAnswerType): CheckedAnswerType => {
        const questionParsed = parseAndValidateQuestion(question, res);

        switch (question.type) {
            case QuestionType.SINGLECLOSED:
            case QuestionType.MULTICLOSED:
                return checkClosedQuestion(clientAnswer, question);
            case QuestionType.OPENNUMBER:
                return checkOpenNumberQuestion(clientAnswer, question);
            case QuestionType.OPENTEXT:
                return checkOpenTextQuestion(clientAnswer, question);
        }
    };

    const questionIds = checkAnswers.answers.map(answer => answer.questionId);

    const repository = getRepository(Question);

    repository
        .find({
            where: {
                id: In(questionIds)
            },
            relations: ["answers"]
        })
        .then(questions => {
            res.json(
                new CheckAnswersCallback(
                    questions.map(question => {
                        const clientAnswer = checkAnswers.answers.find(answer => answer.questionId === question.id);

                        if (!clientAnswer) {
                            logger.error(`First we had an answer, now we dont?`);
                            logger.error(question);
                            logger.error(checkAnswers.answers);
                            res.status(500).send();
                            throw new AlreadySentError();
                        }

                        return parseAnswer(question, clientAnswer.answer);
                    })
                )
            );
        })
        .catch(err => {
            if (!(err instanceof AlreadySentError)) {
                res.status(500).send(new ServerError("Server did oopsie"));
            }
        });
});

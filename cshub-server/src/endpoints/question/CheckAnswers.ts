import { Request, Response } from "express";

import { app } from "../../";

import { getRepository, In } from "typeorm";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import {
    AnswerType,
    CheckAnswers,
    CheckAnswersCallback,
    CheckedAnswerType
} from "../../../../cshub-shared/src/api-calls/endpoints/question/CheckAnswers";
import { Question, QuestionType } from "../../db/entities/question";
import logger from "../../utilities/Logger";
import { AlreadySentError } from "../utils";

app.post(CheckAnswers.getURL, (req: Request, res: Response) => {
    const checkAnswers = req.body as CheckAnswers;

    if (checkAnswers.answers.length === 0) {
        res.status(400).send(new ServerError("No answers :("));
        return;
    }

    function checkClosedQuestion(clientAnswer: AnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === QuestionType.CLOSED) {
            if (question.answers.length === 0) {
                logger.error(`No answers found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const correctAnswers = question.answers
                .filter(answer => {
                    const correctAnswer = answer.correct;
                    if (correctAnswer === undefined) {
                        logger.error(`Don't know if answer ${answer.id} is correct`);
                        res.status(500).send();
                        throw new AlreadySentError();
                    }

                    return correctAnswer;
                })
                .map(answer => answer.id);

            let sharedPart = {
                questionId: question.id,
                answer: clientAnswer,
                explanation: question.explanation
            };

            if (clientAnswer.onlyOneAnswer && question.onlyOneAnswer) {
                const userAnswer = clientAnswer.answerId;

                if (correctAnswers.length !== 1) {
                    logger.error(`Not just 1 answer for ${question.id}`);
                    res.status(500).send();
                    throw new AlreadySentError();
                }

                return {
                    ...sharedPart,
                    correctAnswer: {
                        type: QuestionType.CLOSED,
                        onlyOneAnswer: true,
                        answerId: correctAnswers[0]
                    },
                    correct: userAnswer === correctAnswers[0]
                };
            } else if (!clientAnswer.onlyOneAnswer && !question.onlyOneAnswer) {
                const userAnswers = clientAnswer.answerIds;

                return {
                    ...sharedPart,
                    correctAnswer: {
                        type: QuestionType.CLOSED,
                        onlyOneAnswer: false,
                        answerIds: correctAnswers
                    },
                    correct: correctAnswers.every(correctAnswer => userAnswers.includes(correctAnswer))
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

    function checkOpenTextQuestion(clientAnswer: AnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === QuestionType.OPENNUMBER) {
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const correctAnswer = question.answers[0].openAnswerNumber;
            const precision = question.answers[0].precision;
            if (!correctAnswer || !precision) {
                logger.error(`No precision or answer number found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const correctAnswerRounded = correctAnswer.toPrecision(precision);
            const userAnswerRounded = clientAnswer.number.toPrecision(precision);

            return {
                questionId: question.id,
                answer: clientAnswer,
                correctAnswer: {
                    type: QuestionType.OPENNUMBER,
                    number: correctAnswer
                },
                correct: correctAnswerRounded === userAnswerRounded,
                explanation: question.explanation
            };
        } else {
            res.status(400).send(new ServerError("This answer shouldn't be a number!"));
            throw new AlreadySentError();
        }
    }

    function checkOpenNumberQuestion(clientAnswer: AnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === QuestionType.OPENTEXT) {
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const correctAnswer = question.answers[0].openAnswerText;
            if (!correctAnswer) {
                logger.error(`No answer text found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            return {
                questionId: question.id,
                answer: clientAnswer,
                correctAnswer: {
                    type: QuestionType.OPENTEXT,
                    text: correctAnswer
                },
                correct: null,
                explanation: question.explanation
            };
        } else {
            res.status(400).send(new ServerError("This answer shouldn't be a string!"));
            throw new AlreadySentError();
        }
    }

    const parseAnswer = (question: Question, clientAnswer: AnswerType): CheckedAnswerType => {
        switch (question.questionType) {
            case QuestionType.CLOSED:
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

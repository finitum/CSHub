import { Request, Response } from "express";

import { app } from "../../";

import { getRepository, In } from "typeorm";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import {
    CheckAnswers,
    CheckAnswersCallback,
    CheckAnswerType,
    CheckedAnswerType
} from "../../../../cshub-shared/src/api-calls/endpoints/question/CheckAnswers";
import { Question } from "../../db/entities/practice/question";
import logger from "../../utilities/Logger";
import { AlreadySentError } from "../utils";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import { ClosedAnswer } from "../../db/entities/practice/closed-answer";
import { OpenTextAnswer } from "../../db/entities/practice/open-text-answer";
import { OpenNumberAnswer } from "../../db/entities/practice/open-number-answer";

app.post(CheckAnswers.getURL, (req: Request, res: Response) => {
    const checkAnswers = req.body as CheckAnswers;

    if (checkAnswers.answers.length === 0) {
        res.status(400).send(new ServerError("No answers :("));
        return;
    }

    function checkClosedQuestion(clientAnswer: CheckAnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === question.questionType) {
            if (question.answers.length === 0) {
                logger.error(`No answers found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!(question.answers[0] instanceof ClosedAnswer)) {
                logger.error(`Wrong answer type for answerid ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const correctAnswers = (question.answers as ClosedAnswer[])
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

            if (
                clientAnswer.type === QuestionType.SINGLECLOSED &&
                question.questionType === QuestionType.SINGLECLOSED
            ) {
                const userAnswer = clientAnswer.answerId;

                if (correctAnswers.length !== 1) {
                    logger.error(`Not just 1 answer for ${question.id}`);
                    res.status(500).send();
                    throw new AlreadySentError();
                }

                return {
                    ...sharedPart,
                    correctAnswer: {
                        type: QuestionType.SINGLECLOSED,
                        answerId: correctAnswers[0]
                    },
                    correct: userAnswer === correctAnswers[0]
                };
            } else if (
                clientAnswer.type === QuestionType.MULTICLOSED &&
                question.questionType === QuestionType.MULTICLOSED
            ) {
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
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!(question.answers[0] instanceof OpenNumberAnswer)) {
                logger.error(`Wrong answer type for answerid ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const answers = question.answers as OpenNumberAnswer[];

            const correctAnswer = answers[0].openAnswerNumber;
            const precision = answers[0].precision;
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

    function checkOpenTextQuestion(clientAnswer: CheckAnswerType, question: Question): CheckedAnswerType {
        if (clientAnswer.type === QuestionType.OPENTEXT) {
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!(question.answers[0] instanceof OpenTextAnswer)) {
                logger.error(`Wrong answer type for answerid ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const correctAnswer = (question.answers as OpenTextAnswer[])[0].openAnswerText;
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

    const parseAnswer = (question: Question, clientAnswer: CheckAnswerType): CheckedAnswerType => {
        switch (question.questionType) {
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

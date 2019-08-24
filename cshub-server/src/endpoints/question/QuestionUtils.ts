import { getRepository } from "typeorm";
import { Question } from "../../db/entities/practice/question";
import { hasAccessToTopicRequest } from "../../auth/validateRights/PostAccess";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { AlreadySentError } from "../utils";
import { findTopicInTree, getTopicTree } from "../../utilities/TopicsUtils";
import { QuestionType } from "../../../../cshub-shared/src/entities/question";
import { ClosedAnswer } from "../../db/entities/practice/closed-answer";
import { OpenNumberAnswer } from "../../db/entities/practice/open-number-answer";
import { OpenTextAnswer } from "../../db/entities/practice/open-text-answer";
import logger from "../../utilities/Logger";
import { Request, Response } from "express";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import {
    FullAnswerType,
    FullQuestion,
    FullQuestionWithId
} from "../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";

export const parseAndValidateQuestion = (question: Question, res: Response): FullQuestionWithId => {
    let answerType: FullAnswerType;
    switch (question.type) {
        case QuestionType.SINGLECLOSED:
        case QuestionType.MULTICLOSED:
            if (question.answers.length === 0) {
                logger.error(`No answers found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!question.answers[0].isClosedAnswer()) {
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

            if (question.type === QuestionType.SINGLECLOSED) {
                if (correctAnswers.length !== 1) {
                    logger.error(`Not just 1 answer for ${question.id}`);
                    res.status(500).send();
                    throw new AlreadySentError();
                }
            }

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
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!question.answers[0].isOpenNumberAnswer()) {
                logger.error(`Wrong answer type for answerid ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const answers = question.answers as OpenNumberAnswer[];

            const openAnswerNumber = answers[0].openAnswerNumber;
            const precision = answers[0].precision;
            if (!openAnswerNumber || !precision) {
                logger.error(`No precision or answer number found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            answerType = {
                type: QuestionType.OPENNUMBER,
                number: openAnswerNumber,
                precision: precision
            };
            break;
        case QuestionType.OPENTEXT:
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!question.answers[0].isOpenTextAnswer()) {
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

            const openText = question.answers[0] as OpenTextAnswer;
            answerType = {
                type: QuestionType.OPENTEXT,
                answer: openText.openAnswerText
            };
            break;
        default:
            logger.error("Missing switch case");
            res.status(500).send();
            throw new AlreadySentError();
    }

    return {
        id: question.id,
        question: question.question,
        explanation: question.explanation,
        ...answerType
    };
};

export const validateNewQuestion = (question: FullQuestion, res: Response) => {
    const questionValidation = validateMultipleInputs(
        {
            input: question.question
        },
        {
            input: question.explanation
        }
    );

    if (!questionValidation.valid) {
        res.sendStatus(400);
        throw new AlreadySentError();
    }

    let hasError = false;

    switch (question.type) {
        case QuestionType.SINGLECLOSED:
        case QuestionType.MULTICLOSED:
            for (const answer of question.answers) {
                if (
                    validateMultipleInputs(
                        {
                            input: answer.answerText
                        },
                        {
                            input: answer.correct
                        }
                    ).error
                ) {
                    hasError = true;
                    break;
                }
            }

            if (question.type === QuestionType.SINGLECLOSED) {
                hasError = question.answers.filter(answer => answer.correct).length !== 1;
            }

            break;
        case QuestionType.OPENNUMBER:
            hasError = !validateMultipleInputs({ input: question.precision }, { input: question.number }).valid;
            break;
        case QuestionType.OPENTEXT:
            hasError = !validateMultipleInputs({ input: question.answer }).valid;
            break;
    }

    if (hasError) {
        res.sendStatus(400);
        throw new AlreadySentError();
    }
};

export const insertQuestions = (
    questions:
        | FullQuestion[]
        | {
              editedQuestion: FullQuestion;
              originalId: number;
          },
    topicHash: number,
    req: Request,
    res: Response
) => {
    const repository = getRepository(Question);

    hasAccessToTopicRequest(topicHash, req)
        .then(access => {
            if (!access.canEdit) {
                res.status(403).send(new ServerError("Naaah"));
                throw new AlreadySentError();
            }
        })
        .then(() => {
            return getTopicTree();
        })
        .then(topics => {
            if (topics) {
                const foundTopic = findTopicInTree(topicHash, topics);
                if (foundTopic) {
                    return foundTopic;
                } else {
                    res.status(400).send(new ServerError("No such topic"));
                    throw new AlreadySentError();
                }
            } else {
                res.status(500).send(new ServerError("Server did oopsie"));
                throw new AlreadySentError();
            }
        })
        .then(topic => {
            let updateQuestion: false | number = false;

            if (!Array.isArray(questions)) {
                updateQuestion = questions.originalId;
                questions = [questions.editedQuestion];
            }

            const parsedQuestions = questions.map(question => {
                const newQuestion = new Question();
                newQuestion.type = question.type;
                newQuestion.question = question.question;
                newQuestion.topic = topic;
                newQuestion.explanation = question.explanation;

                if (updateQuestion !== false) {
                    newQuestion.replacesQuestionId = updateQuestion;
                }

                newQuestion.answers = [];

                switch (question.type) {
                    case QuestionType.SINGLECLOSED:
                    case QuestionType.MULTICLOSED:
                        for (const answer of question.answers) {
                            newQuestion.answers.push(new ClosedAnswer(answer.answerText, answer.correct));
                        }

                        break;
                    case QuestionType.OPENNUMBER:
                        newQuestion.answers.push(new OpenNumberAnswer(question.number, question.precision));
                        break;
                    case QuestionType.OPENTEXT:
                        newQuestion.answers.push(new OpenTextAnswer(question.answer));
                        break;
                }

                return newQuestion;
            });

            repository.save(parsedQuestions);
            res.json();
        })
        .catch(reason => {
            if (!(reason instanceof AlreadySentError)) {
                logger.error(reason);
                res.status(500).send(new ServerError("Server did oopsie"));
            }
        });
};

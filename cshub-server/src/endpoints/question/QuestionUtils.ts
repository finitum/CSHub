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
import { Topic } from "../../db/entities/topic";
import { DynamicAnswer } from "../../db/entities/practice/dynamic-answer";
import { hasFittingVariables } from "../../../../cshub-shared/src/utilities/DynamicQuestionUtils";
import { Variable } from "../../db/entities/practice/variable";

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
                        correct: answerCast.correct,
                        answerId: answerCast.id
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
            if (openAnswerNumber === null || precision === null) {
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

            if (!(question.answers as OpenTextAnswer[])[0].openAnswerText) {
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
        case QuestionType.DYNAMIC:
            if (question.answers.length !== 1) {
                logger.error(`${question.answers.length} answer(s) found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            if (!question.answers[0].isDynamicAnswer()) {
                logger.error(`Wrong answer type for answerid ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const answer = (question.answers as DynamicAnswer[])[0];
            if (!answer.dynamicAnswerExpression) {
                logger.error(`No answer expression found for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            const dynamicAnswerVariables = answer.dynamicAnswerVariables || [];
            if (
                !hasFittingVariables(
                    question.question,
                    answer.dynamicAnswerExpression,
                    question.explanation,
                    dynamicAnswerVariables
                )
            ) {
                logger.error(`Mismatch in amount of variables for ${question.id}`);
                res.status(500).send();
                throw new AlreadySentError();
            }

            answerType = {
                type: QuestionType.DYNAMIC,
                variableExpressions: dynamicAnswerVariables.map(variable => {
                    return {
                        expression: variable.expression,
                        name: variable.name
                    };
                }),
                answerExpression: answer.dynamicAnswerExpression
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
        replacesQuestion: question.replacesQuestionId,
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
        case QuestionType.DYNAMIC:
            for (const variable of question.variableExpressions) {
                if (
                    validateMultipleInputs({
                        input: variable
                    }).error
                ) {
                    hasError = true;
                    break;
                }
            }

            hasError = !validateMultipleInputs({ input: question.answerExpression }).valid;
            hasError =
                hasError ||
                !hasFittingVariables(
                    question.question,
                    question.answerExpression,
                    question.explanation,
                    question.variableExpressions
                );
            break;
    }

    if (hasError) {
        res.sendStatus(400);
        throw new AlreadySentError();
    }
};

export const insertQuestions = async (
    question: {
        question: FullQuestion;
        originalId?: number;
    },
    req: Request,
    res: Response,
    topicHash?: number
) => {
    const repository = getRepository(Question);

    let updateQuestion: false | Question = false;

    let finalTopicHash: number;
    if (question.originalId) {
        const foundQuestion = await repository.findOne({
            where: {
                id: question.originalId
            },
            relations: ["topic"]
        });

        if (foundQuestion) {
            finalTopicHash = foundQuestion.topic.hash;
            updateQuestion = foundQuestion;
        } else {
            res.sendStatus(404);
            throw new AlreadySentError();
        }
    } else {
        if (!topicHash) {
            res.status(400).send(new ServerError("No such topic"));
            throw new AlreadySentError();
        } else {
            finalTopicHash = topicHash;
        }
    }

    const access = await hasAccessToTopicRequest(finalTopicHash, req);
    if (!access.canEdit) {
        res.status(403).send(new ServerError("Naaah"));
        throw new AlreadySentError();
    }

    const topics = await getTopicTree();

    let topic: Topic;
    if (topics) {
        const foundTopic = findTopicInTree(finalTopicHash, topics);
        if (foundTopic) {
            topic = foundTopic;
        } else {
            res.status(400).send(new ServerError("No such topic"));
            throw new AlreadySentError();
        }
    } else {
        res.status(500).send(new ServerError("Server did oopsie"));
        throw new AlreadySentError();
    }

    let newQuestion = new Question();
    newQuestion.type = question.question.type;
    newQuestion.question = question.question.question;
    newQuestion.topic = topic;
    newQuestion.explanation = question.question.explanation;

    if (updateQuestion !== false) {
        newQuestion.replacesQuestion = updateQuestion;
    }

    newQuestion.answers = [];

    switch (question.question.type) {
        case QuestionType.SINGLECLOSED:
        case QuestionType.MULTICLOSED:
            for (const answer of question.question.answers) {
                newQuestion.answers.push(new ClosedAnswer(answer.answerText, answer.correct));
            }

            break;
        case QuestionType.OPENNUMBER:
            newQuestion.answers.push(new OpenNumberAnswer(question.question.number, question.question.precision));
            break;
        case QuestionType.OPENTEXT:
            newQuestion.answers.push(new OpenTextAnswer(question.question.answer));
            break;
        case QuestionType.DYNAMIC:
            newQuestion.answers.push(
                new DynamicAnswer(
                    question.question.answerExpression,
                    question.question.variableExpressions.map(expression => {
                        const newVariable = new Variable();
                        newVariable.name = expression.name;
                        newVariable.expression = expression.expression;
                        return newVariable;
                    })
                )
            );
            break;
    }

    newQuestion = await repository.save(newQuestion);

    if (newQuestion.type === QuestionType.DYNAMIC) {
        const variableRepository = getRepository(Variable);
        const answer = newQuestion.answers[0];
        const variables = answer.dynamicAnswerVariables || [];
        variables.forEach(variable => (variable.answer = answer));
        await variableRepository.save(variables);
    }

    res.json();
};

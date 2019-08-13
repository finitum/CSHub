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
import {
    AddQuestionsCallback,
    NewQuestion
} from "../../../../cshub-shared/src/api-calls/endpoints/question/AddQuestions";
import logger from "../../utilities/Logger";
import { Request, Response } from "express";
import { validateMultipleInputs } from "../../utilities/StringUtils";

export const validateNewQuestion = (question: NewQuestion, res: Response) => {
    const questionValidation = validateMultipleInputs(
        {
            input: question.question
        },
        {
            input: question.explanation
        },
        {
            input: question.topicHash
        }
    );

    if (!questionValidation.valid) {
        res.status(400).send(new ServerError("Bad input my friend"));
        throw new AlreadySentError();
    }

    let hasError = false;

    switch (question.type) {
        case QuestionType.SINGLECLOSED:
            hasError = validateMultipleInputs({ input: question.answerText }).valid;
            break;
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

            break;
        case QuestionType.OPENNUMBER:
            hasError = validateMultipleInputs({ input: question.precision }, { input: question.number }).valid;
            break;
        case QuestionType.OPENTEXT:
            hasError = validateMultipleInputs({ input: question.answer }).valid;
            break;
    }

    if (hasError) {
        res.status(400).send(new ServerError("Bad input my friend"));
        throw new AlreadySentError();
    }
};

export const insertQuestions = (
    questions:
        | NewQuestion[]
        | {
              editedQuestion: NewQuestion;
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
                newQuestion.questionType = question.type;
                newQuestion.question = question.question;
                newQuestion.topicId = topic.id;
                newQuestion.explanation = question.explanation;

                if (updateQuestion !== false) {
                    newQuestion.replacesQuestionId = updateQuestion;
                }

                switch (question.type) {
                    case QuestionType.SINGLECLOSED:
                        newQuestion.answers = [new ClosedAnswer(question.answerText, true)];
                        break;
                    case QuestionType.MULTICLOSED:
                        newQuestion.answers = [];

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
            res.json(new AddQuestionsCallback());
        })
        .catch(reason => {
            if (!(reason instanceof AlreadySentError)) {
                logger.error(reason);
                res.status(500).send(new ServerError("Server did oopsie"));
            }
        });
};

import { Application, Request, Response } from "express";

import logger from "../../utilities/Logger";

import { getRepository, In } from "typeorm";
import {
    GetEditableQuestions,
    GetQuestions,
    GetQuestionsCallback,
    GetUnpublishedQuestions,
} from "../../../../cshub-shared/src/api-calls/endpoints/question";

import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { Question } from "../../db/entities/practice/question";
import { findTopicInTree, getChildHashes, getTopicTree } from "../../utilities/TopicsUtils";
import { Study } from "../../db/entities/study";
import { parseStringQuery } from "../../utilities/query-parser";

export function registerGetQuestionsEndpoints(app: Application): void {
    app.get(GetQuestions.getURL, (req: Request, res: Response) => {
        const topicQueryParam = parseStringQuery(req, res, GetQuestions.topicQueryParam);
        if (!topicQueryParam) return;
        const topicHash = +topicQueryParam;
        logger.info("Received Topic: " + topicHash);

        let amount: number | undefined;
        const amountQueryParam = req.query[GetQuestions.questionAmountQueryParam];
        if (amountQueryParam) {
            amount = +amountQueryParam;
            logger.info("Amount of questions: " + amountQueryParam);
        }

        getTopicTree()
            .then((value) => {
                if (value) {
                    const topic = findTopicInTree(topicHash, value);

                    if (topic) {
                        const childHashes = getChildHashes([topic]);

                        const repository = getRepository(Question);

                        repository
                            .createQueryBuilder("question")
                            .select("question.id", "id")
                            .leftJoin("question.topic", "topic")
                            .where("topic.hash IN (:...childHashes) AND question.active = 1 AND question.deleted = 0", {
                                childHashes,
                            })
                            .orderBy("RAND()")
                            .take(amount)
                            .getRawMany()
                            .then((questions) => {
                                const parsedQuestions = (questions as { id: number }[]).map((question) => question.id);
                                res.json(new GetQuestionsCallback(parsedQuestions));
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

    app.get(GetEditableQuestions.getURL, async (req: Request, res: Response) => {
        const topicQueryParam = parseStringQuery(req, res, GetQuestions.topicQueryParam);
        if (!topicQueryParam) return;
        const topicHash = +topicQueryParam;

        const topicTree = await getTopicTree();
        if (topicTree) {
            const topic = findTopicInTree(topicHash, topicTree);

            if (topic) {
                const childHashes = getChildHashes([topic]);

                const repository = getRepository(Question);

                repository
                    .createQueryBuilder("question")
                    .select("question.id", "id")
                    .leftJoin("question.topic", "topic")
                    .where("topic.hash IN (:...childHashes)", { childHashes })
                    .andWhere("question.active = 1")
                    .andWhere("question.deleted = 0")
                    .andWhere((qb) => {
                        const subQuery = qb
                            .subQuery()
                            .select("replaceQuestion.replacesQuestionId")
                            .from(Question, "replaceQuestion")
                            .where("replaceQuestion.replacesQuestionId = question.id")
                            .andWhere("replaceQuestion.active = 0")
                            .andWhere("replaceQuestion.deleted = 0")
                            .getQuery();
                        return `NOT EXISTS (${subQuery})`;
                    })
                    .getRawMany()
                    .then((questions) => {
                        res.json(new GetQuestionsCallback(questions.map((question) => question.id)));
                    })
                    .catch(() => {
                        res.status(500).send(new ServerError("Server did oopsie"));
                    });
            }
        }
    });

    app.get(GetUnpublishedQuestions.getURL, async (req: Request, res: Response) => {
        const studyQueryParam = parseStringQuery(req, res, GetUnpublishedQuestions.studyQueryParam);
        if (!studyQueryParam) return;
        const studyId = +studyQueryParam;

        const topicTree = await getTopicTree();
        if (topicTree) {
            const studyRepository = getRepository(Study);

            const study = await studyRepository.findOne({
                where: {
                    id: studyId,
                },
                relations: ["topTopic"],
            });

            if (!study) {
                res.sendStatus(404);
                return;
            }

            const topic = findTopicInTree(study.topTopic.hash, topicTree);

            if (topic) {
                const childHashes = getChildHashes([topic]);

                const repository = getRepository(Question);

                repository
                    .createQueryBuilder("question")
                    .select("question.id", "id")
                    .leftJoin("question.topic", "topic")
                    .where("topic.hash IN (:...childHashes) AND question.active = 0 AND question.deleted = 0", {
                        childHashes,
                    })
                    .getRawMany()
                    .then((questions) => {
                        res.json(new GetQuestionsCallback(questions.map((question) => question.id)));
                    })
                    .catch(() => {
                        res.status(500).send(new ServerError("Server did oopsie"));
                    });
            }
        }
    });
}

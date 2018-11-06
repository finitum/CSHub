import {Request, Response} from "express";

import {app, logger} from "../../";

import {CreateTopicCallback, CreateTopic, CreateTopicResponseTypes} from "../../../../cshub-shared/api-calls";
import {getTopicFromHash} from "../../../../cshub-shared/utilities/Topics";

import {validateMultipleInputs} from "../../utilities/StringUtils";
import {generateRandomTopicHash, getTopicTree} from "../../utilities/TopicsUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.post(CreateTopic.getURL, (req: Request, res: Response) => {

    const submitTopicRequest: CreateTopic = req.body as CreateTopic;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({
        input: submitTopicRequest.topicTitle,
        validationObject: {
            minlength: 2,
            maxlength: 35
        }
    }, {input: submitTopicRequest.topicParentHash});

    if (inputsValidation.valid && userObj.tokenObj.user.admin) {
        const topics = getTopicTree();
        topics
            .then((topics) => {
                if (topics === null) {
                    logger.error(`No topics found`);
                    res.status(500).send();
                } else {
                    const requestTopic = getTopicFromHash(submitTopicRequest.topicParentHash, topics);

                    if (requestTopic === null) {
                        res.json(new CreateTopicCallback(CreateTopicResponseTypes.INVALIDINPUT));
                    } else {
                        query(`
                          SELECT id
                          FROM topics
                          WHERE name = ?
                        `, submitTopicRequest.topicTitle)
                            .then((data: DatabaseResultSet) => {
                                if (data.convertRowsToResultObjects().length !== 0) {
                                    res.json(new CreateTopicCallback(CreateTopicResponseTypes.TITLEALREADYINUSE));
                                } else {
                                    return generateRandomTopicHash();
                                }
                            })
                            .then((topicHash) => {
                                if (typeof topicHash !== "undefined") {
                                    return query(`
                                      INSERT INTO topics
                                      SET name     = ?,
                                          parentid = ?,
                                          hash     = ?
                                    `, submitTopicRequest.topicTitle, requestTopic.id, topicHash)
                                }
                            })
                            .then(() => {
                                return query(`
                                    UPDATE cacheversion
                                    SET version = version + 1
                                    WHERE type = "TOPICS"
                                `)
                            })
                            .then(() => {
                                res.json(new CreateTopicCallback(CreateTopicResponseTypes.SUCCESS));
                            })
                            .catch((err) => {
                                logger.error(`Inserting into db failed`);
                                logger.error(err);
                                res.status(500).send();
                            });
                    }
                }
            });
    } else if (!inputsValidation.valid) {
        res.json(new CreateTopicCallback(CreateTopicResponseTypes.INVALIDINPUT));
    } else if (!userObj.tokenObj.user.admin) {
        res.status(401).send();
    }

});

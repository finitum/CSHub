import {Request, Response} from "express";

import {app, logger} from "../../";

import {SubmitTopicCallback, SubmitTopicRequest, SubmitTopicResponse} from "../../../../cshub-shared/api-calls";
import {getTopicFromHash} from "../../../../cshub-shared/utilities/topics";

import {validateMultipleInputs} from "../../utilities/string-utils";
import {generateRandomTopicHash, getTopicTree} from "../../utilities/topics-utils";
import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {checkTokenValidity} from "../../auth/middleware";

app.post(SubmitTopicRequest.getURL, (req: Request, res: Response) => {

    const submitTopicRequest: SubmitTopicRequest = req.body as SubmitTopicRequest;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({
        input: submitTopicRequest.topicTitle,
        validationObject: {
            minlength: 4,
            maxlength: 127
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
                        res.json(new SubmitTopicCallback(SubmitTopicResponse.INVALIDINPUT));
                    } else {
                        query(`
                          SELECT id
                          FROM topics
                          WHERE name = ?
                        `, submitTopicRequest.topicTitle)
                            .then((data: DatabaseResultSet) => {
                                if (data.convertRowsToResultObjects().length !== 0) {
                                    res.json(new SubmitTopicCallback(SubmitTopicResponse.TITLEALREADYINUSE));
                                } else {
                                    return generateRandomTopicHash();
                                }
                            })
                            .then((topicHash) => {
                                if (topicHash !== undefined) {
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
                                res.json(new SubmitTopicCallback(SubmitTopicResponse.SUCCESS));
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
        res.json(new SubmitTopicCallback(SubmitTopicResponse.INVALIDINPUT));
    } else if (!userObj.tokenObj.user.admin) {
        res.status(401).send();
    }

});

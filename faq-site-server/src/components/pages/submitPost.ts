import {Request, Response} from "express";

import {app, logger} from "../../";

import {SubmitPostCallback, SubmitPostRequest, SubmitPostResponse} from "../../../../faq-site-shared/api-calls";
import {getTopicFromHash} from "../../../../faq-site-shared/utilities/topics";

import {validateMultipleInputs} from "../../utilities/string-utils";
import {generateRandomTopicHash, getTopicTree} from "../../utilities/topics-utils";
import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {checkTokenValidity} from "../../auth/middleware";

app.post(SubmitPostRequest.getURL, (req: Request, res: Response) => {

    const submitPostRequest: SubmitPostRequest = req.body as SubmitPostRequest;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({
        input: submitPostRequest.postTitle,
        validationObject: {
            minlength: 4,
            maxlength: 127
        }
    }, {input: JSON.stringify(submitPostRequest.postBody)}, {input: submitPostRequest.postTopicHash});

    if (inputsValidation.valid && userObj.valid) {
        const topics = getTopicTree();
        topics
            .then((topics) => {
                if (topics === null) {
                    logger.error(`No topics found`);
                    res.status(500).send();
                } else {
                    query(`
                      SELECT id
                      FROM posts
                      WHERE title = ?
                    `, submitPostRequest.postTitle)
                        .then((result: DatabaseResultSet) => {
                            if (result.convertRowsToResultObjects().length === 0) {
                                return generateRandomTopicHash();
                            } else {
                                res.json(new SubmitPostCallback(SubmitPostResponse.TITLEALREADYINUSE));
                            }
                        })
                        .then((topicHash) => {
                            if (topicHash !== undefined) {
                                const requestTopic = getTopicFromHash(submitPostRequest.postTopicHash, topics);

                                query(`
                                  INSERT INTO posts
                                  SET topic  = ?,
                                      author = ?,
                                      title  = ?,
                                      hash   = ?
                                `, requestTopic.id, userObj.tokenObj.user.id, submitPostRequest.postTitle, topicHash)
                                    .then((insertResult: DatabaseResultSet) => {
                                        return query(`
                                          INSERT INTO edits
                                          SET post     = ?,
                                              content  = ?,
                                              editedBy = ?
                                        `, insertResult.getInsertId(), JSON.stringify(submitPostRequest.postBody), userObj.tokenObj.user.id);
                                    })
                                    .then((insertEdit: DatabaseResultSet) => {
                                        res.json(new SubmitPostCallback(SubmitPostResponse.SUCCESS, topicHash));

                                    })
                                    .catch((err) => {
                                        logger.error(`Inserting into db failed`);
                                        logger.error(err);
                                        res.status(500).send();
                                    });
                            }
                        })
                        .catch(err => {
                            logger.error(`Submitting post failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                }
            });
    } else if (!inputsValidation.valid) {
        res.json(new SubmitPostCallback(SubmitPostResponse.INVALIDINPUT));
    } else if (!userObj.valid) {
        res.status(401).send();
    }

});

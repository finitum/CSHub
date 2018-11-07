import {Request, Response} from "express";

import {app, logger} from "../../";

import {CreatePostCallback, CreatePost, SubmitPostResponse} from "../../../../cshub-shared/src/api-calls";
import {getTopicFromHash} from "../../../../cshub-shared/src/utilities/Topics";

import {validateMultipleInputs} from "../../utilities/StringUtils";
import {generateRandomTopicHash, getTopicTree} from "../../utilities/TopicsUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.post(CreatePost.getURL, (req: Request, res: Response) => {

    const submitPostRequest: CreatePost = req.body as CreatePost;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({
        input: submitPostRequest.postTitle,
        validationObject: {
            minlength: 4,
            maxlength: 50
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
                                res.json(new CreatePostCallback(SubmitPostResponse.TITLEALREADYINUSE));
                            }
                        })
                        .then((topicHash) => {
                            if (typeof topicHash !== "undefined") {
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
                                              editedBy = ?,
                                              htmlContent = ?
                                        `, insertResult.getInsertId(), JSON.stringify(submitPostRequest.postBody), userObj.tokenObj.user.id, submitPostRequest.postHTML);
                                    })
                                    .then((insertEdit: DatabaseResultSet) => {
                                        res.json(new CreatePostCallback(SubmitPostResponse.SUCCESS, topicHash));

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
        res.json(new CreatePostCallback(SubmitPostResponse.INVALIDINPUT));
    } else if (!userObj.valid) {
        res.status(401).send();
    }

});

import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {EditPost} from "../../../../cshub-shared/src/api-calls/pages/EditPost";
import {validateMultipleInputs} from "../../utilities/StringUtils";
import Delta from "quill-delta/dist/Delta";
import {getHTMLFromDelta} from "../../utilities/EditsHandler";

app.put(EditPost.getURL, (req: Request, res: Response) => {

    const editPostRequest: EditPost = req.body as EditPost;
    editPostRequest.postHash = req.params.hash;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: editPostRequest.postHash}, {input: editPostRequest.postTitle}, {input: editPostRequest.postTopicHash});

    if (inputsValidation.valid && userObj.valid) {

        const userIsAdmin = userObj.tokenObj.user.admin;

        if (userIsAdmin) {
            return query(`
              SELECT content, approved
              FROM edits
              WHERE post = (
                SELECT id
                FROM posts
                WHERE hash = ?
              )
              ORDER BY datetime ASC
            `, editPostRequest.postHash)
                .then((edits: DatabaseResultSet) => {
                    const rows = edits.convertRowsToResultObjects();
                    const lastRow = rows[rows.length - 1];
                    if (lastRow.getNumberFromDB("approved") !== 0) {
                        res.sendStatus(204);
                    } else {
                        let delta = new Delta(JSON.parse(rows[0].getStringFromDB("content")));

                        for (let i = 1; i < rows.length; i++) {
                            const currRow = rows[i];
                            delta = delta.compose(new Delta(JSON.parse(currRow.getStringFromDB("content"))));
                        }

                        getHTMLFromDelta(delta, (html, indexWords) => {
                            query(`
                              UPDATE edits, posts
                              SET edits.approved    = 1,
                                  edits.approvedBy  = ?,
                                  edits.htmlContent = ?,
                                  edits.indexWords  = ?,
                                  edits.datetime    = NOW(),
                                  posts.postVersion = posts.postVersion + 1,
                                  posts.title       = ?,
                                  posts.topic       = (SELECT id
                                                       FROM topics
                                                       WHERE hash = ?)
                              WHERE edits.post = (
                                SELECT id
                                FROM posts
                                WHERE hash = ?
                              )
                                AND edits.approved = 0
                                AND posts.hash = ?
                              ORDER BY edits.datetime DESC
                              LIMIT 1
                            `, userObj.tokenObj.user.id, html, indexWords, editPostRequest.postTitle, editPostRequest.postTopicHash, editPostRequest.postHash, editPostRequest.postHash)
                                .then(() => {
                                    logger.info("Edited post succesfully");
                                    res.sendStatus(200);
                                });
                        });
                    }
                })
                .catch(err => {
                    logger.error(`Editing failed`);
                    logger.error(err);
                    res.status(500).send();
                });
        } else {
            res.status(401).send();
        }
    }
});

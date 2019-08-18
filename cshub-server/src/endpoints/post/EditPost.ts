import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { DatabaseResultSet, query } from "../../db/database-query";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { EditPost } from "../../../../cshub-shared/src/api-calls";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import Delta from "quill-delta/dist/Delta";
import { getHTMLFromDelta } from "../../utilities/EditsHandler";
import { hasAccessToPostRequest } from "../../auth/validateRights/PostAccess";

app.put(EditPost.getURL, (req: Request, res: Response) => {
    const editPostRequest: EditPost = req.body as EditPost;
    const postHash = req.params.hash;

    const userObj = checkTokenValidityFromRequest(req);

    const inputsValidation = validateMultipleInputs(
        { input: postHash },
        { input: editPostRequest.postTitle },
        { input: editPostRequest.postTopicHash },
        { input: editPostRequest.deleteEdit }
    );

    if (inputsValidation.valid && userObj) {
        const userPostAccessPromise = hasAccessToPostRequest(postHash, req);

        userPostAccessPromise.then(value => {
            if (value.canSave) {
                if (editPostRequest.deleteEdit) {
                    return query(
                        `
                    DELETE T1
                    FROM editusers T1
                             INNER JOIN edits T2 on T1.editsId = T2.id
                    WHERE T2.post = (
                        SELECT id
                        FROM posts
                        WHERE hash = ?
                    )
                      AND T2.approved = 0
                `,
                        postHash
                    )
                        .then(() => {
                            return query(
                                `
                            DELETE
                            FROM edits
                            WHERE post = (
                                SELECT id
                                FROM posts
                                WHERE hash = ?
                            )
                              AND approved = 0
                        `,
                                postHash
                            );
                        })
                        .then((edits: DatabaseResultSet) => {
                            res.sendStatus(200);
                        });
                } else {
                    return query(
                        `
                            SELECT content, approved
                            FROM edits
                            WHERE post = (
                                SELECT id
                                FROM posts
                                WHERE hash = ?
                            )
                            ORDER BY datetime
                        `,
                        postHash
                    )
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
                                    query(
                                        `
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
                                `,
                                        userObj.user.id,
                                        html,
                                        indexWords,
                                        editPostRequest.postTitle,
                                        editPostRequest.postTopicHash,
                                        postHash,
                                        postHash
                                    ).then(() => {
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
                }
            } else {
                res.status(401).send();
            }
        });
    }
});

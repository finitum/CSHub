import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {DatabaseResultSet, query} from "../../db/database-query";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {validateMultipleInputs} from "../../utilities/StringUtils";
import Delta from "quill-delta/dist/Delta";

import {getHTMLFromDelta} from "../../utilities/EditsHandler";
import {ForceEditPost} from "../../../../cshub-shared/src/api-calls";

app.put(ForceEditPost.getURL, (req: Request, res: Response) => {
    const postHash: number = Number(req.params.hash);

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: postHash});

    if (inputsValidation.valid && userObj.valid) {

        const userIsAdmin = userObj.tokenObj.user.admin;

        if (userIsAdmin) {
            return query(`
              SELECT content, approved, id
              FROM edits
              WHERE post = (
                SELECT id
                FROM posts
                WHERE hash = ?
              )
              ORDER BY datetime ASC
            `, postHash)
                .then((edits: DatabaseResultSet) => {
                    const rows = edits.convertRowsToResultObjects();
                    let delta = new Delta(JSON.parse(rows[0].getStringFromDB("content")));
                    let editId: number;

                    for (let i = 1; i < rows.length; i++) {
                        const currRow = rows[i];
                        if (currRow.getNumberFromDB("approved") === 1) {
                            delta = delta.compose(new Delta(JSON.parse(currRow.getStringFromDB("content"))));
                            editId = currRow.getNumberFromDB("id");
                        } else {
                            break;
                        }
                    }

                    getHTMLFromDelta(delta, (html, indexWords) => {
                        query(`
                          UPDATE edits, posts
                          SET edits.htmlContent = ?,
                              edits.indexWords  = ?,
                              posts.postVersion = posts.postVersion + 1
                          WHERE edits.id = ?
                            AND posts.hash = ?
                        `, html, indexWords, editId, postHash)
                            .then(() => {
                                logger.info("Force edit post succesfully");
                                res.sendStatus(200);
                            });
                    });
                })
                .catch(err => {
                    logger.error(`Force editing failed`);
                    logger.error(err);
                    res.status(500).send();
                });
        } else {
            res.sendStatus(401);
        }
    }
});

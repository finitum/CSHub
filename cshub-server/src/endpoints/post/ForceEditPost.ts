import { Application, Request, Response } from "express";

import logger from "../../utilities/Logger";

import { DatabaseResultSet, query } from "../../db/database-query";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import Delta from "quill-delta/dist/Delta";

import { ForceEditPost } from "../../../../cshub-shared/src/api-calls";
import { hasAccessToPostRequest } from "../../auth/validateRights/PostAccess";
import { savePost } from "./EditsHandler";

export function registerForceEditPostEndpoint(app: Application): void {
    app.put(ForceEditPost.getURL, (req: Request, res: Response) => {
        const postHash = Number(req.params.hash);

        const inputsValidation = validateMultipleInputs({ input: postHash });

        if (inputsValidation.valid) {
            hasAccessToPostRequest(postHash, req).then((access) => {
                if (access.canSave) {
                    return query(
                        `
                        SELECT content, approved, id
                        FROM edits
                        WHERE post = (
                            SELECT id
                            FROM posts
                            WHERE hash = ?
                        )
                        ORDER BY datetime
                    `,
                        postHash,
                    )
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

                            savePost(delta).then((htmlAndIndex) => {
                                if (htmlAndIndex.html && htmlAndIndex.indexWords) {
                                    query(
                                        `
                                            UPDATE edits, posts
                                            SET edits.htmlContent = ?,
                                                edits.indexWords  = ?,
                                                posts.postVersion = posts.postVersion + 1
                                            WHERE edits.id = ?
                                              AND posts.hash = ?
                                    `,
                                        htmlAndIndex.html,
                                        htmlAndIndex.indexWords,
                                        editId,
                                        postHash,
                                    ).then(() => {
                                        logger.info("Force edit post succesfully");
                                        res.sendStatus(200);
                                    });
                                }
                            });
                        })
                        .catch((err) => {
                            logger.error(`Force editing failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                } else {
                    res.sendStatus(401);
                }
            });
        } else {
            res.sendStatus(400);
        }
    });
}

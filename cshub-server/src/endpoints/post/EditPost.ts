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
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { getRepository } from "typeorm";
import { Edit } from "../../db/entities/edit";
import { Post } from "../../db/entities/post";

app.put(EditPost.getURL, async (req: Request, res: Response) => {
    const editPostRequest: EditPost = req.body as EditPost;
    const postHash = req.params.hash;

    const userObj = checkTokenValidityFromRequest(req);

    const inputsValidation = validateMultipleInputs(
        { input: postHash },
        { input: editPostRequest.postTitle },
        { input: editPostRequest.postTopicHash },
        { input: editPostRequest.deleteEdit }
    );

    if (!(inputsValidation.valid && userObj)) {
        return res.status(409).json(new ServerError("Invalid request"));
    }

    const userPostAccess = await hasAccessToPostRequest(postHash, req);

    if (!userPostAccess.canSave) {
        return res.sendStatus(401);
    }

    if (editPostRequest.deleteEdit) {
        await query(
            `
            DELETE T1
            FROM editusers T1
                     INNER JOIN edits T2 on T1.edit = T2.id
            WHERE T2.post = (
                SELECT id
                FROM posts
                WHERE hash = ?
            )
              AND T2.approved = 0
        `,
            postHash
        );

        await query(
            `
                    DELETE
                    FROM edits
                    WHERE post = (
D
                        SELECT id
                        FROM posts
                        WHERE hash = ?
                    )
                      AND approved = 0
                `,
            postHash
        );

        return res.sendStatus(200);
    } else {
        const editsRepository = getRepository(Edit);
        const postsRepository = getRepository(Post);
        const post = await postsRepository.find({
            hash: postHash
        });

        try {
            if (post.length == 0) {
                return res.sendStatus(500);
            }

            const edits = (await editsRepository.find({ post: post[0] })).sort(
                (a: Edit, b: Edit) => +a.datetime - +b.datetime
            );

            console.log(edits);

            if (edits[edits.length - 1].approved) {
                return res.sendStatus(204);
            }

            let delta = new Delta(edits[0].content);

            for (let i = 1; i < edits.length; i++) {
                delta = delta.compose(new Delta(edits[i].content));
            }

            getHTMLFromDelta(delta, async (html, indexWords) => {
                await query(
                    `
                            UPDATE edits, posts
                            SET edits.approved    = 1,
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
                    html,
                    indexWords,
                    editPostRequest.postTitle,
                    editPostRequest.postTopicHash,
                    postHash,
                    postHash
                )

                logger.info("Edited post succesfully");
                return res.sendStatus(200);
            });
        } catch (err) {
            logger.error(`Editing failed`);
            logger.error(err);
            return res.sendStatus(500);
        }
    }
});

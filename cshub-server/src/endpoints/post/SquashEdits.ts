import {Request, Response} from "express";
import async from "async";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {SquashEdits} from "../../../../cshub-shared/src/api-calls";
import {DatabaseResultSet, query} from "../../db/database-query";
import {checkTokenValidityFromRequest} from "../../auth/AuthMiddleware";
import {validateMultipleInputs} from "../../utilities/StringUtils";
import {Dayjs} from "dayjs";
import dayjs = require("dayjs");
import Delta = require("quill-delta/dist/Delta");

app.put(SquashEdits.getURL, (req: Request, res: Response) => {

    const squashEditRequest = req.body as SquashEdits;
    const postHash = Number(req.params.hash);

    const userObj = checkTokenValidityFromRequest(req);

    const inputsValidation = validateMultipleInputs({input: postHash}, {input: squashEditRequest.editIds});

    if (inputsValidation.valid && squashEditRequest.editIds.length > 1) {

        if (userObj.valid && userObj.tokenObj.user.admin) {
            logger.info(`Executing squash for post id ${postHash}`);
            query(`
              SELECT content, datetime, T1.id, T2.user
              FROM edits T1
                     LEFT JOIN editusers T2 on T1.id = T2.edit
              WHERE post = (
                SELECT id
                FROM posts
                WHERE hash = ?
              )
                AND approved = 1
              ORDER BY datetime ASC
            `, postHash)
                .then((edits: DatabaseResultSet) => {

                    const dbEdits: Array<{ id: number, datetime: Dayjs, content: Delta, users: number[] }> = [];

                    for (const edit of edits) {
                        const currEdit = dbEdits.find(x => x.id === edit.getNumberFromDB("id"));

                        if (currEdit === null || typeof currEdit === "undefined") {
                            dbEdits.push({
                                id: edit.getNumberFromDB("id"),
                                datetime: dayjs(edit.getStringFromDB("datetime")),
                                content: new Delta(JSON.parse(edit.getStringFromDB("content"))),
                                users: [edit.getNumberFromDB("user")]
                            });
                        } else {
                            currEdit.users.push(edit.getNumberFromDB("user"));
                        }
                    }

                    let isValidRequest = true;
                    let currSquashIndexes = [];

                    for (const editId of squashEditRequest.editIds) {
                        const dbEditIndex = dbEdits.findIndex(x => x.id === editId);

                        if (dbEditIndex !== -1) {
                            currSquashIndexes.push(dbEditIndex);
                        } else {
                            logger.error("Invalid squash");
                            res.status(400).send();
                            isValidRequest = false;
                            break;
                        }
                    }

                    if (isValidRequest) {
                        currSquashIndexes = currSquashIndexes.sort((a, b) => a - b);

                        let prevIndex = currSquashIndexes[0];

                        for (let i = 1; i < currSquashIndexes.length; i++) {
                            if (Math.abs(currSquashIndexes[i] - prevIndex) > 1) {
                                logger.error("Invalid squash");
                                res.status(400).send();
                                isValidRequest = false;
                                break;
                            } else {
                                prevIndex = currSquashIndexes[i];
                            }
                        }

                        if (isValidRequest) {
                            // All checks passed, so valid request
                            let delta = dbEdits[currSquashIndexes[0]].content;
                            let users: Set<number> = new Set();

                            for (let i = 0; i < currSquashIndexes.length; i++) {
                                const dbEdit = dbEdits[currSquashIndexes[i]];

                                if (i > 0) {
                                    delta = delta.compose(dbEdit.content);
                                }

                                for (const user of dbEdit.users) {
                                    if (user !== null) {
                                        users.add(user);
                                    }

                                }
                            }

                            const editId = dbEdits[currSquashIndexes[currSquashIndexes.length - 1]].id;

                            query(`
                              UPDATE edits
                              SET content = ?
                              WHERE id = ?
                            `, JSON.stringify(delta), editId)
                                .then(() => {

                                    async.each(Array.from(users), (item, callback) => {
                                        if (item !== null) {
                                            query(`
                                              INSERT INTO editusers
                                              SET edit = ?,
                                                  user = ?
                                              ON DUPLICATE KEY UPDATE user=user;
                                            `, editId, item)
                                                .then(() => {
                                                    callback();
                                                })
                                        }
                                    }, () => {
                                        return;
                                    });
                                })
                                .then(() => {
                                    const dbIds: number[] = [];

                                    for (let i = 0; i < currSquashIndexes.length - 1; i++) {
                                        dbIds.push(dbEdits[currSquashIndexes[i]].id);
                                    }

                                    async.eachSeries(dbIds, (item, callback) => {
                                        query(`
                                          DELETE
                                          FROM editusers
                                          WHERE edit = ?
                                        `, item)
                                            .then(() => {
                                                callback();
                                            })
                                    }, () => {
                                        return query(`
                                          DELETE
                                          FROM edits
                                          WHERE id IN (?)
                                        `, dbIds);
                                    });
                                })
                                .then(() => {
                                    res.sendStatus(204);
                                });
                        }

                    }

                })
                .catch((e) => {
                    logger.error("Error squashsing");
                    logger.error(e);
                    res.status(500).send();
                })
        } else {
            res.status(401).send();
        }
    } else {
        logger.error("Invalid squash input");
        res.status(400).send();
    }


});

import {Request, Response} from "express";

import {app, logger} from "../../";

import {validateMultipleInputs} from "../../utilities/StringUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";

import {GetEditContent, GetEditContentCallback} from "../../../../cshub-shared/src/api-calls";

import dayjs from "dayjs";
import {IEdit} from "../../../../cshub-shared/src/models";

app.post(GetEditContent.getURL, (req: Request, res: Response) => {

    const getEditContent: GetEditContent = req.body as GetEditContent;

    const inputsValidation = validateMultipleInputs({input: getEditContent.postHash});

    if (inputsValidation.valid) {
        hasAccessToPost(getEditContent.postHash, req.cookies["token"])
            .then((approved: postAccessType) => {
                if (approved.access) {
                    query(`
                      SELECT T1.content,
                             T1.datetime,
                             T1.post,
                             T1.approved,
                             T1.id,
                             T1.datetime,
                             T3.id        AS authorId,
                             T3.firstname AS authorFirstName,
                             T3.lastname  AS authorLastName,
                             T3.avatar    AS authorAvatar,
                             T3.admin     AS authorAdmin
                      FROM edits T1
                             INNER JOIN posts T2 ON T1.post = T2.id
                             INNER JOIN users T3 ON T1.editedBy = T3.id
                      WHERE T2.hash = ?
                    `, getEditContent.postHash)
                        .then((edits: DatabaseResultSet) => {

                            const editArray: IEdit[] = [];

                            for (const edit of edits.convertRowsToResultObjects()) {
                                editArray.push({
                                    parentPostId: edit.getNumberFromDB("post"),
                                    content: JSON.parse(edit.getStringFromDB("content")),
                                    datetime: dayjs(edit.getStringFromDB("datetime")),
                                    editedBy: {
                                        id: edit.getNumberFromDB("authorId"),
                                        firstname: edit.getStringFromDB("authorFirstName"),
                                        lastname: edit.getStringFromDB("authorLastName"),
                                        avatar: "",
                                        admin: edit.getNumberFromDB("authorAdmin") === 1
                                    },
                                    id: edit.getNumberFromDB("id"),
                                    approved: edit.getNumberFromDB("approved") === 1
                                });
                            }

                            editArray.sort((left, right) => {
                                if (left.datetime.isAfter(right.datetime)) {
                                    return 1;
                                } else if (left.datetime.isBefore(right.datetime)) {
                                    return -1;
                                } else {
                                    return 0;
                                }
                            });

                            res.json(new GetEditContentCallback(editArray));
                        })
                        .catch(err => {
                            logger.error(`Edit content retrieve failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                } else {
                    res.status(401).send();
                }
            });
    } else {
        res.status(401).send();
    }

});

import {Request, Response} from "express";

import {app, logger} from "../../";

import {validateMultipleInputs} from "../../utilities/string-utils";
import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {checkTokenValidity} from "../../auth/middleware";
import {EditPostCallback, EditPostRequest} from "../../../../cshub-shared/api-calls/pages/EditPostRequest";
import {hasAccessToPost} from "../../auth/validateRights/post";

app.post(EditPostRequest.getURL, (req: Request, res: Response) => {

    const editPostRequest: EditPostRequest = req.body as EditPostRequest;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: JSON.stringify(editPostRequest.postBody)}, {input: editPostRequest.postHash});

    if (inputsValidation.valid && userObj.valid) {
        hasAccessToPost(editPostRequest.postHash, req.cookies["token"])
            .then((approved: boolean) => {
                if (approved) {
                    query(`
                      INSERT INTO edits
                      SET post     = (SELECT id
                                      FROM posts
                                      WHERE hash = ?),
                          content  = ?,
                          editedBy = ?
                    `, editPostRequest.postHash, JSON.stringify(editPostRequest.postBody), userObj.tokenObj.user.id)
                        .then(() => {
                            return query(`
                              SELECT COUNT(*) AS editCount
                              FROM edits
                              WHERE post = (SELECT id FROM posts WHERE hash = ?)
                            `, editPostRequest.postHash)
                        })
                        .then((count: DatabaseResultSet) => {
                            const countNr = count.getNumberFromDB("editCount");
                            if (countNr > 5) {
                                query(`
                                  DELETE
                                  FROM edits
                                  WHERE post = (SELECT id FROM posts WHERE hash = ?)
                                  ORDER BY datetime ASC
                                  LIMIT ?
                                `, editPostRequest.postHash, countNr - 5)
                            }

                            res.json(new EditPostCallback());
                        })
                        .catch(err => {
                            logger.error(`Editing failed`);
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

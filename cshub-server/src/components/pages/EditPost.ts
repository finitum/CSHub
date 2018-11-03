import {Request, Response} from "express";

import {app, logger} from "../../";

import {validateMultipleInputs} from "../../utilities/string-utils";
import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {checkTokenValidity} from "../../auth/middleware";
import {EditPostCallback, EditPost} from "../../../../cshub-shared/api-calls/pages/EditPost";
import {hasAccessToPost} from "../../auth/validateRights/post";

app.post(EditPost.getURL, (req: Request, res: Response) => {

    const editPostRequest: EditPost = req.body as EditPost;

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
                          htmlContent = ?,
                          content  = ?,
                          editedBy = ?
                    `, editPostRequest.postHash, JSON.stringify(editPostRequest.postBody), JSON.stringify(editPostRequest.postBody), userObj.tokenObj.user.id)
                        .then(() => {
                            return query(`
                                UPDATE posts
                                SET postVersion = postVersion + 1
                                WHERE hash = ?
                            `, editPostRequest.postHash)
                        })
                        .then((count: DatabaseResultSet) => {
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

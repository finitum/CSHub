import {Request, Response} from "express";

import {app, logger} from "../../";

import {validateMultipleInputs} from "../../utilities/StringUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {EditPostCallback, EditPost} from "../../../../cshub-shared/api-calls/pages/EditPost";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";

app.post(EditPost.getURL, (req: Request, res: Response) => {

    const editPostRequest: EditPost = req.body as EditPost;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: JSON.stringify(editPostRequest.postBody)}, {input: editPostRequest.postHash});

    if (inputsValidation.valid && userObj.valid) {
        hasAccessToPost(editPostRequest.postHash, req.cookies["token"])
            .then((approved: postAccessType) => {
                if (approved.access) {

                    const userIsAdmin = userObj.tokenObj.user.admin;

                    query(`
                      INSERT INTO edits
                      SET post     = (SELECT id
                                      FROM posts
                                      WHERE hash = ?),
                          htmlContent = ?,
                          content  = ?,
                          editedBy = ?,
                          approved = ?,
                          approvedBy = ?
                    `, editPostRequest.postHash, JSON.stringify(editPostRequest.postBody), JSON.stringify(editPostRequest.postBody), userObj.tokenObj.user.id, userIsAdmin ? 1 : 0, userIsAdmin ? userObj.tokenObj.user.id : -1)
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

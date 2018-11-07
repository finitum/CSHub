import {Request, Response} from "express";

import {app, logger} from "../../";

import {query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {EditPostCallback, EditPost} from "../../../../cshub-shared/src/api-calls/pages/EditPost";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";
import {validateMultipleInputs} from "../../utilities/StringUtils";

app.post(EditPost.getURL, (req: Request, res: Response) => {

    const editPostRequest: EditPost = req.body as EditPost;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: JSON.stringify(editPostRequest.content.delta)}, {input: editPostRequest.postHash}, {input: editPostRequest.content.html}, {input: editPostRequest.postTitle}, {input: editPostRequest.postTopicHash});

    if (inputsValidation.valid && userObj.valid) {
        hasAccessToPost(editPostRequest.postHash, req.cookies["token"])
            .then((approved: postAccessType) => {
                if (approved.access) {

                    const userIsAdmin = userObj.tokenObj.user.admin;

                    new Promise((resolve) => resolve())
                        .then(() => {
                            return query(`
                              INSERT INTO edits
                              SET post        = (SELECT id
                                                 FROM posts
                                                 WHERE hash = ?),
                                  htmlContent = ?,
                                  content     = ?,
                                  editedBy    = ?,
                                  approved    = ?,
                                  approvedBy  = ?
                            `, editPostRequest.postHash, editPostRequest.content.html, JSON.stringify(editPostRequest.content.delta), userObj.tokenObj.user.id, userIsAdmin ? 1 : 0, userIsAdmin ? userObj.tokenObj.user.id : null)
                        })
                        .then(() => {
                            query(`
                              UPDATE posts
                              SET title = ?,
                                  topic = (SELECT id
                                           FROM topics
                                           WHERE hash = ?)
                              WHERE id = (SELECT id FROM posts WHERE hash = ?)
                            `, editPostRequest.postTitle, editPostRequest.postTopicHash, editPostRequest.postHash)
                        })
                        .then(() => {
                            return query(`
                              UPDATE posts
                              SET postVersion = postVersion + 1
                              WHERE hash = ?
                            `, editPostRequest.postHash)
                        })
                        .then(() => {
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

import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {VerifyPostCallBack, VerifyPost} from "../../../../../cshub-shared/src/api-calls";

app.post(VerifyPost.getURL, (req: Request, res: Response) => {

    const verifyPostRequest = req.body as VerifyPost;

    const token = checkTokenValidity(req);

    if (token.valid && token.tokenObj.user.admin) {
        query(`
          UPDATE posts
          SET approved    = ?,
              approvedBy  = ?,
              postVersion = postVersion + 1
          WHERE hash = ?
        `, verifyPostRequest.verify ? 1 : 0, token.tokenObj.user.id, verifyPostRequest.postHash)
            .then((result: DatabaseResultSet) => {

                return query(`
                  UPDATE edits
                  SET approved   = ?,
                      approvedBy = ?
                  WHERE post = (SELECT id FROM posts WHERE hash = ?)
                `, verifyPostRequest.verify ? 1 : 0, token.tokenObj.user.id, verifyPostRequest.postHash);
            })
            .then(() => {
                if (verifyPostRequest.verify) {
                    query(`
                      UPDATE edits
                      SET htmlContent = ""
                      WHERE id IN (SELECT id
                                   FROM edits
                                   WHERE post = (SELECT id FROM posts WHERE hash = ?)
                                     AND datetime < (SELECT datetime
                                                     FROM edits
                                                     WHERE post = (SELECT id FROM posts WHERE hash = ?)
                                                     ORDER BY datetime DESC
                                                     LIMIT 1))
                    `, verifyPostRequest.postHash, verifyPostRequest.postHash);
                }

                res.json(new VerifyPostCallBack());
            });
    } else {
        res.status(401).send();
    }
});

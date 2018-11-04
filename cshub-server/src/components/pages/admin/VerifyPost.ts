import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {VerifyPostCallBack, VerifyPost} from "../../../../../cshub-shared/api-calls";

app.post(VerifyPost.getURL, (req: Request, res: Response) => {

    const verifyPostRequest = req.body as VerifyPost;

    const token = checkTokenValidity(req);

    if (token.valid && token.tokenObj.user.admin) {
        query(`
        UPDATE posts
        SET approved = 1, approvedBy = ?, postVersion = postVersion + 1
        WHERE hash = ?
        `, token.tokenObj.user.id, verifyPostRequest.postHash)
            .then((result: DatabaseResultSet) => {

                return query(`
                    UPDATE edits
                    SET approved = 1, approvedBy = ?
                    WHERE post = (
                        SELECT id
                        FROM posts
                        WHERE hash = ?
                    )
                `, token.tokenObj.user.id, verifyPostRequest.postHash);
            })
            .then(() => {
                res.json(new VerifyPostCallBack());
            });
    } else {
        res.status(401).send();
    }
});

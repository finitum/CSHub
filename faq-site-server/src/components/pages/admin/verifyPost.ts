import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/database-connection";
import {checkTokenValidity} from "../../../auth/middleware";
import {VerifyPostCallBack, VerifyPostRequest} from "../../../../../faq-site-shared/api-calls";

app.post(VerifyPostRequest.getURL, (req: Request, res: Response) => {

    const verifyPostRequest = req.body as VerifyPostRequest;

    const token = checkTokenValidity(req);

    if (token.valid && token.tokenObj.user.admin) {
        query(`
        UPDATE posts
        SET approved = 1, approvedBy = ?
        WHERE hash = ?
        `, token.tokenObj.user.id, verifyPostRequest.postHash)
            .then((result: DatabaseResultSet) => {

                res.json(new VerifyPostCallBack());
            });
    } else {
        res.status(401).send();
    }
});

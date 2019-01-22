import {app} from "../../../";
import {Request, Response} from "express";
import {query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {HidePostCallBack, HidePost} from "../../../../../cshub-shared/src/api-calls";

app.post(HidePost.getURL, (req: Request, res: Response) => {

    const verifyPostRequest = req.body as HidePost;

    const token = checkTokenValidity(req);

    if (token.valid && token.tokenObj.user.admin) {
        query(`
          UPDATE posts
          SET postVersion = postVersion + 1, deleted = 1
          WHERE hash = ?
        `, verifyPostRequest.postHash)
            .then(() => {
                res.json(new HidePostCallBack());
            });
    } else {
        res.status(401).send();
    }
});

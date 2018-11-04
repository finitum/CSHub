import {app, logger} from "../../.";
import {Request, Response} from "express";
import {
    GetSearchPosts, GetSearchPostsCallback
} from "../../../../cshub-shared/api-calls";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.post(GetSearchPosts.getURL, (req: Request, res: Response) => {

    const searchPostRequest = req.body as GetSearchPosts;

    if (searchPostRequest.query.length >= 3) {
        const user = checkTokenValidity(req);
        const userId = user.valid ? user.tokenObj.user.id : -1;

        query(`
          SELECT hash
          FROM edits T1
                 INNER JOIN posts T2 ON T1.post = T2.id
          WHERE htmlContent LIKE ?
            AND (T2.author = ? OR (T2.approved = 1 AND T1.approved = 1) OR (SELECT admin FROM users WHERE id = ?) = 1)
          ORDER BY T2.upvotes DESC, T2.datetime DESC
          LIMIT 5
        `, `%${searchPostRequest.query}%`, userId, userId)
            .then((hashes: DatabaseResultSet) => {

                console.log(userId)
                const hashesArray: number[] = [];

                for (const hash of hashes.convertRowsToResultObjects()) {
                    hashesArray.push(hash.getNumberFromDB("hash"));
                }

                res.json(new GetSearchPostsCallback(hashesArray));
            })
            .catch((err) => {
                logger.error("Error at GetSearchPosts");
                logger.error(err);
            })
    } else {
        res.status(500).send();
    }

});
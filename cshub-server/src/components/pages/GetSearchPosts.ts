import {app} from "../../.";
import logger from "../../utilities/Logger"
import {Request, Response} from "express";
import {
    GetSearchPosts, GetSearchPostsCallback
} from "../../../../cshub-shared/src/api-calls";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.post(GetSearchPosts.getURL, (req: Request, res: Response) => {

    const searchPostRequest = req.body as GetSearchPosts;

    if (searchPostRequest.query.length >= 3) {
        const user = checkTokenValidity(req);
        const userId = user.valid ? user.tokenObj.user.id : -1;

        query(`
          SELECT DISTINCT hash
          FROM (
                 (SELECT hash
                  FROM edits T1
                         INNER JOIN posts T2 ON T1.post = T2.id
                  WHERE title LIKE ?
                    AND (T2.author = ? OR (T1.approved = 1) OR (SELECT admin FROM users WHERE id = ?) = 1)
                  GROUP BY hash
                  ORDER BY T2.upvotes DESC, T2.datetime DESC
                  LIMIT 5)

                 UNION ALL

                 (SELECT hash
                  FROM edits T1
                         INNER JOIN posts T2 ON T1.post = T2.id
                  WHERE htmlContent LIKE ?
                    AND (T2.author = ? OR (T1.approved = 1) OR (SELECT admin FROM users WHERE id = ?) = 1)
                  GROUP BY hash
                  ORDER BY T2.upvotes DESC, T2.datetime DESC
                  LIMIT 5)
               ) AS a
          LIMIT 5
        `, `%${searchPostRequest.query}%`, userId, userId, `%${searchPostRequest.query}%`, userId, userId)
            .then((hashes: DatabaseResultSet) => {

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
        logger.error("Invalid search query");
        res.status(500).send();
    }

});

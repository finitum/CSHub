import {app} from "../.";
import logger from "../utilities/Logger";
import {Request, Response} from "express";
import {Search, GetSearchPostsCallback} from "../../../cshub-shared/src/api-calls";

import {DatabaseResultSet, query} from "../db/database-query";
import {checkTokenValidity} from "../auth/AuthMiddleware";
import {ServerError} from "../../../cshub-shared/src/models/ServerError";

app.get(Search.getURL, (req: Request, res: Response) => {

    const search = req.query.query;

    if (search.length >= 3) {
        const user = checkTokenValidity(req);
        const userId = user.valid ? user.tokenObj.user.id : -1;
        const adminNum = user.valid && user.tokenObj.user.admin ? 1 : 0;

        query(`
            WITH possibleHashes AS (
                SELECT hash, title, indexWords
                FROM edits T1
                INNER JOIN posts T2 ON T1.post = T2.id
                WHERE T1.id IN (
                    SELECT edits.id
                    FROM edits
                    INNER JOIN (
                        SELECT id, post, MAX(datetime) AS datetime
                        FROM edits
                        WHERE approved = 1
                        GROUP BY post
                    ) editsDate ON edits.datetime = editsDate.datetime
                    ORDER BY edits.id DESC
                )
                AND (T2.author = ? OR (T1.approved = 1) OR ? = 1)
                AND T2.deleted = 0
                AND T2.isIndex = 0
                AND T2.wip = 0
                ORDER BY T2.upvotes DESC, T2.datetime DESC
            )

            SELECT DISTINCT hash
            FROM (
                (SELECT hash
                  FROM possibleHashes
                  WHERE title LIKE ?
                  LIMIT 5)

                UNION ALL

                (SELECT hash
                  FROM possibleHashes
                  WHERE indexWords LIKE ?
                  LIMIT 5)
            ) AS a
            LIMIT 5
        `, userId, adminNum, `%${search}%`, `%${search}%`)
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
                res.status(500).send(new ServerError("The query failed... Please open an issue if this keeps persisting (but first try again in a few minutes)"));
            });
    } else {
        logger.error("Invalid search query");
        res.status(400).send(new ServerError("Your query is not long enough"));
    }

});

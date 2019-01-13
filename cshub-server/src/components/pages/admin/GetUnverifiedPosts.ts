import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {
    GetUnverifiedPostsCallBack,
    GetUnverifiedPosts, GetUnverifiedPostsType
} from "../../../../../cshub-shared/src/api-calls";

app.post(GetUnverifiedPosts.getURL, (req: Request, res: Response) => {

    const token = checkTokenValidity(req);

    if (token.valid && token.tokenObj.user.admin) {
        query(`
          SELECT hash, editCount
          FROM posts T1
                 LEFT JOIN (
            SELECT *
            FROM edits
            ORDER BY datetime DESC
            LIMIT 1
          ) T2 ON T1.id = T2.post
                 LEFT JOIN (
            SELECT COUNT(*) AS editCount, post
            FROM edits
            GROUP BY post
          ) T3 on T1.id = T3.post
          WHERE (T2.approved = 0 OR editCount = 0 OR editCount IS NULL)
            AND T1.deleted = 0
          GROUP BY T2.post
          ORDER BY T2.datetime DESC
        `)
            .then((result: DatabaseResultSet) => {

                const hashes: GetUnverifiedPostsType[] = [];

                result.convertRowsToResultObjects().forEach((x) => {
                    hashes.push({
                        hash: x.getNumberFromDB("hash"),
                        isNewPost: x.getNumberFromDB("editCount") === null || x.getNumberFromDB("editCount") === 0
                    });
                });

                res.json(new GetUnverifiedPostsCallBack(hashes));
            });
    } else {
        res.status(401).send();
    }
});

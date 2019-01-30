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
            SELECT COUNT(*) AS editCount, post, MAX(datetime) AS datetime
            FROM edits
            GROUP BY post
          ) T2 ON T1.id = T2.post
          WHERE ((
                   SELECT approved
                   FROM edits X1
                   WHERE X1.post = T1.id
                   ORDER BY DATETIME DESC
                   LIMIT 1
                 ) = 0 OR editCount = 0 OR editCount IS NULL) AND T1.deleted = 0
          GROUP BY T2.post
          ORDER BY T1.datetime DESC
        `)
            .then((result: DatabaseResultSet) => {

                const hashes: GetUnverifiedPostsType[] = [];

                result.convertRowsToResultObjects().forEach((x) => {
                    hashes.push({
                        hash: x.getNumberFromDB("hash")
                    });
                });

                res.json(new GetUnverifiedPostsCallBack(hashes));
            });
    } else {
        res.status(401).send();
    }
});

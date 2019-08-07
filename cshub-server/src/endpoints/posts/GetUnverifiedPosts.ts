import {app} from "../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../db/database-query";
import {GetUnverifiedPosts, GetUnverifiedPostsCallBack, WIPPosts} from "../../../../cshub-shared/src/api-calls";
import {customValidator} from "../../utilities/StringUtils";

app.get(GetUnverifiedPosts.getURL, (req: Request, res: Response) => {

    const unverifiedPostsRequest = req.body as GetUnverifiedPosts;

    if (!customValidator({input: unverifiedPostsRequest.study}).valid) {
        res.sendStatus(400);
        return;
    }

    query(`
        WITH RECURSIVE studyTopics (id, parentid) AS (
            SELECT t1.id, t1.parentid
            FROM topics t1
            WHERE id = (SELECT topTopicId FROM studies WHERE id = ?)

            UNION ALL

            SELECT t2.id, t2.parentid
            FROM topics t2
            INNER JOIN studyTopics ON t2.parentid = studyTopics.id
        )

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
               ) = 0 OR editCount = 0 OR editCount IS NULL)
          AND T1.deleted = 0 AND T1.topic IN (SELECT id FROM studyTopics)
        GROUP BY T2.post
        ORDER BY T1.datetime DESC
    `, unverifiedPostsRequest.study)
        .then((result: DatabaseResultSet) => {

            const hashes: number[] = [];

            result.convertRowsToResultObjects().forEach((x) => {
                hashes.push(x.getNumberFromDB("hash"));
            });

            res.json(new GetUnverifiedPostsCallBack(hashes));
        });
});

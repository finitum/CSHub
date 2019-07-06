import {app} from "../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../db/database-query";
import {
    GetUnverifiedPostsCallBack} from "../../../../cshub-shared/src/api-calls";
import {WIPPosts} from "../../../../cshub-shared/src/api-calls";

app.get(WIPPosts.getURL, (req: Request, res: Response) => {

    query(`
      SELECT hash
      FROM posts T1
      WHERE T1.wip = 1 AND T1.deleted = 0
      ORDER BY T1.datetime DESC
    `)
        .then((result: DatabaseResultSet) => {

            const hashes: number[] = [];

            result.convertRowsToResultObjects().forEach((x) => {
                hashes.push(x.getNumberFromDB("hash"));
            });

            res.json(new GetUnverifiedPostsCallBack(hashes));
        });
});

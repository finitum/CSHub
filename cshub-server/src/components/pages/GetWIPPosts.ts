import {app} from "../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {
    GetUnverifiedPostsCallBack} from "../../../../cshub-shared/src/api-calls";
import {GetWIPPosts} from "../../../../cshub-shared/src/api-calls/pages/GetWIPPosts";

app.get(GetWIPPosts.getURL, (req: Request, res: Response) => {

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

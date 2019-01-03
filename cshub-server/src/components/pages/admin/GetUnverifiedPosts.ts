import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {
    GetUnverifiedPostsCallBack,
    GetUnverifiedPosts
} from "../../../../../cshub-shared/src/api-calls";

app.post(GetUnverifiedPosts.getURL, (req: Request, res: Response) => {

    const getUnverifiedPostsRequest = req.body as GetUnverifiedPosts;

    const token = checkTokenValidity(req);

    if (token.valid) {
        query(`
          SELECT hash
          FROM posts T1
                 INNER JOIN edits T2 ON T1.id = T2.post
          WHERE T1.online = 0 OR T2.approved = 0
          GROUP BY hash
          ORDER BY T1.datetime DESC, T2.datetime DESC
        `)
            .then((result: DatabaseResultSet) => {

                const hashes: number[] = [];

                result.convertRowsToResultObjects().forEach((x) => {
                    hashes.push(x.getNumberFromDB("hash"));
                });

                res.json(new GetUnverifiedPostsCallBack(hashes));
            });
    } else {
        res.status(401).send();
    }
});

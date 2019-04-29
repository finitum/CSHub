import {app} from "../../../";
import {GetUserPosts, GetUserPostsCallback} from "../../../../../cshub-shared/src/api-calls";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";

app.get(GetUserPosts.getURL, (req: Request, res: Response) => {

    const getFavorites: boolean = req.params.type === "favorites";

    const token = checkTokenValidity(req);

    if (token.valid) {

        let queryResult: Promise<DatabaseResultSet>;
        if (getFavorites) {
            queryResult = query(`
              SELECT hash
              FROM posts T1
                     INNER JOIN favorites T2 ON T1.id = T2.post
              WHERE T2.user = ?
                AND deleted = 0
              ORDER BY datetime DESC
            `, token.tokenObj.user.id);
        } else {
            queryResult = query(`
              SELECT hash
              FROM posts
              WHERE author = ?
                AND deleted = 0
              ORDER BY datetime DESC
            `, token.tokenObj.user.id);
        }

        queryResult
            .then((result: DatabaseResultSet) => {

                const hashes: number[] = [];

                result.convertRowsToResultObjects().forEach((x) => {
                    hashes.push(x.getNumberFromDB("hash"));
                });

                res.json(new GetUserPostsCallback(hashes));
            });

    } else {
        res.status(401).send();
    }
});

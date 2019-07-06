import {app} from "../../";
import {Dashboard, DashboardCallback} from "../../../../cshub-shared/src/api-calls";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../db/database-query";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.get(Dashboard.getURL, (req: Request, res: Response) => {

    const token = checkTokenValidity(req);

    if (token.valid) {

        query(`
          SELECT hash
          FROM posts
          WHERE author = ?
            AND deleted = 0
          ORDER BY datetime DESC
        `, token.tokenObj.user.id)
            .then((result: DatabaseResultSet) => {

                const hashes: number[] = [];

                result.convertRowsToResultObjects().forEach((x) => {
                    hashes.push(x.getNumberFromDB("hash"));
                });

                res.json(new DashboardCallback(hashes));
            });

    } else {
        res.status(401).send();
    }
});

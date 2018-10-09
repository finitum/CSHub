import {app} from "../../../";
import {UserDashboardCallBack, UserDashboardRequest} from "../../../../../faq-site-shared/api-calls";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../database-connection";
import {checkTokenValidity} from "../../../auth/middleware";

app.post(UserDashboardRequest.getURL, (req: Request, res: Response) => {

    const userDashboardRequest = req.body as UserDashboardRequest;

    const token = checkTokenValidity(req);

    if (token.valid) {
        query(`
        SELECT hash
        FROM posts
        WHERE author = ?
        ORDER BY datetime DESC
        LIMIT ?, 5
        `, token.tokenObj.user.id, userDashboardRequest.startFromResult)
            .then((result: DatabaseResultSet) => {

                const hashes: number[] = [];

                result.convertRowsToResultObjects().forEach((x) => {
                    hashes.push(x.getNumberFromDB("hash"));
                });

                res.json(new UserDashboardCallBack(hashes));
            });
    }
});

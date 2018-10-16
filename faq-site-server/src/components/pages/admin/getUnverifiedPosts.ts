import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/database-connection";
import {checkTokenValidity} from "../../../auth/middleware";
import {
    GetUnverifiedPostsCallBack,
    GetUnverifiedPostsRequest
} from "../../../../../faq-site-shared/api-calls";

app.post(GetUnverifiedPostsRequest.getURL, (req: Request, res: Response) => {

    const getUnverifiedPostsRequest = req.body as GetUnverifiedPostsRequest;

    const token = checkTokenValidity(req);

    if (token.valid) {
        query(`
        SELECT hash
        FROM posts
        WHERE approved = 0
        ORDER BY datetime DESC
        LIMIT ?, 5
        `, getUnverifiedPostsRequest.startFromResult)
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

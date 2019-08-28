import { app } from "../../";
import { Request, Response } from "express";
import { DatabaseResultSet, query } from "../../db/database-query";
import { GetUnverifiedPostsCallBack, SubmitTopic, WIPPosts } from "../../../../cshub-shared/src/api-calls";
import { customValidator, validateMultipleInputs } from "../../utilities/StringUtils";

app.get(WIPPosts.getURL, (req: Request, res: Response) => {
    const studyId = +req.query[WIPPosts.studyQueryParam];

    if (!customValidator({ input: studyId }).valid) {
        res.sendStatus(400);
        return;
    }

    // language=MySQL
    query(
        `
        WITH RECURSIVE studyTopics (id, parentid) AS (
            SELECT t1.id, t1.parentid
            FROM topics t1
            WHERE id = (SELECT topTopicId FROM studies WHERE id = ?)

            UNION ALL

            SELECT t2.id, t2.parentid
            FROM topics t2
            INNER JOIN studyTopics ON t2.parentid = studyTopics.id
        )

        SELECT hash
        FROM posts T1
        WHERE T1.wip = 1 AND T1.deleted = 0 AND T1.topic IN (SELECT id FROM studyTopics)
        ORDER BY T1.datetime DESC
    `,
        studyId
    ).then((result: DatabaseResultSet) => {
        const hashes: number[] = [];

        result.convertRowsToResultObjects().forEach(x => {
            hashes.push(x.getNumberFromDB("hash"));
        });

        res.json(new GetUnverifiedPostsCallBack(hashes));
    });
});

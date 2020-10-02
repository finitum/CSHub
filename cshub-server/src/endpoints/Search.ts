import logger from "../utilities/Logger";
import { Application, Request, Response } from "express";
import { Search, GetSearchPostsCallback } from "../../../cshub-shared/src/api-calls";

import { DatabaseResultSet, query } from "../db/database-query";
import { ServerError } from "../../../cshub-shared/src/models/ServerError";

export function registerSearchEndpoint(app: Application): void {
    app.get(Search.getURL, (req: Request, res: Response) => {
        const search = req.query.query;
        const studyNr = req.query.studyNr;

        if (search && typeof search === "string" && search.length >= 3) {
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
            ), possibleHashes AS (
                SELECT hash, title, indexWords
                FROM edits T1
                INNER JOIN posts T2 ON T1.post = T2.id
                WHERE T1.id IN (
                    SELECT edits.id
                    FROM edits
                    INNER JOIN (
                        SELECT id, post, MAX(datetime) AS datetime
                        FROM edits
                        WHERE approved = 1
                        GROUP BY post
                    ) editsDate ON edits.datetime = editsDate.datetime
                    ORDER BY edits.id DESC
                )
                AND T2.deleted = 0
                AND T2.isIndex = 0
                AND T2.wip = 0
                AND T2.topic IN (SELECT id FROM studyTopics)
                ORDER BY T2.datetime DESC
            )

            SELECT DISTINCT hash
            FROM (
                (SELECT hash
                  FROM possibleHashes
                  WHERE title LIKE ?
                  LIMIT 5)

                UNION ALL

                (SELECT hash
                  FROM possibleHashes
                  WHERE indexWords LIKE ?
                  LIMIT 5)
            ) AS a
            LIMIT 5
        `,
                studyNr,
                `%${search}%`,
                `%${search}%`,
            )
                .then((hashes: DatabaseResultSet) => {
                    const hashesArray: number[] = [];

                    for (const hash of hashes.convertRowsToResultObjects()) {
                        hashesArray.push(hash.getNumberFromDB("hash"));
                    }

                    res.json(new GetSearchPostsCallback(hashesArray));
                })
                .catch((err) => {
                    logger.error("Error at GetSearchPosts");
                    logger.error(err);
                    res.status(500).send(
                        new ServerError(
                            "The query failed... Please open an issue if this keeps persisting (but first try again in a few minutes)",
                        ),
                    );
                });
        } else {
            logger.error("Invalid search query");
            res.status(400).send(new ServerError("Your query is not long enough"));
        }
    });
}

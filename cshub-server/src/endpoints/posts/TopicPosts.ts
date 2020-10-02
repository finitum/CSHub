import { Application, Request, Response } from "express";

import { TopicPosts } from "../../../../cshub-shared/src/api-calls";
import { getPosts } from "./GetPosts";
import { query } from "../../db/database-query";

export function registerTopicPostsEndpoint(app: Application): void {
    app.get(TopicPosts.getURL, (req: Request, res: Response) => {
        getPosts(req, res, (topicHashes, currentTopicHash) => {
            return query(
                `
                      SELECT T1.hash
                      FROM posts T1
                             INNER JOIN topics T2 ON T1.topic = T2.id
                      WHERE deleted = 0
                        AND T1.wip = 0
                        AND T1.isExample = 0
                        AND T2.hash IN (?)
                        AND (T1.isIndex = 0 OR T1.topic = (SELECT id FROM topics WHERE hash = ?))
                      ORDER BY T1.isIndex DESC, T1.datetime DESC
                    `,
                topicHashes,
                currentTopicHash,
            );
        });
    });
}

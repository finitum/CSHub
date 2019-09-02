import { Request, Response } from "express";

import { app } from "../../";
import { ExamplePosts } from "../../../../cshub-shared/src/api-calls/endpoints/posts/ExamplePosts";
import { getPosts } from "./GetPosts";
import { query } from "../../db/database-query";

app.get(ExamplePosts.getURL, (req: Request, res: Response) => {
    getPosts(req, res, (topicHashes, currentTopicHash) => {
        return query(
            `
                  SELECT T1.hash
                  FROM posts T1
                         INNER JOIN topics T2 ON T1.topic = T2.id
                  WHERE deleted = 0
                    AND T1.wip = 0
                    AND T1.isExample = 1
                    AND T2.hash IN (?)
                  ORDER BY T1.isIndex DESC, T1.datetime DESC
                `,
            topicHashes
        );
    });
});

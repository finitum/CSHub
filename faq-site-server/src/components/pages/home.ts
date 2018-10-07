import async from "async";
import {Request, Response} from "express";

import {app} from "../../";
import {DatabaseResultSet, query} from "../../database-connection";

import {IndexCallBack, IndexRequest} from "../../../../faq-site-shared/api-calls";
import {IEdit, IPost} from "../../../../faq-site-shared/models";
import {getTopics} from "./topics";

app.get(IndexRequest.getURL, (req: Request, res: Response) => {

    const topics = getTopics();
    topics
        .then((topicsResult) => {
            if (topicsResult === null) {
                res.status(503).send();
            } else {
                query(`
                  SELECT id
                  FROM posts T1
                  WHERE approved = 1
                  ORDER BY datetime DESC
                  LIMIT 5
                `)
                    .then((posts: DatabaseResultSet) => {

                        const postIds: number[] = [];

                        for (const post of posts.convertRowsToResultObjects()) {
                            postIds.push(post.getNumberFromDB("id"));
                        }

                        const callbackObj = new IndexCallBack(postIds);

                        res.json(callbackObj);
                    })
                    .catch(err => {
                        res.status(503).send();
                    });
            }
        });
});

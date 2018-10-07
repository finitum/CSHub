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
                res.status(500).send();
            } else {
                query(`
                  SELECT hash
                  FROM posts T1
                  WHERE approved = 1
                  ORDER BY datetime DESC
                  LIMIT 5
                `)
                    .then((posts: DatabaseResultSet) => {

                        const postHashes: number[] = [];

                        for (const post of posts.convertRowsToResultObjects()) {
                            postHashes.push(post.getNumberFromDB("hash"));
                        }

                        const callbackObj = new IndexCallBack(postHashes);

                        res.json(callbackObj);
                    })
                    .catch(err => {
                        res.status(500).send();
                    });
            }
        });
});

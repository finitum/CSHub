import {app, logger} from "../../.";
import {Request, Response} from "express";
import {
    PostContentCallBack,
    PostContentRequest
} from "../../../../cshub-shared/api-calls";

import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {hasAccessToPost} from "../../auth/validateRights/post";

app.post(PostContentRequest.getURL, (req: Request, res: Response) => {

    const postContentRequest = req.body as PostContentRequest;

    // Check if the user actually has access to the post
    hasAccessToPost(postContentRequest.postHash, req.cookies["token"])
        .then((approved: boolean) => {
            if (!approved) {
                res.status(401).send();
            }

            getPostContent(postContentRequest.postHash)
                .then((callback: PostContentCallBack) => {
                    res.json(callback);

                })
                .catch(err => {
                    res.status(500).send();
                });
        });
});

export const getPostContent = (postHash: number): Promise<PostContentCallBack> => {

    // Get all the post data from database
    return query(`
              SELECT T1.content
              FROM edits T1
                     INNER JOIN posts T2 ON T1.post = T2.id
              WHERE T2.hash = ?
              ORDER BY T1.datetime DESC
              LIMIT 1
            `, postHash)
        .then((post: DatabaseResultSet) => {
            return new PostContentCallBack(JSON.parse(post.getStringFromDB("content")));
        })
        .catch(err => {
            logger.error(`Retreiving post content failed`);
            logger.error(err);
            return null;
        });
};
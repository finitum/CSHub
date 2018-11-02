import {app, logger} from "../../.";
import {Request, Response} from "express";
import {
    PostCallBack,
    PostVersionCallBack,
    PostVersionRequest,
    PostVersionTypes
} from "../../../../cshub-shared/api-calls";

import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {hasAccessToPost} from "../../auth/validateRights/post";
import {getPostData} from "./post";

app.post(PostVersionRequest.getURL, (req: Request, res: Response) => {

    const postContentRequest = req.body as PostVersionRequest;

    // Check if the user actually has access to the post
    hasAccessToPost(postContentRequest.postHash, req.cookies["token"])
        .then((approved: boolean) => {
            if (!approved) {
                res.status(401).send();
            }

            query(`
              SELECT T1.htmlContent, T2.postVersion
              FROM edits T1
                     INNER JOIN posts T2 ON T1.post = T2.id
              WHERE T2.hash = ?
              ORDER BY T1.datetime DESC
              LIMIT 1
            `,  postContentRequest.postHash)
                .then((post: DatabaseResultSet) => {
                    const htmlContent: string = post.getStringFromDB("htmlContent");

                    if (post.convertRowsToResultObjects().length === 0) {
                        res.json(new PostVersionCallBack(PostVersionTypes.POSTDELETED));
                    } else if (post.getNumberFromDB("postVersion") !== postContentRequest.postVersion) {
                        getPostData(postContentRequest.postHash)
                            .then((data: PostCallBack) => {
                                res.json(new PostVersionCallBack(PostVersionTypes.UPDATEDPOST, htmlContent, data.post));
                            })
                    } else if (postContentRequest.getHTMLOnNoUpdate) {
                        res.json(new PostVersionCallBack(PostVersionTypes.RETRIEVEDCONTENT, htmlContent));
                    } else {
                        res.json(new PostVersionCallBack(PostVersionTypes.NOCHANGE));
                    }

                })
                .catch(err => {
                    logger.error("Error at post content");
                    logger.error(err);
                    res.status(500).send();
                });
        });
});
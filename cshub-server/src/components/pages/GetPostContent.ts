import {app, logger} from "../../.";
import {Request, Response} from "express";
import {
    GetPostCallBack,
    GetPostContentCallBack,
    GetPostContent,
    PostVersionTypes
} from "../../../../cshub-shared/api-calls";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {hasAccessToPost} from "../../auth/validateRights/PostAccess";
import {getPostData} from "./GetPost";

app.post(GetPostContent.getURL, (req: Request, res: Response) => {

    const postContentRequest = req.body as GetPostContent;

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
                        res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                    } else if (post.getNumberFromDB("postVersion") !== postContentRequest.postVersion) {
                        getPostData(postContentRequest.postHash)
                            .then((data: GetPostCallBack) => {
                                res.json(new GetPostContentCallBack(PostVersionTypes.UPDATEDPOST, htmlContent, data.post));
                            })
                    } else if (postContentRequest.getHTMLOnNoUpdate) {
                        res.json(new GetPostContentCallBack(PostVersionTypes.RETRIEVEDCONTENT, htmlContent));
                    } else {
                        res.json(new GetPostContentCallBack(PostVersionTypes.NOCHANGE));
                    }

                })
                .catch(err => {
                    logger.error("Error at post content");
                    logger.error(err);
                    res.status(500).send();
                });
        });
});
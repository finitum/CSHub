import {app, logger} from "../../.";
import {Request, Response} from "express";
import {
    GetPostCallBack,
    GetPostContent,
    GetPostContentCallBack,
    PostVersionTypes
} from "../../../../cshub-shared/src/api-calls";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";
import {getPostData} from "./GetPost";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import tracker from "../../utilities/Tracking";

app.post(GetPostContent.getURL, (req: Request, res: Response) => {

    const postContentRequest = req.body as GetPostContent;

    // Analytics
    const reqURL = "/post/" + postContentRequest.postHash;
    tracker.pageview(reqURL).send();

    type contentReturn = {
        content: string,
        approved: number
    };

    // Check if the user actually has access to the post
    hasAccessToPost(postContentRequest.postHash, req.cookies["token"])
        .then((approved: postAccessType) => {
            if (!approved) {
                res.status(401).send();
            }

            query(`
              SELECT T2.postVersion
              FROM posts T2
              WHERE T2.hash = ?
            `,  postContentRequest.postHash)
                .then((post: DatabaseResultSet) => {

                    if (post.convertRowsToResultObjects().length === 0) {
                        res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                    } else if (post.getNumberFromDB("postVersion") !== postContentRequest.postVersion) {
                        getContent(approved)
                            .then((returnContent: contentReturn) => {
                                getPostData(postContentRequest.postHash)
                                    .then((data: GetPostCallBack) => {
                                        if (data !== null && returnContent.approved !== -1) {
                                            res.json(new GetPostContentCallBack(PostVersionTypes.UPDATEDPOST, {
                                                html: returnContent.content,
                                                approved: returnContent.approved === 1
                                            }, data.post));
                                        } else {
                                            res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                                        }
                                    });
                            });
                    } else if (postContentRequest.getHTMLOnNoUpdate) {
                        getContent(approved)
                            .then((returnContent: contentReturn) => {
                                if (returnContent.approved === -1) {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                                } else {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.RETRIEVEDCONTENT, {
                                        html: returnContent.content,
                                        approved: returnContent.approved === 1
                                    }));
                                }
                            })
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

    const getContent = (approved: postAccessType) => {
        const user = checkTokenValidity(req);

        const mustBeApproved: number[] = approved.isOwner ? [0, 1] : [1];

        return query(`
              SELECT T1.htmlContent, T1.approved
              FROM edits T1
                     INNER JOIN posts T2 ON T1.post = T2.id
              WHERE T2.hash = ? AND T1.approved IN (?)
              ORDER BY T1.datetime DESC
              LIMIT 1
            `,  postContentRequest.postHash, mustBeApproved)
            .then((content: DatabaseResultSet) => {
                if (content.convertRowsToResultObjects().length > 0) {
                    return {
                        content: content.getStringFromDB("htmlContent"),
                        approved: content.getNumberFromDB("approved")
                    };
                } else {
                    return {
                        content: "No accessible content found!",
                        approved: -1
                    };
                }
            });
    };
});

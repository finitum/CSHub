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

    enum postState {
        ONLINE,
        FIRSTEDIT,
        DELETED
    }

    type contentReturn = {
        content: string,
        state: postState
    };

    // Check if the user actually has access to the post
    hasAccessToPost(postContentRequest.postHash, req.cookies["token"])
        .then((approved: postAccessType) => {
            if (!approved.access) {
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
                                        if (data !== null && returnContent.state !== postState.DELETED) {
                                            res.json(new GetPostContentCallBack(PostVersionTypes.UPDATEDPOST, {
                                                html: returnContent.content,
                                                approved: returnContent.state === postState.ONLINE
                                            }, data.post));
                                        } else {
                                            res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                                        }
                                    });
                            });
                    } else if (postContentRequest.getHTMLOnNoUpdate) {
                        getContent(approved)
                            .then((returnContent: contentReturn) => {
                                if (returnContent.state === postState.DELETED) {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                                } else {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.RETRIEVEDCONTENT, {
                                        html: returnContent.content,
                                        approved: returnContent.state === postState.ONLINE
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

        return query(`
              SELECT T2.htmlContent, T2.approved, T1.deleted
              FROM posts T1
                     LEFT JOIN edits T2 ON T1.id = T2.post AND T2.approved = 1
              WHERE T1.hash = ? AND deleted = 0
              ORDER BY T2.datetime DESC
              LIMIT 1
            `,  postContentRequest.postHash)
            .then((content: DatabaseResultSet) => {
                if (content.convertRowsToResultObjects().length > 0) {
                    if (content.getStringFromDB("htmlContent") === null && approved.isOwner) {
                        return {
                            content: "No content yet!",
                            state: postState.FIRSTEDIT
                        };
                    }

                    return {
                        content: content.getStringFromDB("htmlContent"),
                        state: postState.ONLINE
                    };
                } else {
                    return {
                        content: "No accessible content found!",
                        state: postState.DELETED
                    };
                }
            })
            .catch(err => {
                logger.error("Error getting content");
                logger.error(err);
                return {
                    content: "Error",
                    state: postState.DELETED
                }
            });
    };
});

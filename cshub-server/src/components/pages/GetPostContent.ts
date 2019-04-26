import {app} from "../../.";
import logger from "../../utilities/Logger";
import {Request, Response} from "express";
import {
    GetPostCallBack,
    GetPostContent,
    GetPostContentCallBack,
    PostVersionTypes
} from "../../../../cshub-shared/src/api-calls";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {getPostData} from "./GetPost";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.post(GetPostContent.getURL, (req: Request, res: Response) => {

    const postContentRequest = req.body as GetPostContent;

    enum postState {
        ONLINE,
        FIRSTEDIT,
        DELETED
    }

    type contentReturn = {
        content: string,
        state: postState
    };

    const userObj = checkTokenValidity(req);

    const userId = userObj.valid ? userObj.tokenObj.user.id : -1;

    query(`
        SELECT T1.postVersion, T2.id AS favorited
        FROM posts T1
                 LEFT JOIN favorites T2 on T1.id = T2.post AND T2.user = ?
        WHERE T1.hash = ?
    `, userId, postContentRequest.postHash)
        .then((post: DatabaseResultSet) => {

            if (post.convertRowsToResultObjects().length === 0) {
                res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED, post.getNumberFromDB("favorited") !== null));
            } else if (post.getNumberFromDB("postVersion") !== postContentRequest.postVersion) {
                getContent()
                    .then((returnContent: contentReturn) => {
                        getPostData(postContentRequest.postHash, userObj)
                            .then((data: GetPostCallBack) => {
                                if (data !== null && returnContent.state !== postState.DELETED) {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.UPDATEDPOST,
                                        post.getNumberFromDB("favorited") !== null,
                                        {
                                            html: returnContent.content,
                                            approved: returnContent.state === postState.ONLINE
                                        }, data.post));
                                } else {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED,
                                        post.getNumberFromDB("favorited") !== null));
                                }
                            });
                    });
            } else if (postContentRequest.getHTMLOnNoUpdate) {
                getContent()
                    .then((returnContent: contentReturn) => {
                        if (returnContent.state === postState.DELETED) {
                            res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED,
                                post.getNumberFromDB("favorited") !== null));
                        } else {
                            res.json(new GetPostContentCallBack(PostVersionTypes.RETRIEVEDCONTENT,
                                post.getNumberFromDB("favorited") !== null, {
                                    html: returnContent.content,
                                    approved: returnContent.state === postState.ONLINE
                                }));
                        }
                    });
            } else {
                res.json(new GetPostContentCallBack(PostVersionTypes.NOCHANGE, post.getNumberFromDB("favorited") !== null));
            }

        })
        .catch(err => {
            logger.error("Error at post content");
            logger.error(err);
            res.status(500).send();
        });

    const getContent = () => {

        return query(`
            SELECT T2.htmlContent, T2.approved, T1.deleted
            FROM posts T1
                     LEFT JOIN edits T2 ON T1.id = T2.post AND T2.approved = 1
            WHERE T1.hash = ?
              AND deleted = 0
            ORDER BY T2.datetime DESC
            LIMIT 1
        `, postContentRequest.postHash)
            .then((content: DatabaseResultSet) => {
                if (content.convertRowsToResultObjects().length > 0) {
                    if (content.getStringFromDB("htmlContent") === null) {
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
                };
            });
    };
});

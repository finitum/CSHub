import {app} from "../../.";
import logger from "../../utilities/Logger";
import {Request, Response} from "express";
import {
    GetPostCallBack,
    PostContent,
    GetPostContentCallBack,
    PostVersionTypes
} from "../../../../cshub-shared/src/api-calls";

import {DatabaseResultSet, query} from "../../db/database-query";
import {getPostData} from "./PostData";
import {checkTokenValidityFromRequest} from "../../auth/AuthMiddleware";

app.get(PostContent.getURL, (req: Request, res: Response) => {

    // const postContentRequest = req.body as GetPostContent;
    const postVersion: number = +req.header(PostContent.postVersionHeader);
    const postHash: number = req.params.hash;

    enum postState {
        ONLINE,
        FIRSTEDIT,
        DELETED
    }

    type contentReturn = {
        content: string,
        state: postState
    };

    const userObj = checkTokenValidityFromRequest(req);

    const userId = userObj.valid ? userObj.tokenObj.user.id : -1;

    query(`
        SELECT T1.postVersion
        FROM posts T1
        WHERE T1.hash = ?
    `, postHash)
        .then((post: DatabaseResultSet) => {

            if (post.convertRowsToResultObjects().length === 0) {
                res.json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
            } else if (post.getNumberFromDB("postVersion") !== postVersion) {
                getContent()
                    .then((returnContent: contentReturn) => {
                        getPostData(postHash, userObj)
                            .then((data: GetPostCallBack) => {
                                if (data !== null && returnContent.state !== postState.DELETED) {
                                    res.json(new GetPostContentCallBack(PostVersionTypes.UPDATEDPOST,
                                        {
                                            html: returnContent.content,
                                            approved: returnContent.state === postState.ONLINE
                                        }, data.post));
                                } else {
                                    res.status(410).json(new GetPostContentCallBack(PostVersionTypes.POSTDELETED));
                                }
                            });
                    });
            } else {
                // TODO: Preferably I'd want to return a 304 here only a 304 can't contain data
                res.sendStatus(304);
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
        `, postHash)
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

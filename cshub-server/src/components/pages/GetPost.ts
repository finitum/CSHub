import {app} from "../../";
import logger from "../../utilities/Logger";
import {Request, Response} from "express";
import {
    GetPostCallBack,
    GetPost
} from "../../../../cshub-shared/src/api-calls";
import {IJWTToken, IPost} from "../../../../cshub-shared/src/models";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";
import {checkTokenValidity, ValidationType} from "../../auth/AuthMiddleware";

app.post(GetPost.getURL, (req: Request, res: Response) => {

    const postRequest = req.body as GetPost;

    // Check if the user actually has access to the post
    hasAccessToPost(postRequest.postHash, req.cookies["token"])
        .then((approved: postAccessType) => {
            if (!approved.access) {
                res.status(403).send();
            } else {
                const userObj = checkTokenValidity(req);

                // Get all the post data from database
                getPostData(postRequest.postHash, userObj)
                    .then((data: GetPostCallBack) => {
                        if (data === null) {
                            res.status(500).send();
                        } else {
                            res.json(data);
                        }
                    });
            }
        });
});

export const getPostData = (postHash: number, userObj: ValidationType): Promise<GetPostCallBack> => {
    const userId = userObj.valid ? userObj.tokenObj.user.id : -1;

    return query(`
      SELECT T1.datetime,
             T1.title,
             T1.hash,
             T1.upvotes,
             T2.id        AS authorId,
             T2.firstname AS authorFirstName,
             T2.lastname  AS authorLastName,
             T2.avatar    AS authorAvatar,
             T2.admin     AS authorAdmin,
             T3.name,
             T3.hash      AS topicHash,
             T1.id,
             T1.postVersion,
             T4.id        AS favorited
      FROM posts T1
             INNER JOIN users T2 ON T1.author = T2.id
             INNER JOIN topics T3 ON T1.topic = T3.id
             LEFT JOIN favorites T4 ON T1.id = T4.post AND T2.id = ?
      WHERE T1.hash = ?
      ORDER BY datetime DESC
    `, userId, postHash)
        .then((post: DatabaseResultSet) => {

            if (post.convertRowsToResultObjects().length === 0) {
                return new GetPostCallBack(null);
            }
            // Create the postBase object, it will be expanded depending on the type of request (Preview or full, preview has less data)
            // The author is of typed IUserCensored as it protects a bit of privacy, it doesn't get all their data, just name and avatar
            const postBase: IPost = {
                topicHash: post.getNumberFromDB("topicHash"),
                datetime: post.getStringFromDB("datetime"),
                title: post.getStringFromDB("title"),
                upvotes: post.getNumberFromDB("upvotes"),
                hash: post.getNumberFromDB("hash"),
                id: post.getNumberFromDB("id"),
                author: {
                    id: post.getNumberFromDB("authorId"),
                    firstname: post.getStringFromDB("authorFirstName"),
                    lastname: post.getStringFromDB("authorLastName"),
                    avatar: post.getStringFromDB("authorAvatar"),
                    admin: post.getNumberFromDB("authorAdmin") === 1
                },
                postVersion: post.getNumberFromDB("postVersion"),
                isMyFavorite: post.getNumberFromDB("favorited") !== null
            };

            if (postBase.author.avatar !== null) {
                postBase.author.avatar = Buffer.from(postBase.author.avatar).toString("base64");
            }

            return new GetPostCallBack(postBase);
        })
        .catch(err => {
            logger.error(`Retreiving post data failed`);
            logger.error(err);
            return null;
        });
};

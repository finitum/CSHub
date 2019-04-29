import {app} from "../../";
import logger from "../../utilities/Logger";
import {Request, Response} from "express";
import {GetPost, GetPostCallBack} from "../../../../cshub-shared/src/api-calls";
import {IPost} from "../../../../cshub-shared/src/models";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity, ValidationType} from "../../auth/AuthMiddleware";

app.get(GetPost.getURL, (req: Request, res: Response) => {

    const hash = req.params.hash;

    const userObj = checkTokenValidity(req);

    // Get all the post data from database
    getPostData(hash, userObj)
        .then((data: GetPostCallBack) => {
            if (data === null) {
                res.status(404).send();
            } else {
                res.json(data);
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
               T1.isIndex,
               T2.id        AS authorId,
               T2.firstname AS authorFirstName,
               T2.lastname  AS authorLastName,
               T2.avatar    AS authorAvatar,
               T2.admin     AS authorAdmin,
               T3.name,
               T3.hash      AS topicHash,
               T1.id,
               T1.postVersion,
               T1.wip
        FROM posts T1
                 INNER JOIN users T2 ON T1.author = T2.id
                 INNER JOIN topics T3 ON T1.topic = T3.id
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
                isIndex: post.getNumberFromDB("isIndex") === 1,
                id: post.getNumberFromDB("id"),
                author: {
                    id: post.getNumberFromDB("authorId"),
                    firstname: post.getStringFromDB("authorFirstName"),
                    lastname: post.getStringFromDB("authorLastName"),
                    avatar: post.getStringFromDB("authorAvatar"),
                    admin: post.getNumberFromDB("authorAdmin") === 1
                },
                postVersion: post.getNumberFromDB("postVersion"),
                isWIP: post.getNumberFromDB("wip") === 1
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

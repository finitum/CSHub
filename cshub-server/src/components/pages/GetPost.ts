import {app, logger} from "../../";
import {Request, Response} from "express";
import {
    GetPostCallBack,
    GetPost
} from "../../../../cshub-shared/src/api-calls";
import {IPost} from "../../../../cshub-shared/src/models";

import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {hasAccessToPost, postAccessType} from "../../auth/validateRights/PostAccess";

app.post(GetPost.getURL, (req: Request, res: Response) => {

    const postRequest = req.body as GetPost;

    // Check if the user actually has access to the post
    hasAccessToPost(postRequest.postHash, req.cookies["token"])
        .then((approved: postAccessType) => {
            if (!approved.access) {
                res.status(401).send();
            }
            // Get all the post data from database
            getPostData(postRequest.postHash)
                .then((data: GetPostCallBack) => {
                    if (data === null) {
                        res.status(500).send();
                    } else {
                        res.json(data);
                    }
                })
        });
});

export const getPostData = (postHash: number): Promise<GetPostCallBack> => {
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
                 T1.postVersion
          FROM posts T1
                 INNER JOIN users T2 ON T1.author = T2.id
                 INNER JOIN topics T3 ON T1.topic = T3.id
                 LEFT JOIN users T4 ON T1.approvedBy = T4.id
          WHERE T1.hash = ?
          ORDER BY datetime DESC
        `, postHash)
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
                postVersion: post.getNumberFromDB("postVersion")
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

import {app, logger} from "../../";
import {Request, Response} from "express";
import {
    PostCallBack,
    PostRequest
} from "../../../../cshub-shared/api-calls";
import {IPost} from "../../../../cshub-shared/models";

import {DatabaseResultSet, query} from "../../utilities/database-connection";
import {hasAccessToPost} from "../../auth/validateRights/post";

app.post(PostRequest.getURL, (req: Request, res: Response) => {

    const postRequest = req.body as PostRequest;

    // Check if the user actually has access to the post
    hasAccessToPost(postRequest.postHash, req.cookies["token"])
        .then((approved: boolean) => {
            if (!approved) {
                res.status(401).send();
            }
            // Get all the post data from database
            getPostData(postRequest.postHash)
                .then((data: PostCallBack) => {
                    if (data === null) {
                        res.status(500).send();
                    } else {
                        res.json(data);
                    }
                })
        });
});

export const getPostData = (postHash: number): Promise<PostCallBack> => {
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
                 T1.approved,
                 T1.postVersion
          FROM posts T1
                 INNER JOIN users T2 ON T1.author = T2.id
                 INNER JOIN topics T3 ON T1.topic = T3.id
                 LEFT JOIN users T4 ON T1.approvedBy = T4.id
          WHERE T1.hash = ?
          ORDER BY datetime DESC
        `, postHash)
        .then((post: DatabaseResultSet) => {

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
                approved: post.getNumberFromDB("approved") === 1,
                postVersion: post.getNumberFromDB("postVersion")
            };

            return new PostCallBack(postBase);
        })
        .catch(err => {
            logger.error(`Retreiving post data failed`);
            logger.error(err);
            return null;
        });
}
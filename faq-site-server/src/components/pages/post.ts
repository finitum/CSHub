import {app, logger} from "../../";
import {Request, Response} from "express";
import {
    IPostRequest,
    PostCallBack,
    PostPreviewCallBack,
    PostRequest
} from "../../../../faq-site-shared/api-calls";
import {IEdit, IPost, IPostBase, IPostReduced} from "../../../../faq-site-shared/models";

import {getTopicTree} from "../../utilities/topics-utils";
import {DatabaseResultSet, query} from "../../database-connection";
import {hasAccessToPost} from "../../auth/validateRights/post";
import {getTopicFromHash} from "../../../../faq-site-shared/utilities/topics";

app.post(PostRequest.getURL, (req: Request, res: Response) => {

    const postRequest = req.body as IPostRequest;

    // If it just wants the preview object, it can be a 'reduced' object, it won't get all the info and edits
    const isReducedRequest: boolean = postRequest.isReduced;

    // Check if the user actually has access to the post
    hasAccessToPost(postRequest.postHash, req.cookies["token"])
        .then((approved: boolean) => {
            if (!approved) {
                res.status(401).send();
            }
            return getTopicTree();
        })
        .then((topicsResult) => {
            if (topicsResult === null) {
                logger.error(`No topics found, so can't get post data`);
                res.status(500).send();
            } else {
                // Get all the post data from database
                query(`
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
                         T3.hash        AS topicHash,
                         T1.id,
                         T1.approved,
                         T1.approvedBy,
                         T1.rejectedReason,
                         T4.id        AS approvedById,
                         T4.firstname AS approvedByFirstName,
                         T4.lastname  AS approvedByLastName,
                         T4.avatar    AS approvedByAvatar,
                         T4.admin     AS approvedByAdmin
                  FROM posts T1
                         INNER JOIN users T2 ON T1.author = T2.id
                         INNER JOIN topics T3 ON T1.topic = T3.id
                         LEFT JOIN users T4 ON T1.approvedBy = T4.id
                  WHERE T1.hash = ?
                  ORDER BY datetime DESC
                `, postRequest.postHash)
                    .then((post: DatabaseResultSet) => {

                        const postsObj: IPost = null;

                        query(`
                          SELECT T1.id                          AS editId,
                                 T1.content                     AS editContent,
                                 T2.id                          AS editedById,
                                 T2.firstname                   AS editedByFirstName,
                                 T2.lastname                    AS editedByLastName,
                                 T2.avatar                      AS editedByAvatar,
                                 T2.admin                       AS editedByAdmin,
                                 T1.approved,
                                 T3.id                          AS approvedById,
                                 T3.firstname                   AS approvedByFirstName,
                                 T3.lastname                    AS approvedByLastName,
                                 T3.avatar                      AS approvedByAvatar,
                                 T3.admin                       AS approvedByAdmin,
                                 T1.rejectedReason,
                                 T1.datetime
                          FROM edits T1
                                 INNER JOIN users T2 ON T1.editedBy = T2.id
                                 LEFT JOIN users T3 ON T1.approvedBy = T3.id
                          WHERE post = ?
                          ORDER BY datetime DESC
                          LIMIT 0, ?
                        `, post.getNumberFromDB("id"), isReducedRequest ? 1 : 5)
                            .then((edits: DatabaseResultSet) => {

                                const currEdits: IEdit[] = [];

                                // Loop through the edits and construct the edit object
                                for (const edit of edits.convertRowsToResultObjects()) {
                                    currEdits.push({
                                        parentPostId: post.getNumberFromDB("id"),
                                        content: JSON.parse(edit.getStringFromDB("editContent")),
                                        editedBy: {
                                            id: edit.getNumberFromDB("editedById"),
                                            firstname: edit.getStringFromDB("editedByFirstName"),
                                            lastname: edit.getStringFromDB("editedByLastName"),
                                            avatar: edit.getStringFromDB("editedByAvatar"),
                                            admin: edit.getNumberFromDB("authorAdmin") === 1
                                        },
                                        approved: edit.getNumberFromDB("approved") === 1,
                                        approvedBy: {
                                            id: edit.getNumberFromDB("approvedById"),
                                            firstname: edit.getStringFromDB("approvedByFirstName"),
                                            lastname: edit.getStringFromDB("approvedByLastName"),
                                            avatar: edit.getStringFromDB("approvedByAvatar"),
                                            admin: edit.getNumberFromDB("approvedByAdmin") === 1
                                        },
                                        rejectedReason: edit.getStringFromDB("rejectedReason"),
                                        id: edit.getNumberFromDB("id"),
                                        datetime: edit.getStringFromDB("datetime")
                                    });
                                }

                                if (currEdits.length === 0) {
                                    logger.error(`No edits found`);
                                    res.status(500).send();
                                }

                                // Create the postBase object, it will be expanded depending on the type of request (Preview or full, preview has less data)
                                // The author is of typed IUserCensored as it protects a bit of privacy, it doesn't get all their data, just name and avatar
                                const postBase: IPostBase = {
                                    topic: getTopicFromHash(post.getNumberFromDB("topicHash"), topicsResult),
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
                                    approved: post.getNumberFromDB("approved") === 1
                                };

                                // Respond with the correct callback
                                if (isReducedRequest) {
                                    const postObj: IPostReduced = {
                                        ...postBase,
                                        lastEdit: currEdits[0]
                                    };

                                    res.json(new PostPreviewCallBack(postObj));
                                } else {
                                    const postObj: IPost = {
                                        ...postBase,
                                        approvedBy: {
                                            id: post.getNumberFromDB("approvedById"),
                                            firstname: post.getStringFromDB("approvedByFirstName"),
                                            lastname: post.getStringFromDB("approvedByLastName"),
                                            avatar: post.getStringFromDB("approvedByAvatar"),
                                            admin: post.getNumberFromDB("approvedByAdmin") === 1
                                        },
                                        edits: currEdits,
                                        rejectedReason: post.getStringFromDB("rejectedReason")
                                    };

                                    res.json(new PostCallBack(postObj));

                                }
                            })
                            .catch(err => {
                                logger.error(`Retreiving edit data failed`);
                                logger.error(err);
                                res.status(500).send();
                            });
                    })
                    .catch(err => {
                        logger.error(`Retreiving post data failed`);
                        logger.error(err);
                        res.status(500).send();
                    });
            }
        });
});

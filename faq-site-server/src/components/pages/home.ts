import async from "async";
import {Request, Response} from "express";

import {app} from "../../";
import {DatabaseResultSet, query} from "../../database-connection";

import {GetIndexCallBack, GetIndexRequest} from "../../../../faq-site-shared/api-calls";
import {IEdit, IPost} from "../../../../faq-site-shared/models";
import {getTopics} from "./topics";

app.get(GetIndexRequest.getURL, (req: Request, res: Response) => {

    const topics = getTopics();
    topics
        .then((topicsResult) => {
            if (topicsResult === null) {
                res.status(503).send();
            } else {
                query(`
                  SELECT T1.datetime,
                         T1.title,
                         T1.upvotes,
                         T2.id        AS authorId,
                         T2.firstname AS authorFirstName,
                         T2.lastname  AS authorLastName,
                         T2.avatar    AS authorAvatar,
                         T3.name,
                         T3.id        AS topicId,
                         T1.id,
                         T1.approved,
                         T1.approvedBy,
                         T1.rejectedReason,
                         T4.id        AS approvedById,
                         T4.firstname AS approvedByFirstName,
                         T4.lastname  AS approvedByLastName,
                         T4.avatar    AS approvedByAvatar
                  FROM posts T1
                         INNER JOIN users T2 ON T1.author = T2.id
                         INNER JOIN topics T3 ON T1.topic = T3.id
                         LEFT JOIN users T4 ON T1.approvedBy = T4.id
                  WHERE approved = 1
                  ORDER BY datetime DESC
                  LIMIT 5
                `)
                    .then((posts: DatabaseResultSet) => {

                        const postsObj: IPost[] = [];

                        const convertedPostsRows = posts.convertRowsToResultObjects();
                        async.timesSeries(convertedPostsRows.length, (currentRun: number, next) => {

                            const post = convertedPostsRows[currentRun];

                            query(`
                              SELECT T1.id                          AS editId,
                                     CONVERT(T1.content USING utf8) AS editContent,
                                     T2.id                          AS editedById,
                                     T2.firstname                   AS editedByFirstName,
                                     T2.lastname                    AS editedByLastName,
                                     T2.avatar                      AS editedByAvatar,
                                     T1.approved,
                                     T3.id                          AS approvedById,
                                     T3.firstname                   AS approvedByFirstName,
                                     T3.lastname                    AS approvedByLastName,
                                     T3.avatar                      AS approvedByAvatar,
                                     T1.rejectedReason,
                                     T1.datetime
                              FROM edits T1
                                     INNER JOIN users T2 ON T1.editedBy = T2.id
                                     LEFT JOIN users T3 ON T1.approvedBy = T3.id
                              WHERE post = ?
                                AND approved = 1
                            `, post.getNumberFromDB("id"))
                                .then((edits: DatabaseResultSet) => {

                                    const currEdits: IEdit[] = [];

                                    for (const edit of edits.convertRowsToResultObjects()) {
                                        currEdits.push({
                                            parentPostId: post.getNumberFromDB("id"),
                                            content: edit.getStringFromDB("editContent"),
                                            editedBy: {
                                                id: edit.getNumberFromDB("editedById"),
                                                firstname: edit.getStringFromDB("editedByFirstName"),
                                                lastname: edit.getStringFromDB("editedByLastName"),
                                                avatar: edit.getStringFromDB("editedByAvatar")
                                            },
                                            approved: edit.getNumberFromDB("approved") === 1,
                                            approvedBy: {
                                                id: edit.getNumberFromDB("approvedById"),
                                                firstname: edit.getStringFromDB("approvedByFirstName"),
                                                lastname: edit.getStringFromDB("approvedByLastName"),
                                                avatar: edit.getStringFromDB("approvedByAvatar")
                                            },
                                            rejectedReason: edit.getStringFromDB("rejectedReason"),
                                            id: edit.getNumberFromDB("id"),
                                            datetime: edit.getStringFromDB("datetime")
                                        });
                                    }

                                    postsObj.push({
                                        edits: currEdits,
                                        topic: topicsResult.find(x => x.id === post.getNumberFromDB("topicId")),
                                        author: {
                                            id: post.getNumberFromDB("authorId"),
                                            firstname: post.getStringFromDB("authorFirstName"),
                                            lastname: post.getStringFromDB("authorLastName"),
                                            avatar: post.getStringFromDB("authorAvatar")
                                        },
                                        datetime: post.getStringFromDB("datetime"),
                                        title: post.getStringFromDB("title"),
                                        upvotes: post.getNumberFromDB("upvotes"),
                                        id: post.getNumberFromDB("id"),
                                        approved: post.getNumberFromDB("approved") === 1,
                                        approvedBy: {
                                            id: post.getNumberFromDB("approvedById"),
                                            firstname: post.getStringFromDB("approvedByFirstName"),
                                            lastname: post.getStringFromDB("approvedByLastName"),
                                            avatar: post.getStringFromDB("approvedByAvatar")
                                        },
                                        rejectedReason: post.getStringFromDB("rejectedReason")
                                    });

                                    next();
                                });
                        }, () => {
                            const callbackObj = new GetIndexCallBack(postsObj);

                            res.json(callbackObj);
                        });
                    })
                    .catch(err => {
                        res.status(503).send();
                    });
            }
        });
});

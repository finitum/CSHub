import {app} from "../../";
import logger from "../../utilities/Logger";
import {Request, Response} from "express";
import {PostData, GetPostCallBack} from "../../../../cshub-shared/src/api-calls";

import {getRepository} from "typeorm";
import {Post} from "../../db/entities/post";

app.get(PostData.getURL, (req: Request, res: Response) => {

    const hash = req.params.hash;

    // Get all the post data from database
    getPostData(hash)
        .then((data: GetPostCallBack) => {
            if (data === null) {
                res.status(404).send();
            } else {
                res.json(data);
            }
        });
});

export const getPostData = (postHash: number): Promise<GetPostCallBack> => {

    const postRepository = getRepository(Post);

    return postRepository
        .findOne({
            relations: ["topic"],
            where: {
                hash: postHash
            }
        })
        .then(post => {

            if (!post) {
                return new GetPostCallBack(null);
            }

            if (post.author.avatar !== null) {
                post.author.avatar = Buffer.from(post.author.avatar).toString("base64");
            }

            return new GetPostCallBack(post);
        })
        .catch(err => {
            logger.error(`Retreiving post data failed`);
            logger.error(err);
            return null;
        });
};

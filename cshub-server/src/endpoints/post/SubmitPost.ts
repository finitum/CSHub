import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { SubmitPost, CreatePostCallback, SubmitPostResponse } from "../../../../cshub-shared/src/api-calls";
import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import { findTopicInTree, generateRandomTopicHash, getTopicTree } from "../../utilities/TopicsUtils";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { hasAccessToTopicRequest } from "../../auth/validateRights/PostAccess";
import { getRepository } from "typeorm";
import { Post } from "../../db/entities/post";
import { Topic } from "../../db/entities/topic";

app.post(SubmitPost.getURL, async (req: Request, res: Response) => {
    const submitPostRequest: SubmitPost = req.body as SubmitPost;
    const userObj = checkTokenValidityFromRequest(req);
    const inputsValidation = validateMultipleInputs(
        {
            input: submitPostRequest.postTitle,
            validationObject: {
                minlength: 4,
                maxlength: 50
            }
        },
        { input: submitPostRequest.postTopicHash },
        { input: submitPostRequest.isIndex },
        { input: submitPostRequest.isExample }
    );

    if (submitPostRequest.isIndex && submitPostRequest.isExample) {
        return res.status(400).json(new ServerError("Can't be both index and example!"));
    }

    const postRepository = getRepository(Post);
    const topicRepository = getRepository(Topic);

    if (!inputsValidation.valid) {
        return res.status(400).json(new CreatePostCallback(SubmitPostResponse.INVALIDINPUT));
    } else if (!userObj) {
        return res.sendStatus(401);
    }

    // Test if the user can actually add posts to this topic
    const topicAccess = await hasAccessToTopicRequest(submitPostRequest.postTopicHash, req);
    if (!topicAccess.canEdit) {
        res.send(403).json(new ServerError("No access"));
    }

    // test if there is a topic tree at all
    const topicTree = await getTopicTree();
    if (topicTree === null) {
        logger.error(`No topics found`);
        return res.sendStatus(500);
    }

    const topic = await topicRepository.find({ hash: submitPostRequest.postTopicHash });
    if (topic.length == 0) {
        return res.sendStatus(400);
    }

    // Check if a post with the same title already exists
    const numPostsWithSameTitle = await postRepository.count({ title: submitPostRequest.postTitle, topic: topic[0] });
    if (numPostsWithSameTitle > 0) {
        return res.status(409).json(new ServerError("Post with name in this topic already exists"));
    }

    const isIndexResult = await postRepository.find({ isIndex: true, topic: topic[0] });

    if (isIndexResult.length > 0 && submitPostRequest.isIndex) {
        return res.status(409).json(new ServerError("This topic already has an index"));
    }

    const topicHash = await generateRandomTopicHash();

    if (typeof topicHash === "undefined") {
        return res.sendStatus(500);
    }

    const requestTopic = findTopicInTree(submitPostRequest.postTopicHash, topicTree);

    if (!requestTopic) {
        return res.sendStatus(500);
    }

    try {
        await postRepository.save([
            {
                topic: requestTopic,
                title: submitPostRequest.postTitle,
                hash: topicHash,
                isIndex: submitPostRequest.isIndex,
                isExample: submitPostRequest.isExample
            }
        ]);

        return res.status(201).json(new CreatePostCallback(SubmitPostResponse.SUCCESS, topicHash));
    } catch (err) {
        logger.error(`Inserting into db failed`);
        logger.error(err);
        return res.status(500).send();
    }
});

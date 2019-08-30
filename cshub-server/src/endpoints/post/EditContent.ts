import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { validateMultipleInputs } from "../../utilities/StringUtils";

import { EditContent, GetEditContentCallback } from "../../../../cshub-shared/src/api-calls";

import { Edit } from "../../db/entities/edit";
import { getRepository } from "typeorm";
import { Post } from "../../db/entities/post";

app.get(EditContent.getURL, async (req: Request, res: Response) => {
    const postHash = Number(req.params.hash);
    const includeLastEdit = !(req.header(EditContent.includeLastEditHeader) === "true");

    const inputsValidation = validateMultipleInputs({ input: postHash });

    if (inputsValidation.valid) {
        const postRepository = getRepository(Post);

        const post = await postRepository.findOne({
            where: {
                hash: postHash
            }
        });

        if (!post) {
            return res.sendStatus(404);
        }

        const editRepository = getRepository(Edit);

        editRepository
            .find({
                relations: ["editusers"],
                where: {
                    post
                },
                order: {
                    datetime: "DESC"
                }
            })
            .then(edits => {
                if (edits.length > 0) {
                    if (!edits[0].approved && !includeLastEdit) {
                        edits.shift();
                    }
                }

                res.json(new GetEditContentCallback(edits));
            })
            .catch(err => {
                logger.error(`Edit content retrieve failed`);
                logger.error(err);
                res.status(500).send();
            });
    } else {
        res.status(401).send();
    }
});

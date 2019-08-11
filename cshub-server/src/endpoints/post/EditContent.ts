import { Request, Response } from "express";

import { app } from "../../";
import logger from "../../utilities/Logger";

import { validateMultipleInputs } from "../../utilities/StringUtils";

import { EditContent, GetEditContentCallback } from "../../../../cshub-shared/src/api-calls";

import { Edit } from "../../db/entities/edit";
import { getRepository } from "typeorm";

app.get(EditContent.getURL, (req: Request, res: Response) => {
    const postHash: number = req.params.hash;
    const includeLastEdit = !(req.header(EditContent.includeLastEditHeader) === "true");

    const inputsValidation = validateMultipleInputs({ input: postHash });

    if (inputsValidation.valid) {
        const editRepository = getRepository(Edit);

        editRepository
            .find({
                relations: ["editusers"],
                where: {
                    post: {
                        hash: postHash
                    }
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

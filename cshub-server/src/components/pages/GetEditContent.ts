import {Request, Response} from "express";

import {app, logger} from "../../";

import {validateMultipleInputs} from "../../utilities/StringUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";
import {hasAccessToPost} from "../../auth/validateRights/PostAccess";

import {GetEditContent, GetEditContentCallback} from "../../../../cshub-shared/api-calls";

// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import moment, {Moment} from "moment";

app.post(GetEditContent.getURL, (req: Request, res: Response) => {

    const getEditContent: GetEditContent = req.body as GetEditContent;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({input: getEditContent.postHash});

    if (inputsValidation.valid && userObj.valid) {
        hasAccessToPost(getEditContent.postHash, req.cookies["token"])
            .then((approved: boolean) => {
                if (approved) {
                    query(`
                      SELECT T1.content, T1.datetime
                      FROM edits T1
                             INNER JOIN posts T2 ON T1.post = T2.id
                      WHERE T2.hash = ?
                    `, getEditContent.postHash)
                        .then((deltas: DatabaseResultSet) => {

                            const deltaArray: {delta: Delta, datetime: Moment}[] = [];

                            for (const delta of deltas.convertRowsToResultObjects()) {
                                deltaArray.push({
                                    delta: JSON.parse(delta.getStringFromDB("content")),
                                    datetime: moment(delta.getStringFromDB("datetime"))
                                });
                            }

                            deltaArray.sort((left, right) => {
                                return moment.utc(left.datetime).diff(moment.utc(right.datetime))
                            });

                            const deltaSorted: Delta[] = [];

                            for (const delta of deltaArray) {
                                deltaSorted.push(delta.delta);
                            }

                            res.json(new GetEditContentCallback(deltaSorted));
                        })
                        .catch(err => {
                            logger.error(`Editing failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                } else {
                    res.status(401).send();
                }
            });
    } else {
        res.status(401).send();
    }

});

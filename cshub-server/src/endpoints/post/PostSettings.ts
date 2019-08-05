import {app} from "../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../db/database-query";
import {checkTokenValidityFromRequest} from "../../auth/AuthMiddleware";
import {PostSettings, PostSettingsCallback, PostSettingsEditType} from "../../../../cshub-shared/src/api-calls";

app.put(PostSettings.getURL, async (req: Request, res: Response) => {

    const postHash: number = +req.params.hash;
    const action: string = req.params.action;

    if (typeof action === "undefined" || isNaN(postHash)) {
        res.sendStatus(400);
    }

    const token = checkTokenValidityFromRequest(req);

    if (token.valid) {
        switch (action) {
            case PostSettingsEditType[PostSettingsEditType.HIDE].toLowerCase():
                if (token.tokenObj.user.admin) {
                    deletePost(res, postHash);
                } else {
                    res.status(403).send();
                }
                break;
            case PostSettingsEditType[PostSettingsEditType.WIP].toLowerCase():
                if (token.tokenObj.user.admin) {
                    await wipPost(res, postHash);
                } else {
                    res.status(403).send();
                }
                break;
            default:
                res.status(400).json({
                    error: new Error("Did not understand the PostSettingsEditType")
                })
        }
    } else {
        res.status(403).send();
    }
});

async function isWip(postHash: number): Promise<boolean> {
    const result: DatabaseResultSet = await query(`
        SELECT wip
        FROM posts
        WHERE hash = ?
    `, postHash);

    return result.getNumberFromDB("wip") === 1;
}

const wipPost = async (res: Response, postHash: number) => {

    const isCurrentlyWip: boolean = await isWip(postHash);

    query(`
        UPDATE posts
        SET postVersion = postVersion + 1,
            wip         = ?
        WHERE hash = ?
    `, !isCurrentlyWip, postHash)
        .then(() => {
            res.json(new PostSettingsCallback());
        });

};

const deletePost = (res: Response, postHash: number) => {
    query(`
        UPDATE posts
        SET postVersion = postVersion + 1,
            deleted     = 1,
            title       = CONCAT('deleted_', title)
        WHERE hash = ?
    `, postHash)
        .then(() => {
            res.json(new PostSettingsCallback());
        });
};

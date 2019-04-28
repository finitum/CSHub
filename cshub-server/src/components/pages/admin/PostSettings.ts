import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {PostSettings, PostSettingsCallback, PostSettingsEditType} from "../../../../../cshub-shared/src/api-calls";
import {ServerError} from "../../../../../cshub-shared/src/models/ServerError";

app.put(PostSettings.getURL, async (req: Request, res: Response) => {

    const postHash: number = +req.params.hash;
    const action: string = req.params.action;

    if (typeof action === "undefined" || isNaN(postHash)) {
        res.sendStatus(400);
    }

    const token = checkTokenValidity(req);

    if (token.valid) {
        switch (action) {
            case PostSettingsEditType[PostSettingsEditType.HIDE].toLowerCase():
                if (token.tokenObj.user.admin) {
                    deletePost(res, postHash);
                } else {
                    res.status(403).send();
                }
                break;
            case PostSettingsEditType[PostSettingsEditType.FAVORITE].toLowerCase():
                await favoritePost(res, postHash, token.tokenObj.user.id);
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

async function isFavourite(postHash: number, userId: number): Promise<boolean> {
    const result: DatabaseResultSet = await query(`
        SELECT id
        FROM favorites
        WHERE post = (SELECT id FROM posts WHERE hash = ?) AND user = ?
        LIMIT 1
        `, postHash, userId);

    return result.getRows().length === 1;
}

const favoritePost = async (res: Response, postHash: number, userId: number) => {

    const favorite = await isFavourite(postHash, userId);

    if (!favorite) {
        query(`
            SELECT isIndex
            FROM posts
            WHERE hash = ?
        `, postHash)
            .then((result: DatabaseResultSet) => {
                if (result.getNumberFromDB("isIndex") === 0) {
                    query(`
                        INSERT IGNORE INTO favorites
                        SET user = ?,
                            post = (SELECT id FROM posts WHERE hash = ?)
                    `, userId, postHash)
                        .then(() => {
                            res.status(200).json(new PostSettingsCallback());
                        });
                } else {
                    res.status(400).send(new ServerError("You can't favorite an index post (and in the client you shouldn't be able to...)"));
                }
            });
    } else {
        query(`
            DELETE
            FROM favorites
            WHERE user = ?
              AND post = (SELECT id FROM posts WHERE hash = ?)
        `, userId, postHash)
            .then(() => {
                res.json(new PostSettingsCallback());
            });
    }
};

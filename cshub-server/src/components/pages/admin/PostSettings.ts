import {app} from "../../../";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {HidePostCallBack, PostSettings, PostSettingsEditType} from "../../../../../cshub-shared/src/api-calls";
import {ServerError} from "../../../../../cshub-shared/src/models/ServerError";

app.post(PostSettings.getURL, (req: Request, res: Response) => {

    const postSettingsRequest = req.body as PostSettings;

    const token = checkTokenValidity(req);

    if (token.valid) {

        switch (postSettingsRequest.editType) {
            case PostSettingsEditType.HIDE:
                if (token.tokenObj.user.admin) {
                    deletePost(res, postSettingsRequest.postHash);
                } else {
                    res.status(403).send();
                }
                break;
            case PostSettingsEditType.FAVORITE:
                favoritePost(res, postSettingsRequest.postHash, token.tokenObj.user.id, postSettingsRequest.favorite);
                break;
        }

    } else {
        res.status(403).send();
    }
});

const deletePost = (res: Response, postHash: number) => {
    query(`
      UPDATE posts
      SET postVersion = postVersion + 1,
          deleted     = 1
      WHERE hash = ?
    `, postHash)
        .then(() => {
            res.json(new HidePostCallBack());
        });
};

const favoritePost = (res: Response, postHash: number, userId: number, favorite: boolean) => {
    if (favorite) {
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
                            res.json(new HidePostCallBack());
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
                res.json(new HidePostCallBack());
            });
    }

};

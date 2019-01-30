import {app} from "../../../";
import {Request, Response} from "express";
import {query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {HidePostCallBack, PostSettings, PostSettingsEditType} from "../../../../../cshub-shared/src/api-calls";

app.post(PostSettings.getURL, (req: Request, res: Response) => {

    const postSettingsRequest = req.body as PostSettings;

    const token = checkTokenValidity(req);

    if (token.valid && token.tokenObj.user.admin) {

        switch (postSettingsRequest.editType) {
            case PostSettingsEditType.HIDE:
                deletePost(res, postSettingsRequest.postHash);
                break;
            case PostSettingsEditType.FAVORITE:
                favoritePost(res, postSettingsRequest.postHash, token.tokenObj.user.id, postSettingsRequest.favorite);
                break;
        }

    } else {
        res.status(401).send();
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
          INSERT IGNORE INTO favorites
          SET user = ?,
              post = (SELECT id FROM posts WHERE hash = ?)
        `, userId, postHash)
            .then(() => {
                res.json(new HidePostCallBack());
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

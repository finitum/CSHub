import {app} from "../../../";
import {
    ChangeUserAvatar,
    ChangeUserAvatarCallback,
    ChangeUserAvatarResponseTypes
} from "../../../../../cshub-shared/src/api-calls";
import {Request, Response} from "express";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import sharp from "sharp";
import {query} from "../../../utilities/DatabaseConnection";

app.post(ChangeUserAvatar.getURL, (req: Request, res: Response) => {

    const userDashboardChangeAvatarRequest = req.body as ChangeUserAvatar;

    const token = checkTokenValidity(req);

    if (token.valid) {

        const base64stripped = userDashboardChangeAvatarRequest.imageb64.replace(/data:image\/(.+);base64,/, "");

        const imageBuff = Buffer.from(base64stripped, "base64");

        let bufferData;

        sharp(imageBuff)
            .resize({
                width: 100
            })
            .jpeg({
                quality: 40
            })
            .toBuffer()
            .then((bufferDataJPG) => {
                bufferData = bufferDataJPG;
                return query(`
                    UPDATE users
                    SET avatar = ?
                    WHERE id = ?
                `, bufferData, token.tokenObj.user.id)
            })
            .then(() => {
                res.json(new ChangeUserAvatarCallback(ChangeUserAvatarResponseTypes.SUCCESS, Buffer.from(bufferData).toString("base64")));
            })
            .catch(() => {
                res.json(new ChangeUserAvatarCallback(ChangeUserAvatarResponseTypes.INVALIDIMAGE));
            });
    } else {
        res.status(401).send();
    }
});

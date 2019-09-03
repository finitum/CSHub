import { app } from "../../";
import { ChangeAvatar, ChangeAvatarCallback } from "../../../../cshub-shared/src/api-calls";
import { Request, Response } from "express";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import sharp from "sharp";
import { query } from "../../db/database-query";

app.post(ChangeAvatar.getURL, (req: Request, res: Response) => {
    const userDashboardChangeAvatarRequest = req.body as ChangeAvatar;

    const token = checkTokenValidityFromRequest(req);

    if (token) {
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
            .then(bufferDataJPG => {
                bufferData = bufferDataJPG;
                return query(
                    `
                    UPDATE users
                    SET avatar = ?
                    WHERE id = ?
                `,
                    bufferData,
                    token.user.id
                );
            })
            .then(() => {
                res.json(new ChangeAvatarCallback(Buffer.from(bufferData).toString("base64")));
            })
            .catch(() => {
                res.status(400).json(new ChangeAvatarCallback(false));
            });
    } else {
        res.status(401).send();
    }
});

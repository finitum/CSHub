import {Request, Response} from "express";

import {app} from "../../";

import {RefreshResponseType, RefreshTokenCallback} from "../../../../cshub-shared/src/api-calls";

import {checkTokenValidityFromRequest, ValidationType} from "../../auth/AuthMiddleware";
import {RefreshToken} from "../../../../cshub-shared/src/api-calls/endpoints/user";
import {sign} from "../../auth/JWTHandler";
import {Settings} from "../../settings";

app.get(RefreshToken.getURL, (req: Request, res: Response) => {
    const token: ValidationType = checkTokenValidityFromRequest(req);

    if (token) {
        const new_jwt = sign(token.user);

        res.cookie("token", new_jwt,{
            maxAge: Settings.TOKENAGEMILLISECONDS,
            domain: Settings.DOMAIN
        });

        res.json(new RefreshTokenCallback(RefreshResponseType.SUCCESS));
    } else {
        res.json(new RefreshTokenCallback(RefreshResponseType.INVALIDTOKEN));
    }
});

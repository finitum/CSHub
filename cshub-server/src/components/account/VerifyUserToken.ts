import {Request, Response} from "express";

import {app} from "../../";

import {
    VerifyUserToken,
    VerifyUserTokenCallback,
    VerifyUserTokenResponseTypes
} from "../../../../cshub-shared/src/api-calls";

import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.get(VerifyUserToken.getURL, (req: Request, res: Response) => {

    const tokenVailidity = checkTokenValidity(req);

    if (tokenVailidity.valid) {
        res.json(new VerifyUserTokenCallback(VerifyUserTokenResponseTypes.VALID, tokenVailidity.tokenObj.user));
    } else {
        res.status(400).json(new VerifyUserTokenCallback(VerifyUserTokenResponseTypes.INVALID));
    }
});

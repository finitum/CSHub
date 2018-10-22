import {Request, Response} from "express";

import {app} from "../../";

import {
    VerifyTokenRequest,
    VerifyTokenRequestCallBack,
    VerifyTokenResponses
} from "../../../../cshub-shared/api-calls";

import {checkTokenValidity} from "../../auth/middleware";

app.get(VerifyTokenRequest.getURL, (req: Request, res: Response) => {

    const tokenVailidity = checkTokenValidity(req);

    if (tokenVailidity.valid) {
        res.json(new VerifyTokenRequestCallBack(VerifyTokenResponses.VALID, tokenVailidity.tokenObj.user));
    } else {
        res.json(new VerifyTokenRequestCallBack(VerifyTokenResponses.INVALID));
    }
});

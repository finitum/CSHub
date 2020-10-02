import { Application, Request, Response } from "express";

import { VerifyToken, VerifyUserTokenCallback } from "../../../../cshub-shared/src/api-calls";

import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";

export function registerVerifyTokenEndpoint(app: Application): void {
    app.get(VerifyToken.getURL, (req: Request, res: Response) => {
        const tokenVailidity = checkTokenValidityFromRequest(req);

        if (tokenVailidity) {
            res.json(new VerifyUserTokenCallback(tokenVailidity.user));
        } else {
            res.json(new VerifyUserTokenCallback(false));
        }
    });
}

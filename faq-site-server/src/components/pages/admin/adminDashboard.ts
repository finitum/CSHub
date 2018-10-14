import {app, logger} from "../../../";
import {GetAllUsersRequest} from "../../../../../faq-site-shared/api-calls/admin";
import {Request, Response} from "express";
import {checkTokenValidity} from "../../../auth/middleware";
import {DatabaseResultSet, query} from "../../../database-connection";
import {IUser} from "../../../../../faq-site-shared/models";

app.get(GetAllUsersRequest.getURL, (req: Request, res: Response) => {
    const GetAllUsersRequest = req.body as GetAllUsersRequest;

    const token = checkTokenValidity(req);

    // Check if token is valid and user is admin
    if(token.valid && token.tokenObj.user.admin) {

    }
});

export const getAllUsers = (): Promise<IUser[] | null> => {
    query(`
        SELECT id,email,admin,created,blocked,verified,firstname,lastname
        FROM users
    `).then((users: DatabaseResultSet) => {

        const usersParsed: IUser[] = [];

    });

    return;
};
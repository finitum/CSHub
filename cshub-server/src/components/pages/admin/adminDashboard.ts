import {app, logger} from "../../../";
import {GetAllUsersCallBack, GetAllUsersRequest} from "../../../../../cshub-shared/api-calls/admin";
import {Request, Response} from "express";
import {checkTokenValidity} from "../../../auth/middleware";
import {DatabaseResultSet, query} from "../../../utilities/database-connection";
import {IUser} from "../../../../../cshub-shared/models";

app.post(GetAllUsersRequest.getURL, (req: Request, res: Response) => {
    const getAllUsersRequest = req.body as GetAllUsersRequest;

    const token = checkTokenValidity(req);

    // Check if token is valid and user is admin
    if (token.valid && token.tokenObj.user.admin) {

        query(`
        SELECT id, email, firstname, lastname, blocked, verified, admin, avatar
        FROM users
        LIMIT ?, ?
        `, (getAllUsersRequest.page - 1) * getAllUsersRequest.rowsPerPage, getAllUsersRequest.rowsPerPage)
            .then((data: DatabaseResultSet) => {

                const users: IUser[] = [];

                for (const userRow of data.convertRowsToResultObjects()) {
                    users.push({
                        id: userRow.getNumberFromDB("id"),
                        admin: userRow.getNumberFromDB("admin") === 1,
                        firstname: userRow.getStringFromDB("firstname"),
                        lastname: userRow.getStringFromDB("lastname"),
                        avatar: userRow.getStringFromDB("avatar"),
                        email: userRow.getStringFromDB("email"),
                        blocked: userRow.getNumberFromDB("blocked") === 1,
                        verified: userRow.getNumberFromDB("verified") === 1
                    });
                }

                query(`
                    SELECT COUNT(*) as count
                    FROM users
                `)
                    .then((countResult: DatabaseResultSet) => {
                        const count = countResult.getNumberFromDB("count");
                        res.json(new GetAllUsersCallBack(users, count));
                    });
            });
    }
});

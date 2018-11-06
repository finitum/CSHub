import {app, logger} from "../../../";
import {GetAllUsersCallBack, GetAllUsers} from "../../../../../cshub-shared/api-calls/admin";
import {Request, Response} from "express";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {IUser} from "../../../../../cshub-shared/models";

app.post(GetAllUsers.getURL, (req: Request, res: Response) => {
    const getAllUsersRequest = req.body as GetAllUsers;

    const token = checkTokenValidity(req);

    // Check if token is valid and user is admin
    if (token.valid && token.tokenObj.user.admin) {

        query(`
        SELECT id, email, firstname, lastname, blocked, verified, admin
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
                        avatar: "",
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

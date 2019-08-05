import {app} from "../../";
import {AllUsers, AllUsersCallBack} from "../../../../cshub-shared/src/api-calls";
import {Request, Response} from "express";
import {checkTokenValidityFromRequest} from "../../auth/AuthMiddleware";
import {DatabaseResultSet, query} from "../../db/database-query";
import {IUser} from "../../../../cshub-shared/src/models";

app.get(AllUsers.getURL, (req: Request, res: Response) => {
    const page = Number(req.params.page);
    let rowsPerPage = Number(req.query.rowsPerPage);

    const token = checkTokenValidityFromRequest(req);

    // Check if token is valid and user is admin
    if (token.valid && token.tokenObj.user.admin) {

        rowsPerPage = rowsPerPage === -1 ? 4242424242 : rowsPerPage;

        query(`
        SELECT id, email, firstname, lastname, blocked, verified, admin
        FROM users
        LIMIT ?, ?
        `, (page - 1) * rowsPerPage, rowsPerPage)
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
                        res.json(new AllUsersCallBack(users, count));
                    });
            });
    } else {
        res.sendStatus(403);
    }
});

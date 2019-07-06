import {Request, Response} from "express";

import {app} from "../../";
import {Requests} from "../../../../cshub-shared/src/api-calls";
import logger from "../../utilities/Logger";
import {ServerError} from "../../../../cshub-shared/src/models/ServerError";
import {DatabaseResultSet, query} from "../../db/database-query";
import * as fs from "fs";

app.get(Requests.PROFILE, (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);

    if (!isNaN(userId)) {
        query(`
                SELECT avatar
                FROM users
                WHERE id = ?
                `, userId)
            .then((result: DatabaseResultSet) => {

                if (result.getRows().length === 0) {
                    logger.error("User doesn't exist");
                    res.status(404).send(new ServerError("User does not exist"));
                } else {

                    const avatar = result.getBlobFromDB("avatar");

                    if (avatar !== null) {

                        res.writeHead(200, {
                            "Content-Type": "image/png",
                            "Content-Length": avatar.length
                        });
                        res.end(avatar);
                    } else {
                        fs.readFile(`${__dirname}/defaultAvatar.png`, (err, avatar) => {
                            res.writeHead(200, {
                                "Content-Type": "image/png",
                                "Content-Length": avatar.length
                            });
                            res.end(avatar);
                        });
                    }

                }
            })
    } else {
        logger.error("Userid not a number");
        res.status(400).send(new ServerError("The userid in the URL is not a number"));
    }
});

import { Request, Response } from "express";

import { app } from "../../";
import logger from "../..//utilities/Logger";

import { Requests } from "../../../../cshub-shared/src/api-calls";

import { Settings } from "../../settings";
import { query } from "../../db/database-query";
import { parseStringQuery } from "../../utilities/query-parser";

app.get(Requests.VERIFYMAIL, (req: Request, res: Response) => {
    const hashQuery = parseStringQuery(req, res, "hash");
    if (!hashQuery) return;
    const hash = +hashQuery;

    const userIDQuery = parseStringQuery(req, res, "accId");
    if (!userIDQuery) return;
    const userID = +userIDQuery;

    if (!isNaN(hash) && !isNaN(userID)) {
        query(
            `
        UPDATE users
        SET verified = 1
        WHERE verifyhash = ? AND id = ?
        `,
            hash,
            userID,
        )
            .then(() => {
                res.redirect(`${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}`);
            })
            .catch((err) => {
                logger.error("Error while verifying email");
                logger.error(err);
                res.status(500).send();
            });
    } else {
        logger.error("Error while verifying email, wrong hashes");
        res.status(500).send();
    }
});

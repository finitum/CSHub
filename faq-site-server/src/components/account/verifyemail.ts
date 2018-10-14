import {Request, Response} from "express";

import {app, logger} from "../../";

import {
    NonAuthRequests
} from "../../../../faq-site-shared/api-calls";

import {Settings} from "../../settings";
import {query} from "../../database-connection";

app.get(NonAuthRequests.VERIFYMAIL, (req: Request, res: Response) => {

    const hash = parseInt(req.query.hash, 10);
    const userID = parseInt(req.query.accId, 10);

    if (!isNaN(hash) && !isNaN(userID)) {
        query(`
        UPDATE users
        SET verified = 1
        WHERE verifyhash = ? AND id = ?
        `, hash, userID)
            .then(() => {
                res.redirect(Settings.SITEADDRESS);
            })
            .catch(err => {
                logger.error("Error while verifying email");
                logger.error(err);
                res.status(500).send();
            });
    } else {
        logger.error("Error while verifying email, wrong hashes");
        res.status(500).send();
    }

});

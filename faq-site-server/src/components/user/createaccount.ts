import crypto from "crypto";
import {Request, Response} from "express";

import {app, logger} from "../../";
import {Settings} from "../../settings";
import {DatabaseResultSet, query} from "../../database-connection";

import {CreateAccountRequest, CreateAccountRequestCallBack, CreateAccountResponses} from "../../../../faq-site-shared/api-calls";
import {validateMultipleInputs} from "../../utilities/string-utils";
import {secretKey} from "../../auth/jwt-key";

app.post(CreateAccountRequest.getURL, (req: Request, res: Response) => {

    const createAccountRequest: CreateAccountRequest = req.body as CreateAccountRequest;

    // Here a custom validator validates our input based on a few arguments (some are implied, see the validator). Then it gets back an object, of which we only use the valid field. We could also handle some errors more gracefully, which more logging
    const inputsValidation = validateMultipleInputs({
        input: createAccountRequest.password,
        validationObject: {
            length: 8
        }
    }, {input: createAccountRequest.email}, {input: createAccountRequest.firstname}, {input: createAccountRequest.lastname});

    if (inputsValidation.valid) {

        query(`
            SELECT id
            FROM users
            WHERE email = ?
            `, createAccountRequest.email)
            .then((result: DatabaseResultSet) => {

                // It checks whether the user doesn't already exist. If not, hash the password 45000 times and insert the user into the database. If nothing gives any errors, send the callback with a succes message, otherwise it will give the corresponding message
                if (result.getRows().length === 0) {
                    crypto.pbkdf2(createAccountRequest.password, secretKey, Settings.PASSWORDITERATIONS, 64, "sha512", (err: Error | null, derivedKey: Buffer) => {

                        query(`
                            INSERT INTO users
                            SET email = ?, password = ?, firstname = ?, lastname = ?
                            `, createAccountRequest.email, derivedKey.toString("hex"), createAccountRequest.firstname, createAccountRequest.lastname)
                            .then(() => {
                                res.json(new CreateAccountRequestCallBack(CreateAccountResponses.SUCCESS));
                            })
                            .catch(err => {
                                logger.error(`Inserting into users table failed`);
                                logger.error(err);
                                res.status(500).send();
                            });
                    });
                } else {
                    res.json(new CreateAccountRequestCallBack(CreateAccountResponses.ALREADYEXISTS));
                }
            })
            .catch(err => {
                logger.error(`Selecting from users failed`);
                logger.error(err);
                res.status(500).send();
            });

    } else {
        res.json(new CreateAccountRequestCallBack(CreateAccountResponses.INVALIDINPUT));
    }

});

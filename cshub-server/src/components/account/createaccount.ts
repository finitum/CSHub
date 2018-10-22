import {Request, Response} from "express";

import {app, logger} from "../../";
import {DatabaseResultSet, query} from "../../utilities/database-connection";

import {CreateAccountRequest, CreateAccountRequestCallBack, CreateAccountResponses} from "../../../../cshub-shared/api-calls";
import {validateMultipleInputs} from "../../utilities/string-utils";
import {hashPassword} from "../../auth/hashPassword";
import {sendMail, sendVerificationEmail} from "../../utilities/mail-connection";

app.post(CreateAccountRequest.getURL, (req: Request, res: Response) => {

    const createAccountRequest: CreateAccountRequest = req.body as CreateAccountRequest;

    // Here a custom validator validates our input based on a few arguments (some are implied, see the validator). Then it gets back an object, of which we only use the valid field. We could also handle some errors more gracefully, which more logging
    const inputsValidation = validateMultipleInputs({
        input: createAccountRequest.password,
        validationObject: {
            minlength: 8
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
                    hashPassword(createAccountRequest.password)
                        .then((hashedValue: string) => {
                            query(`
                            INSERT INTO users
                            SET email = ?, password = ?, firstname = ?, lastname = ?
                            `, createAccountRequest.email, hashedValue, createAccountRequest.firstname, createAccountRequest.lastname)
                                .then((result: DatabaseResultSet) => {
                                    sendVerificationEmail(createAccountRequest.email, createAccountRequest.firstname, result.getInsertId());
                                    res.json(new CreateAccountRequestCallBack(CreateAccountResponses.SUCCESS));
                                })
                                .catch(err => {
                                    logger.error(`Inserting into users table failed`);
                                    logger.error(err);
                                    res.status(500).send();
                                });
                        })
                        .catch((err) => {
                            logger.error(`Hashing password for creating account failed`);
                            logger.error(err);
                            res.status(500).send();
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

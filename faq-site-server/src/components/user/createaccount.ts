import crypto from "crypto";
import {Request, Response} from "express";

import {app} from "../../";

import {CreateAccountRequest, CreateAccountRequestCallBack, CreateAccountResponses} from "../../../../faq-site-shared/api-calls";
import {validateMultipleInputs} from "../../utilities/string-utils";
import {secretKey} from "../../auth/jwt-key";
import {DatabaseResultSet, query} from "../../database-connection";


app.post(CreateAccountRequest.getURL, (req: Request, res: Response) => {

    const createAccountRequest: CreateAccountRequest = req.body as CreateAccountRequest;

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

                if (result.getRows().length === 0) {
                    crypto.pbkdf2(createAccountRequest.password, secretKey, 45000, 64, "sha512", (err: Error | null, derivedKey: Buffer) => {

                        query(`
                            INSERT INTO users
                            SET email = ?, password = ?, firstname = ?, lastname = ?
                            `, createAccountRequest.email, derivedKey.toString("hex"), createAccountRequest.firstname, createAccountRequest.lastname)
                            .then(() => {
                                res.json(new CreateAccountRequestCallBack(CreateAccountResponses.SUCCESS));
                            })
                            .catch(err => {
                                res.status(500).send();
                            });
                    });
                } else {
                    res.json(new CreateAccountRequestCallBack(CreateAccountResponses.ALREADYEXISTS));
                }
            })
            .catch(err => {
                res.status(500).send();
            });

    } else {
        res.json(new CreateAccountRequestCallBack(CreateAccountResponses.INVALIDINPUT));
    }

});

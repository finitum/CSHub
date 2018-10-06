import crypto from "crypto";
import {Request, Response} from "express";

import {app} from "../../index";

import {LoginRequest, LoginRequestCallBack, LoginResponses} from "../../../../faq-site-shared/api-calls/index";
import {IUser} from "../../../../faq-site-shared/models/IUser";

import {DatabaseResultSet, query} from "../../database-connection";

import {secretKey} from "../../auth/jwt-key";
import {sign} from "../../auth/jwt";
import {customValidator} from "../../utilities/string-utils";

app.post(LoginRequest.getURL, (req: Request, res: Response) => {

    const loginRequest: LoginRequest = req.body as LoginRequest;

    if (customValidator({
        input: loginRequest.password,
        validationObject: {
            length: 8
        }
    }).valid && customValidator({input: loginRequest.email}).valid) {
        crypto.pbkdf2(loginRequest.password, secretKey, 45000, 64, "sha512", (err: Error | null, derivedKey: Buffer) => {

            query(`
                SELECT email, id, firstname, lastname, rank, blocked, verified, password, avatar
                FROM users
                WHERE email = ?
                `, loginRequest.email)
                    .then((result: DatabaseResultSet) => {

                        if (result.getRows().length === 0) {
                            res.json(new LoginRequestCallBack(LoginResponses.NOEXISTINGACCOUNT));
                        } else if (result.getStringFromDB("password") === derivedKey.toString("hex")) {

                            if (result.getNumberFromDB("blocked") === 1) {
                                res.json(new LoginRequestCallBack(LoginResponses.ACCOUNTBLOCKED));
                            } else if (result.getNumberFromDB("verified") === 0) {
                                res.json(new LoginRequestCallBack(LoginResponses.ACCOUNTNOTVERIFIED));
                            } else {
                                delete result[0].password;

                                const userModel: IUser = {
                                    id: result.getNumberFromDB("id"),
                                    email: result.getStringFromDB("email"),
                                    rank: result.getNumberFromDB("rank"),
                                    blocked: result.getNumberFromDB("blocked"),
                                    verified: result.getNumberFromDB("verified"),
                                    firstname: result.getStringFromDB("firstname"),
                                    lastname: result.getStringFromDB("lastname"),
                                    avatar: result.getStringFromDB("avatar")
                                };

                                const jwt = sign(userModel);

                                res.cookie("token", jwt, {
                                    maxAge: 7200
                                });

                                res.json(new LoginRequestCallBack(LoginResponses.SUCCESS, userModel));
                            }

                        } else {
                            res.json(new LoginRequestCallBack(LoginResponses.INCORRECTPASS));
                        }

                    })
                    .catch(err => {
                        res.status(503).send();
                    });

        });
    } else {
        res.json(new LoginRequestCallBack(LoginResponses.INVALIDINPUT));
    }


});

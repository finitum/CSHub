import crypto from "crypto";
import {Request, Response} from "express";

import {app} from "../../index";

import {LoginRequest, LoginRequestCallBack, LoginResponses} from "../../../../faq-site-shared/api-calls/index";
import {UserModel} from "../../../../faq-site-shared/models/UserModel";

import {getNumberFromDB, getStringFromDB, query} from "../../database-connection";

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
                SELECT email, firstname, lastname, rank, blocked, verified, password
                FROM users
                WHERE email = ?
                `, loginRequest.email)
                    .then((result: any) => {

                        if (result.length === 0) {
                            res.json(new LoginRequestCallBack(LoginResponses.NOEXISTINGACCOUNT));
                        } else if (getStringFromDB("password", result) === derivedKey.toString("hex")) {

                            if (getNumberFromDB("blocked", result) === 1) {
                                res.json(new LoginRequestCallBack(LoginResponses.ACCOUNTBLOCKED));
                            } else if (getNumberFromDB("verified", result) === 0) {
                                res.json(new LoginRequestCallBack(LoginResponses.ACCOUNTNOTVERIFIED));
                            } else {
                                delete result[0].password;

                                const userModel: UserModel = {
                                    email: getStringFromDB("email", result),
                                    username: getStringFromDB("username", result),
                                    rank: getNumberFromDB("rank", result),
                                    blocked: getNumberFromDB("blocked", result),
                                    verified: getNumberFromDB("verified", result)
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
                        console.error(err);
                    });

        });
    } else {
        res.json(new LoginRequestCallBack(LoginResponses.INVALIDINPUT));
    }


});

import {app, logger} from "../../../";
import {
    UserDashboardChangePasswordCallBack,
    UserDashboardChangePasswordRequest,
    UserDashboardChangePasswordResponses
} from "../../../../../faq-site-shared/api-calls";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../database-connection";
import {checkTokenValidity} from "../../../auth/middleware";
import {validateMultipleInputs} from "../../../utilities/string-utils";
import {hashPassword} from "../../../auth/hashPassword";

app.post(UserDashboardChangePasswordRequest.getURL, (req: Request, res: Response) => {

    const userDashboardChangePasswordRequest = req.body as UserDashboardChangePasswordRequest;

    const token = checkTokenValidity(req);

    if (token.valid) {

        const inputsValidation = validateMultipleInputs({
            input: userDashboardChangePasswordRequest.currentPassword,
            validationObject: {
                minlength: 8
            }
        }, {input: userDashboardChangePasswordRequest.newPassword,
            validationObject: {
                minlength: 8
            }
        });

        if (inputsValidation.valid) {
            query(`
            SELECT password
            FROM users
            WHERE id = ?
            `, token.tokenObj.user.id)
                .then((result: DatabaseResultSet) => {

                    if (result.convertRowsToResultObjects().length !== 1) {
                        res.json(new UserDashboardChangePasswordCallBack(UserDashboardChangePasswordResponses.INVALIDINPUT));
                    }

                    // If the input is actually valid, check if the password entered is equal. Depending on the output of the server, provide the correct error or login.
                    hashPassword(userDashboardChangePasswordRequest.currentPassword)
                        .then((hashedValue: string) => {
                            if (hashedValue === result.getStringFromDB("password")) {
                                hashPassword(userDashboardChangePasswordRequest.newPassword)
                                    .then((newHashedValue: string) => {
                                        query(`
                                        UPDATE users
                                        SET password = ?
                                        WHERE id = ?
                                        `, newHashedValue, token.tokenObj.user.id)
                                            .then(() => {
                                                res.json(new UserDashboardChangePasswordCallBack(UserDashboardChangePasswordResponses.SUCCESS));
                                            });
                                    })
                                    .catch((err) => {
                                        logger.error(`Changing password failed`);
                                        logger.error(err);
                                        res.status(500).send();
                                    });
                            } else {
                                res.json(new UserDashboardChangePasswordCallBack(UserDashboardChangePasswordResponses.WRONGPASSWORD));
                            }
                        });
                })
                .catch((err) => {
                    logger.error(`Getting user from id for changing password failed`);
                    logger.error(err);
                    res.status(500).send();
                });
        } else {
            res.json(new UserDashboardChangePasswordCallBack(UserDashboardChangePasswordResponses.INVALIDINPUT));
        }

    } else {
        res.status(401).send();
    }
});

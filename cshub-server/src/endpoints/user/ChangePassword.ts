import { app } from "../../";
import logger from "../../utilities/Logger";
import {
    ChangePasswordCallback,
    ChangePassword,
    ChangePasswordResponseTypes
} from "../../../../cshub-shared/src/api-calls";
import { Request, Response } from "express";
import { DatabaseResultSet, query } from "../../db/database-query";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import { hashPassword } from "../../auth/HashPassword";

app.post(ChangePassword.getURL, (req: Request, res: Response) => {
    const userDashboardChangePasswordRequest = req.body as ChangePassword;

    const token = checkTokenValidityFromRequest(req);

    if (token) {
        const inputsValidation = validateMultipleInputs(
            {
                input: userDashboardChangePasswordRequest.currentPassword,
                validationObject: {
                    minlength: 8
                }
            },
            {
                input: userDashboardChangePasswordRequest.newPassword,
                validationObject: {
                    minlength: 8
                }
            }
        );

        if (inputsValidation.valid) {
            query(
                `
            SELECT password
            FROM users
            WHERE id = ?
            `,
                token.user.id
            )
                .then((result: DatabaseResultSet) => {
                    if (result.convertRowsToResultObjects().length !== 1) {
                        res.json(new ChangePasswordCallback(ChangePasswordResponseTypes.INVALIDINPUT));
                    }

                    // If the input is actually valid, check if the password entered is equal. Depending on the output of the server, provide the correct error or login.
                    hashPassword(userDashboardChangePasswordRequest.currentPassword).then((hashedValue: string) => {
                        if (hashedValue === result.getStringFromDB("password")) {
                            hashPassword(userDashboardChangePasswordRequest.newPassword)
                                .then((newHashedValue: string) => {
                                    query(
                                        `
                                        UPDATE users
                                        SET password = ?
                                        WHERE id = ?
                                        `,
                                        newHashedValue,
                                        token.user.id
                                    ).then(() => {
                                        res.json(new ChangePasswordCallback(ChangePasswordResponseTypes.SUCCESS));
                                    });
                                })
                                .catch(err => {
                                    logger.error(`Changing password failed`);
                                    logger.error(err);
                                    res.status(500).send();
                                });
                        } else {
                            res.json(new ChangePasswordCallback(ChangePasswordResponseTypes.WRONGPASSWORD));
                        }
                    });
                })
                .catch(err => {
                    logger.error(`Getting user from id for changing password failed`);
                    logger.error(err);
                    res.status(500).send();
                });
        } else {
            res.json(new ChangePasswordCallback(ChangePasswordResponseTypes.INVALIDINPUT));
        }
    } else {
        res.status(401).send();
    }
});

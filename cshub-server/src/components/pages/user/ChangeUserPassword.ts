import {app, logger} from "../../../";
import {
    ChangeUserPasswordCallback,
    ChangeUserPassword,
    ChangeUserPasswordReponseTypes
} from "../../../../../cshub-shared/api-calls";
import {Request, Response} from "express";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../../auth/AuthMiddleware";
import {validateMultipleInputs} from "../../../utilities/StringUtils";
import {hashPassword} from "../../../auth/HashPassword";

app.post(ChangeUserPassword.getURL, (req: Request, res: Response) => {

    const userDashboardChangePasswordRequest = req.body as ChangeUserPassword;

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
                        res.json(new ChangeUserPasswordCallback(ChangeUserPasswordReponseTypes.INVALIDINPUT));
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
                                                res.json(new ChangeUserPasswordCallback(ChangeUserPasswordReponseTypes.SUCCESS));
                                            });
                                    })
                                    .catch((err) => {
                                        logger.error(`Changing password failed`);
                                        logger.error(err);
                                        res.status(500).send();
                                    });
                            } else {
                                res.json(new ChangeUserPasswordCallback(ChangeUserPasswordReponseTypes.WRONGPASSWORD));
                            }
                        });
                })
                .catch((err) => {
                    logger.error(`Getting user from id for changing password failed`);
                    logger.error(err);
                    res.status(500).send();
                });
        } else {
            res.json(new ChangeUserPasswordCallback(ChangeUserPasswordReponseTypes.INVALIDINPUT));
        }

    } else {
        res.status(401).send();
    }
});

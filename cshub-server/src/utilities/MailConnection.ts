import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

import * as fs from "fs";
import {ClientResponse} from "@sendgrid/client/src/response";

import {Settings} from "../settings";
import {query} from "../db/database-query";
import logger from "./Logger";
import {Requests} from "../../../cshub-shared/src/api-calls/index";
import {Routes} from "../../../cshub-shared/src/Routes";
import {getRandomNumberLarge} from "../../../cshub-shared/src/utilities/Random";

sgMail.setApiKey(Settings.MAIL.APIKEY);
const nodeMailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: Settings.MAIL.GMAILSETTINGS.MAILADDRESS,
        pass: Settings.MAIL.GMAILSETTINGS.PASSWORD
    }
});

export const sendMail = (subject: string, html: string, to: string) => {

    const emailObj = {
        to,
        subject,
        html
    };

    if (Settings.MAIL.USEGMAIL) {
        emailObj["from"] = Settings.MAIL.GMAILSETTINGS.MAILADDRESS;
        nodeMailer.sendMail(emailObj, function (err, info) {
            if (err) {
                logger.error(`Mail sending failed`);
                logger.error(err);
            } else {
                logger.info("Mail sent: ");
                logger.info(info);
            }
        });

    } else {
        const sendGridEmailObject = {
            ...emailObj,
            from: Settings.MAIL.NOREPLYADDRESS
        };

        sgMail.send(sendGridEmailObject)
            .then((response: [ClientResponse, {}]) => {
                logger.info("Mail sent: ");
                logger.info(response[0]);
            })
            .catch(err => {
                logger.error(`Mail sending failed`);
                logger.error(err);
            });
    }
};

export const sendVerificationEmail = (to: string, name: string, insertId: number) => {
    const hash = getRandomNumberLarge();

    query(`
      UPDATE users
      SET verifyhash = ?
      WHERE id = ?
    `, hash, insertId)
        .then(() => {
            fs.readFile(`${__dirname}/mailTemplate.html`, "utf8", (err, html: string) => {
                const replaceToAddress = `${Settings.APIADDRESS + Requests.VERIFYMAIL}?hash=${hash}&accId=${insertId}`;
                const newHTML = html
                    .replace("{0}", `Dear ${name}, please verify your email address`)
                    .replace("{1}", "Thanks for signing up for CSHub! We're excited to have you here.")
                    .replace("{2}", replaceToAddress)
                    .replace("{3}", "Verify Email");

                logger.info(`Replaced address; ${replaceToAddress}`);

                if (Settings.LIVE) {
                    if (Settings.MAIL.SUFFIX.charAt(0) === "@") {
                        sendMail("Verify your email address", newHTML, to + Settings.MAIL.SUFFIX);
                    } else {
                        logger.error("Wrong suffix entered, mail not sent");
                    }
                } else {
                    sendMail("Verify your email address", newHTML, Settings.MAIL.DEBUGMAILADDRESS);
                }
            });
        });

};

export const sendPasswordResetMail = (to: string, name: string, userId: number) => {
    const hash = getRandomNumberLarge();

    query(`
      UPDATE users
      SET passresethash = ?
      WHERE id = ?
    `, hash, userId)
        .then(() => {
            fs.readFile(`${__dirname}/mailTemplate.html`, "utf8", (err, html: string) => {
                const replaceToAddress = `${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}${Routes.FORGOTPASSWORD}?hash=${hash}&accId=${userId}`;
                const newHTML = html
                    .replace("{0}", `Dear ${name}, you have requested to change your password`)
                    .replace("{1}", "Click the following button and enter your new credentials")
                    .replace("{2}", replaceToAddress)
                    .replace("{3}", "Change password");

                logger.info(`Replaced address; ${replaceToAddress}`);

                if (Settings.LIVE) {
                    if (Settings.MAIL.SUFFIX.charAt(0) === "@") {
                        sendMail("Change your password", newHTML, to + Settings.MAIL.SUFFIX);
                    } else {
                        logger.error("Wrong suffix entered, mail not sent");
                    }
                } else {
                    sendMail("Change your password", newHTML, Settings.MAIL.DEBUGMAILADDRESS);
                }
            });
        });

};

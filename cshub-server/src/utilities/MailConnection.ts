import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

import * as fs from "fs";
import { ClientResponse } from "@sendgrid/client/src/response";

import { Settings } from "../settings";
import { query } from "../db/database-query";
import logger from "./Logger";
import { Requests } from "../../../cshub-shared/src/api-calls/index";
import { Routes } from "../../../cshub-shared/src/Routes";
import { getRandomNumberLarge } from "../../../cshub-shared/src/utilities/Random";
import { getRepository } from "typeorm";
import { User } from "../db/entities/user";
import { EmailDomain } from "../db/entities/emaildomain";

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
        nodeMailer.sendMail(emailObj, function(err, info) {
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

        sgMail
            .send(sendGridEmailObject)
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

    query(
        `
      UPDATE users
      SET verifyhash = ?
      WHERE id = ?
    `,
        hash,
        insertId
    ).then(() => {
        const userRepository = getRepository(User);
        const domainRepository = getRepository(EmailDomain);

        fs.readFile(`${__dirname}/mailTemplate.html`, "utf8", async (err, html: string) => {
            const replaceToAddress = `${Settings.APIADDRESS + Requests.VERIFYMAIL}?hash=${hash}&accId=${insertId}`;
            const newHTML = html
                .replace("{0}", `Dear ${name}, please verify your email address`)
                .replace("{1}", "Thanks for signing up for CSHub! We're excited to have you here.")
                .replace("{2}", replaceToAddress)
                .replace("{3}", "Verify Email");

            logger.info(`Replaced address; ${replaceToAddress}`);

            let user = await userRepository.findOne({ id: insertId });
            if (!user) {
                logger.error("Could not get user, mail not sent");
                throw Error();
            }
            const domain = await domainRepository.findOne({ id: user.domainId });
            if (!domain) {
                logger.error("Could not get domain, mail not sent");
                throw Error();
            }

            const suffix = domain.domain;
            const address = to + "@" + suffix;

            logger.info(`Sending verification mail to ${address}`);

            if (Settings.LIVE) {
                if (suffix.charAt(0) === "@") {
                    logger.error("Wrong suffix entered, mail not sent");
                    throw Error();
                } else {
                    sendMail("Verify your email address", newHTML, address);
                }
            } else {
                sendMail("Verify your email address", newHTML, Settings.MAIL.DEBUGMAILADDRESS);
            }
        });
    });
};

export const sendPasswordResetMail = (to: string, name: string, userId: number) => {
    const hash = getRandomNumberLarge();

    query(
        `
      UPDATE users
      SET passresethash = ?
      WHERE id = ?
    `,
        hash,
        userId
    ).then(() => {
        const userRepository = getRepository(User);
        const domainRepository = getRepository(EmailDomain);

        fs.readFile(`${__dirname}/mailTemplate.html`, "utf8", async (err, html: string) => {
            const replaceToAddress = `${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}${Routes.FORGOTPASSWORD}?hash=${hash}&accId=${userId}`;
            const newHTML = html
                .replace("{0}", `Dear ${name}, you have requested to change your password`)
                .replace("{1}", "Click the following button and enter your new credentials")
                .replace("{2}", replaceToAddress)
                .replace("{3}", "Change password");

            let user = await userRepository.findOne({ id: userId });
            if (!user) {
                logger.error("Could not get user, mail not sent");
                throw Error();
            }
            const domain = await domainRepository.findOne({ id: user.domainId });

            if (!domain) {
                logger.error("Could not get domain, mail not sent");
                throw Error();
            }

            const suffix = domain.domain;
            const address = to + "@" + suffix;

            logger.info(`Replaced address; ${replaceToAddress}`);
            logger.info(`Sending forgot password mail to ${address}`);

            if (Settings.LIVE) {
                if (suffix.charAt(0) === "@") {
                    logger.error("Wrong suffix entered, mail not sent");
                    throw Error();
                } else {
                    sendMail("Change your password", newHTML, address);
                }
            } else {
                sendMail("Change your password", newHTML, Settings.MAIL.DEBUGMAILADDRESS);
            }
        });
    });
};

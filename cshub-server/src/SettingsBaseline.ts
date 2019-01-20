// Copy this file to settings.ts, remove the interface from the file and export the Settings instead of creating a local const

export interface ISettings {
    LIVE: boolean;
    PORT: number;
    DATABASE: {
        HOST: string;
        USER: string;
        PASSWORD: string;
        NAME: string
    };
    USESSH: boolean;
    SSH: {
        HOST: string,
        USER: string,
        PORT: number,
        PRIVATEKEYLOCATION: string
    };
    DOMAIN: string;
    SITEADDRESS: string;
    TOKENAGEMILLISECONDS: number;
    PASSWORDITERATIONS: number;
    JWTHASH: string;
    PASSWORDSALT: string;
    MAIL: {
        USEGMAIL: boolean;
        GMAILSETTINGS: {
            PASSWORD: string;
            MAILADDRESS: string
        };
        APIKEY: string;
        NOREPLYADDRESS: string;
        SUFFIX: string;
        DEBUGMAILADDRESS: string;
        VERIFYMAILADDRESSPREFIX: string;
    };
    LOGLEVEL: string;

}

export const Settings: ISettings = {
    LIVE: process.env.LIVE ? process.env.LIVE === "true" : false,
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    DATABASE: {
        HOST: process.env.DATABASE_HOST ? process.env.DATABASE_HOST : "localhost",
        USER: process.env.DATABASE_USER ? process.env.DATABASE_USER : "xxx",
        PASSWORD: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : "xxx",
        NAME: process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "CSHubTest",
    },
    USESSH: process.env.USESSH ? process.env.USESSH === "true" : true,
    SSH: {
        HOST: process.env.SSH_HOST ? process.env.SSH_HOST : "cshub",
        USER: process.env.SSH_USER ? process.env.SSH_USER : "xxx",
        PORT: process.env.SSH_PORT ? Number(process.env.SSH_PORT) : 22,
        PRIVATEKEYLOCATION: process.env.SSH_PRIVATEKEYLOCATION ? process.env.SSH_PRIVATEKEYLOCATION : "xxx",
    },
    DOMAIN: process.env.DOMAIN ? process.env.DOMAIN : "192.168.x.x",
    SITEADDRESS: process.env.SITEADDRESS ? process.env.SITEADDRESS : "http://192.168.xxx",
    TOKENAGEMILLISECONDS: process.env.TOKENAGEMILLISECONDS ? Number(process.env.TOKENAGEMILLISECONDS) : 7200000,
    PASSWORDITERATIONS: process.env.PASSWORDITERATIONS ? Number(process.env.PASSWORDITERATIONS) : 42424,
    JWTHASH: process.env.JWTHASH ? process.env.JWTHASH : "xxxxx",
    PASSWORDSALT: process.env.PASSWORDSALT ? process.env.PASSWORDSALT : "xxxxx",
    MAIL: {
        USEGMAIL: process.env.MAIL_USEGMAIL ? process.env.MAIL_USEGMAIL === "true" : false,
        GMAILSETTINGS: {
            PASSWORD: process.env.MAIL_GMAILSETTINGS_PASSWORD ? process.env.MAIL_GMAILSETTINGS_PASSWORD : "xxxx",
            MAILADDRESS: process.env.MAIL_GMAILSETTINGS_MAILADDRESS ? process.env.MAIL_GMAILSETTINGS_MAILADDRESS : "xxx@gmail.com"
        },
        APIKEY: process.env.MAIL_APIKEY ? process.env.MAIL_APIKEY : "xxxx",
        NOREPLYADDRESS: process.env.MAIL_APIKEY ? process.env.MAIL_APIKEY : "no-reply@xxx.nl",
        SUFFIX: process.env.MAIL_SUFFIX ? process.env.MAIL_SUFFIX : "@xxxxx",
        DEBUGMAILADDRESS: process.env.MAIL_DEBUGMAILADDRESS ? process.env.DEBUGMAILADDRESS : "xxxx",
        VERIFYMAILADDRESSPREFIX: process.env.MAIL_VERIFYMAILADDRESSPREFIX ? process.env.VERIFYMAILADDRESSPREFIX : "xxxx"
    },
    LOGLEVEL: process.env.LOGLEVEL ? process.env.LOGLEVEL : "info"
};

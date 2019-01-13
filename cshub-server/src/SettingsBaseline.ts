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
    LIVE: false,
    PORT: 3000,
    DATABASE: {
        HOST: "localhost",
        USER: "xxx",
        PASSWORD: "xxx",
        NAME: "CSHubTest"
    },
    USESSH: true,
    SSH: {
        HOST: "xxx",
        USER: "xxx",
        PORT: 0,
        PRIVATEKEYLOCATION: "xxx"
    },
    DOMAIN: "192.168.xxx",
    SITEADDRESS: "http://192.168.xxx",
    TOKENAGEMILLISECONDS: 7200000,
    PASSWORDITERATIONS: 42424,
    JWTHASH: "xxxxx",
    PASSWORDSALT: "xxxxx",
    MAIL: {
        USEGMAIL: false,
        GMAILSETTINGS: {
            PASSWORD: "xxxx",
            MAILADDRESS: "xxx@gmail.com"
        },
        APIKEY: "xxxx",
        NOREPLYADDRESS: "no-reply@xxx.nl",
        SUFFIX: "@xxxxx",
        DEBUGMAILADDRESS: "xxxx",
        VERIFYMAILADDRESSPREFIX: "xxx"
    },
    LOGLEVEL: "info"
};

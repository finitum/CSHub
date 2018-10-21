// Copy this file to settings.ts, remove the interface from the file and export the Settings instead of creating a local const

export interface ISettings {
    LIVE: boolean;
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

}

export const Settings: ISettings = {
    LIVE: true,
    DATABASE: {
        HOST: "",
        USER: "",
        PASSWORD: "",
        NAME: ""
    },
    USESSH: true,
    SSH: {
        HOST: "",
        USER: "",
        PORT: 0,
        PRIVATEKEYLOCATION: ""
    },
    DOMAIN: "",
    SITEADDRESS: "",
    TOKENAGEMILLISECONDS: 0,
    PASSWORDITERATIONS: 0,
    JWTHASH: "",
    PASSWORDSALT: "",
    MAIL: {
        USEGMAIL: false,
        GMAILSETTINGS: {
            PASSWORD: "",
            MAILADDRESS: ""
        },
        APIKEY: "",
        NOREPLYADDRESS: "",
        SUFFIX: "",
        DEBUGMAILADDRESS: "",
        VERIFYMAILADDRESSPREFIX: ""
    }
};

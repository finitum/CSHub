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
    SITEADDRESS: string;
    TOKENAGEMILLISECONDS: number;
    PASSWORDITERATIONS: number;
    MAIL: {
        APIKEY: string;
        NOREPLYADDRESS: string;
        SUFFIX: string;
        SENDMAIL: boolean;
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
        PORT: 1234,
        PRIVATEKEYLOCATION: ""
    },
    SITEADDRESS: "",
    TOKENAGEMILLISECONDS: 7200000,
    PASSWORDITERATIONS: 45000,
    MAIL: {
        APIKEY: "",
        NOREPLYADDRESS: "",
        SENDMAIL: false,
        SUFFIX: "",
        DEBUGMAILADDRESS: "",
        VERIFYMAILADDRESSPREFIX: ""
    }
};

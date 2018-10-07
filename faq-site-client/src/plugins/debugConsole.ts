import moment from "moment";

export const LogStringConsole = (input: string, location?: string) => {
    if (process.env.VUE_APP_DEBUG === "true") {
        if (!location) { location = "unknown"; }
        console.log(`%c (${moment().format()}) Log: "${input}" at ${location}`, "font: 1em Verdana; color: blue");
    }
};

export const LogObjectConsole = (input: any, location?: string) => {
    if (process.env.VUE_APP_DEBUG === "true") {
        if (!location) { location = "unknown"; }
        console.log(`%c (${moment().format()}) Object log: at ${location}`, "font: 1em Verdana; color: blue");
        console.log(input);
    }
};

export const ErrorLogStringConsole = (input: string, location: string) => {
    if (process.env.VUE_APP_DEBUG === "true") {
        if (!location) { location = "unknown"; }
        console.error(`%c (${moment().format()}) Error: "${input}" at ${location}`, "font: 1.3em Verdana bold; color: red");
    }
};

export const ErrorLogObjectConsole = (input: any, location?: string) => {
    if (process.env.VUE_APP_DEBUG === "true") {
        if (!location) { location = "unknown"; }
        console.error(`%c (${moment().format()}) Object error: at ${location}`, "font: 1.3em Verdana bold; color: red");
        console.error(input);
    }
};

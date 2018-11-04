import moment from "moment";
import userState from "../store/user";

const showDebugConsole = () => {
    return process.env.VUE_APP_DEBUG === "true" || userState.isAdmin;
};

export const logStringConsole = (input: string, location?: string) => {
    if (showDebugConsole()) {
        if (!location) { location = "unknown"; }
        console.log(`%c (${moment().format()}) Log: "${input}" at ${location}`, "font: 1em Verdana; color: blue");
    }
};

export const logObjectConsole = (input: any, location?: string) => {
    if (showDebugConsole()) {
        if (!location) { location = "unknown"; }
        console.log(`%c (${moment().format()}) Object log: at ${location}`, "font: 1em Verdana; color: blue");
        console.log(input);
    }
};

export const errorLogStringConsole = (input: string, location: string) => {
    if (showDebugConsole()) {
        if (!location) { location = "unknown"; }
        console.error(`%c (${moment().format()}) Error: "${input}" at ${location}`, "font: 1.3em Verdana bold; color: red");
    }
};

export const errorLogObjectConsole = (input: any, location?: string) => {
    if (showDebugConsole()) {
        if (!location) { location = "unknown"; }
        console.error(`%c (${moment().format()}) Object error: at ${location}`, "font: 1.3em Verdana bold; color: red");
        console.error(input);
    }
};


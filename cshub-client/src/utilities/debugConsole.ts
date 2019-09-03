import dayjs from "dayjs";
import { userState } from "../store";

const showDebugConsole = () => {
    return process.env.VUE_APP_DEBUG === "true" || userState.isAdmin;
};

export const logStringConsole = (input: string, location?: string) => {
    if (showDebugConsole()) {
        if (!location) {
            location = "unknown";
        }
        console.log(`%c (${dayjs().format()}) Log: "${input}" at ${location}`, "font: 1em Verdana; color: blue");
    }
};

export const logObjectConsole = (input: any, location?: string) => {
    if (showDebugConsole()) {
        if (!location) {
            location = "unknown";
        }
        console.log(
            `%c (${dayjs().format()}) Object log: at ${location}, ${JSON.stringify(input)}`,
            "font: 1em Verdana; color: blue"
        );
    }
};

export const errorLogStringConsole = (input: string, location: string) => {
    if (showDebugConsole()) {
        if (!location) {
            location = "unknown";
        }
        console.error(
            `%c (${dayjs().format()}) Error: "${input}" at ${location}`,
            "font: 1.3em Verdana bold; color: red"
        );
    }
};

export const errorLogObjectConsole = (input: any, location?: string) => {
    if (showDebugConsole()) {
        if (!location) {
            location = "unknown";
        }
        console.error(
            `%c (${dayjs().format()}) Object error: at ${location}, ${JSON.stringify(input)}`,
            "font: 1.3em Verdana bold; color: red"
        );
    }
};

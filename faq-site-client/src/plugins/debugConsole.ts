export const LogConsole = (input: string, location?: string) => {
    if (process.env.VUE_APP_DEBUG === "true") {
        if (!location) { location = "unknown"; }
        console.log(`Log: "${input}" at ${location}`);
    }
};

export const ErrorLogConsole = (input: string, location: string) => {
    if (process.env.VUE_APP_DEBUG === "true") {
        if (!location) { location = "unknown"; }
        console.error(`Error: "${input}" at ${location}`);
    }
};

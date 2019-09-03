import winston, { format } from "winston";
import { Settings } from "../settings";

const enumerateErrorFormat = format.printf(info => {
    const log = `${info.level}: ${info.message}`;
    return info.stack ? `${log}\n${info.stack}` : log;
});

const liveJsonFormat = format.combine(format.timestamp(), format.json(), enumerateErrorFormat);
const debugFormat = format.combine(
    winston.format.errors({ stack: true }),
    winston.format.cli(),
    winston.format.colorize(),
    enumerateErrorFormat
);

const usedFormat = Settings.LIVE ? liveJsonFormat : debugFormat;

const logger = winston.createLogger({
    level: Settings.LOGLEVEL,
    format: usedFormat,
    transports: [
        new winston.transports.Console({
            format: usedFormat,
            handleExceptions: Settings.LIVE
        })
    ]
});

export default logger;

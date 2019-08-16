import winston, { format } from "winston";
import { Settings } from "../settings";

const logger = winston.createLogger({
    level: Settings.LOGLEVEL,
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new winston.transports.Console({
            format: winston.format.json(),
            handleExceptions: Settings.LIVE
        })
    ]
});

export default logger;

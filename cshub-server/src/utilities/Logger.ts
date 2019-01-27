import winston, {format} from "winston";
import {Settings} from "../settings";

const logger = winston.createLogger({
    level: Settings.LOGLEVEL,
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/verbose.log", level: "verbose" })
    ]
});

logger.add(new winston.transports.Console({ format: winston.format.simple() }));

export default logger

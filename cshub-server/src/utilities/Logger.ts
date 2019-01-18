import winston, {format} from "winston";
import {Settings} from "../settings";

const logger = winston.createLogger({
    level: Settings.LOGLEVEL,
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
    ]
});

logger.add(new winston.transports.Console({ format: winston.format.simple() }));

export default logger

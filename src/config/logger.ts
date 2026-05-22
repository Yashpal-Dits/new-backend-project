import winston from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue"
};

winston.addColors(colors);
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}:${info.message}`
    )
);
const level = () => {
    const env = process.env.NODE_ENV || "development";
    return env === "development" ? "debug" : "warn";
};

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.simple()
            ),
        }),
        // Error log file 
        new DailyRotateFile({
            filename: path.join(process.cwd(), "logs", "error", "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxSize: "20m",
            maxFiles: "14d",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),

        }),
        //  Combined log file 
        new DailyRotateFile({
            filename: path.join(process.cwd(),
                "logs", "combined", "combined-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level: "combined",
            maxSize: "20m",
            maxFiles: "14d",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        // HTTP log file
        new DailyRotateFile({
            filename: path.join(process.cwd(),
                "logs", "http", "http-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            level:"http",
            maxSize: "20m",
            maxFiles: "14d",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});

export default logger;
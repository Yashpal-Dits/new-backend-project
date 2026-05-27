import winston from "winston";
import path from "path";
import fs from "fs";

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

// Ensure log directories exist (simple approach, no rotation)
const ensureLogDirs = () => {
    const dirs = [
        path.join(process.cwd(), "logs", "error"),
        path.join(process.cwd(), "logs", "combined"),
        path.join(process.cwd(), "logs", "http"),
    ];
    for (const d of dirs) {
        try {
            if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
        } catch (err) {
            // If directory creation fails, fallback to console
            // eslint-disable-next-line no-console
            console.error(`Could not create log directory ${d}:`, err);
        }
    }
};

ensureLogDirs();

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
        new winston.transports.File({
            filename: path.join(process.cwd(), "logs", "error", "error.log"),
            level: "error",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(process.cwd(), "logs", "combined", "combined.log"),
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        // HTTP log file
        new winston.transports.File({
            filename: path.join(process.cwd(), "logs", "http", "http.log"),
            level: "http",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});

export default logger;
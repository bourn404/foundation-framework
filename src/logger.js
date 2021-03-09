const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const expressWinston = require('express-winston');

const logsDirectory = path.join(__dirname, '../logs');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new transports.File({ filename: path.join(logsDirectory, '/error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logsDirectory, '/combined.log'), level: 'info' }),
    ],
});

const requestLogger = createLogger({
    level: 'http',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new transports.File({ filename: path.join(logsDirectory, '/access.log'), level: 'http' }),
    ],
});

const stream = {
    write: function(message, encoding) {
        requestLogger.http(message);
    }
}

// special logging rules on non-production environments

if (process.env.NODE_ENV !== 'production') {
    const consoleFormat = printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    });

    logger.add(new transports.Console({
        format: combine(
            format.colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            consoleFormat
        ),
        level: 'debug'
    }));
}

module.exports = { logger, requestLogger, stream };
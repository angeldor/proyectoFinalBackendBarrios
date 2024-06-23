import {createLogger, transports, format} from 'winston';

const levels = {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5,
};

const devLogger = createLogger({
    level: 'debug',
    format: format.simple(),
    transports: [
        new transports.Console()
    ]
});

const prodLogger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        new transports.File({filename: 'logs/error.log', level: 'error'})
    ]
});

module.exports = {devLogger, prodLogger, levels};
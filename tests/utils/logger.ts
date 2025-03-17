import {createLogger, format, transports} from "winston";

const logger = createLogger({

    level: 'info',
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports:[
        new transports.Console(),
        new transports.File({filename: 'logs/automation.json'}),
    ]
});

export default logger;
import log4js, { Logger } from "log4js";
import { Config } from "./Config";

export class LoggerFactory {
    private static instance: Logger;

    private static configure(): void {
        log4js.configure({
            appenders: {
                console: {
                    type: 'console',
                    layout: {
                        type: 'pattern',
                        pattern: '%[[%d{yyyy/MM/dd hh:mm:ss.SSS}][%4p]%]%m'
                    }
                },
                file: {
                    type: 'file',
                    filename: 'logs/app.log',
                    maxLogSize: 10 * 1024 * 1024,
                    backups: 3,
                    compress: true,
                    layout: {
                        type: 'pattern',
                        pattern: '[%d{yyyy/MM/dd hh:mm:ss.SSS}][%4p] %m'
                    }
                },
                errorFile: {
                    type: 'file',
                    filename: 'logs/error.log',
                    layout: {
                        type: 'pattern',
                        pattern: '[%d{yyyy/MM/dd hh:mm:ss.SSS}][%4p] %m'
                    }
                },
                errorFilter: {
                    type: 'logLevelFilter',
                    level: 'error',
                    appender: 'errorFile'
                }
            },
            categories: {
                default: {
                    appenders: ['console', 'file', 'errorFilter'],
                    level: Config.getInstance().get('LOG_LEVEL') || 'info'
                }
            }
        });
    }

    public static getLogger(): Logger {
        if (!LoggerFactory.instance) {
            LoggerFactory.configure();
            LoggerFactory.instance = log4js.getLogger();
            globalThis.Logger = LoggerFactory.instance;
        }

        return LoggerFactory.instance;
    }
}

export default LoggerFactory.getLogger();
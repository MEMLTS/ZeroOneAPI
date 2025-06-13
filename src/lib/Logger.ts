import log4js from "log4js";

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
      level: 'debug'
    }
  }
});

const logger = log4js.getLogger();

if (!globalThis.Logger) {
    globalThis.Logger = logger;
}

export default logger;

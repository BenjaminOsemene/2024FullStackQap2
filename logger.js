//Here the  winston library that was installed is logging  to both console and a file in logs as specified below
const winston = require('winston');
const path = require('path');
const { combine, timestamp, label, printf } = winston.format;

const logDir = path.join(__dirname, 'logs');

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'my-app' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'http-events-%DATE%.log',
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      dirname: logDir
    })
  ]
});

module.exports = logger;
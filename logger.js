//This code allows log messages to be written to both console and daily rotating log file in the logs
// Imported the winston core library
// Imported the path module for file paths
// Imported the format functions from winston for formatting log messages
// Imported the DailyRotateFile transport from the winston-daily-rotate-file package
// Get the path to the logs directory
// Defined log format
const winston = require('winston');
const path = require('path');
const { combine, timestamp, label, printf } = winston.format;
const DailyRotateFile = require('winston-daily-rotate-file');
const logDir = path.join(__dirname, 'logs');
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// This create Winston logger instance, define log format and export log instance
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'my-app' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'http-events-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      dirname: logDir
    })
  ]
});

module.exports = logger;
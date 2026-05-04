import { createLogger, format, transports, Logger } from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const loggerTransports: any[] = [
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  }),
];

// File transports only work locally (Vercel has a read-only filesystem)
if (!isProduction) {
  loggerTransports.push(
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  );
}

const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: loggerTransports,
});

export default logger;

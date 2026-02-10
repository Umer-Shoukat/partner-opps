import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.x-app-signature', 'req.headers.x-app-key-id'],
    remove: true,
  },
});

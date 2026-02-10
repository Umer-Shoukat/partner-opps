"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = require("pino");
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
        paths: ['req.headers.authorization', 'req.headers.x-app-signature', 'req.headers.x-app-key-id'],
        remove: true,
    },
});
//# sourceMappingURL=pino.js.map
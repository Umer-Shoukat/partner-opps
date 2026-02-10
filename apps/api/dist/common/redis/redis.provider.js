"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisProvider = exports.REDIS = void 0;
const ioredis_1 = require("ioredis");
exports.REDIS = Symbol('REDIS');
exports.RedisProvider = {
    provide: exports.REDIS,
    useFactory: () => {
        const url = process.env.REDIS_URL;
        if (!url)
            throw new Error('REDIS_URL is required');
        return new ioredis_1.default(url, { maxRetriesPerRequest: null });
    },
};
//# sourceMappingURL=redis.provider.js.map
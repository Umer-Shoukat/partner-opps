"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hex = sha256Hex;
exports.hmacSha256Hex = hmacSha256Hex;
exports.timingSafeEqualHex = timingSafeEqualHex;
const crypto_1 = require("crypto");
function sha256Hex(input) {
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
}
function hmacSha256Hex(secret, signingString) {
    return crypto_1.default.createHmac('sha256', secret).update(signingString).digest('hex');
}
function timingSafeEqualHex(a, b) {
    try {
        const ab = Buffer.from(a, 'hex');
        const bb = Buffer.from(b, 'hex');
        if (ab.length !== bb.length)
            return false;
        return crypto_1.default.timingSafeEqual(ab, bb);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=hmac.js.map
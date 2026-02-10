import crypto from 'crypto';

export function sha256Hex(input: string | Buffer) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hmacSha256Hex(secret: string, signingString: string) {
  return crypto.createHmac('sha256', secret).update(signingString).digest('hex');
}

export function timingSafeEqualHex(a: string, b: string) {
  try {
    const ab = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

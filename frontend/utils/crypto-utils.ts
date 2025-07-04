export function randomUUID(): string {
  if (typeof window === 'undefined') {
    const crypto = eval('require')('node:crypto');
    return crypto.randomUUID();
  } else {
    return globalThis.crypto.randomUUID();
  }
}

export function createSHA256Hash(input: string): string {
  if (typeof window === 'undefined') {
    const crypto = eval('require')('node:crypto');
    return crypto
      .createHash('sha256')
      .update(Buffer.from(input, 'utf8'))
      .digest('base64url');
  } else {
    throw new Error('SHA256 hashing not implemented for client-side');
  }
}


import jwt, { SignOptions } from 'jsonwebtoken';

const PRIVATE_KEY_ENV = 'ACCESS_TOKEN_PRIVATE_KEY';
const PUBLIC_KEY_ENV = 'ACCESS_TOKEN_PUBLIC_KEY';

class JwtConfigurationError extends Error {
  constructor(variableName: string) {
    super(`JWT configuration is invalid: ${variableName} must contain a PEM-formatted key`);
    this.name = 'JwtConfigurationError';
  }
}

/**
 * Reads a key when it is needed rather than at module import time. This allows
 * the application bootstrap to load dotenv before the first token operation.
 */
const getPemKey = (
  variableName: string,
  keyType: 'private' | 'public',
): string => {
  const value = process.env[variableName]?.replace(/\\n/g, '\n').trim();
  const pemPattern =
    keyType === 'private'
      ? /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]+-----END (?:RSA )?PRIVATE KEY-----/
      : /-----BEGIN (?:RSA )?PUBLIC KEY-----[\s\S]+-----END (?:RSA )?PUBLIC KEY-----/;

  if (!value || !pemPattern.test(value)) {
    throw new JwtConfigurationError(variableName);
  }

  return value;
};

/**
 * Signs a payload to generate a short-lived access token using RS256.
 */
export const signAccessToken = (payload: object | Buffer): string => {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: '15m',
  };

  return jwt.sign(
    payload,
    getPemKey(PRIVATE_KEY_ENV, 'private'),
    options,
  );
};

/**
 * Verifies an access token using the public key.
 * Throws an error if the token is expired, tampered with, or invalid.
 */
export const verifyAccessToken = <T>(token: string): T => {
  const publicKey = getPemKey(PUBLIC_KEY_ENV, 'public');

  try {
    if (!token.trim()) {
      throw new Error('Token is empty');
    }

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });

    return decoded as T;
  } catch {
    throw new Error('Invalid or expired access token');
  }
};

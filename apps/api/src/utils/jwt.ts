import jwt, { SignOptions } from 'jsonwebtoken';

// Read keys from environment variables. 
// In production, these should be securely injected (e.g., via Kubernetes secrets).
// RS256 requires a PEM formatted private key for signing and a public key for verification.
const PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY as string;
const PUBLIC_KEY = process.env.ACCESS_TOKEN_PUBLIC_KEY as string;

if (!PRIVATE_KEY || !PUBLIC_KEY) {
  console.warn("WARNING: RSA keys for JWT are missing from environment variables.");
}

/**
 * Signs a payload to generate a short-lived access token using RS256.
 */
export const signAccessToken = (payload: object | Buffer): string => {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: '15m', // Short-lived as discussed
  };

  return jwt.sign(payload, PRIVATE_KEY, options);
};

/**
 * Verifies an access token using the public key.
 * Throws an error if the token is expired, tampered with, or invalid.
 */
export const verifyAccessToken = <T>(token: string): T => {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
    });
    
    return decoded as T;
  } catch (error) {
    // We catch and re-throw a generic error to avoid leaking cryptographic details 
    // to the upper layers, though you can inspect `error.name` (e.g., TokenExpiredError) 
    // if you want to handle expiry specifically in your Fastify routes.
    throw new Error('Invalid or expired access token');
  }
};
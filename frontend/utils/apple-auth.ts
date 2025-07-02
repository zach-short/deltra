import * as jose from 'jose';
import crypto from 'crypto';
import {
  JWT_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRY,
  JWT_SECRET,
} from '@/utils/constants';

interface AppleAuthResult {
  accessToken: string;
  refreshToken: string;
}

interface AppleUserInfo {
  identityToken: string;
  rawNonce: string;
  givenName?: string;
  familyName?: string;
  email?: string;
}

export async function verifyAndCreateTokens({
  identityToken,
  rawNonce,
  givenName,
  familyName,
  email,
}: AppleUserInfo): Promise<AppleAuthResult> {
  const isFirstSignIn = givenName && email;

  const JWKS = jose.createRemoteJWKSet(
    new URL('https://appleid.apple.com/auth/keys'),
  );

  try {
    const { payload } = await jose.jwtVerify(identityToken, JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: 'com.beto.expoauthexample',
    });

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTimestamp) {
      throw new Error('Token has expired');
    }

    if (!payload.sub || !payload.iss || !payload.aud || !payload.nonce) {
      throw new Error('Missing required claims in token');
    }

    if ((payload as any).nonce_supported) {
      if (payload.nonce !== rawNonce) {
        throw new Error('Invalid nonce');
      }
    } else {
      const computedHashedNonce = crypto
        .createHash('sha256')
        .update(Buffer.from(rawNonce, 'utf8'))
        .digest('base64url');

      if (payload.nonce !== computedHashedNonce) {
        throw new Error('Invalid nonce');
      }
    }

    const { exp, ...userInfoWithoutExp } = payload;

    const sub = (payload as { sub: string }).sub;

    const issuedAt = Math.floor(Date.now() / 1000);

    const jti = crypto.randomUUID();

    const accessToken = await new jose.SignJWT({
      ...userInfoWithoutExp,
      email: isFirstSignIn ? email : 'example@icloud.com',
      name: isFirstSignIn ? `${givenName} ${familyName}` : 'apple-user',
      email_verified: (payload as any).email_verified ?? false,
      is_private_email: (payload as any).is_private_email ?? false,
      real_user_status: (payload as any).real_user_status ?? 0,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new jose.SignJWT({
      sub,
      jti,
      type: 'refresh',
      email: isFirstSignIn ? email : 'example@icloud.com',
      name: isFirstSignIn ? `${givenName} ${familyName}` : 'apple-user',
      email_verified: (payload as any).email_verified ?? false,
      is_private_email: (payload as any).is_private_email ?? false,
      real_user_status: (payload as any).real_user_status ?? 0,
      nonce_supported: (payload as any).nonce_supported ?? false,
      iss: 'https://appleid.apple.com',
      aud: (payload as any).aud,
      ...userInfoWithoutExp,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

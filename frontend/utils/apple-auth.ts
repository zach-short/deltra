import * as jose from 'jose';
import crypto from 'crypto';
import {
  JWT_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRY,
  JWT_SECRET,
} from '@/constants';

async function createOrFindUser(oauthData: {
  providerId: string;
  provider: string;
  email: string;
  name: string;
  picture?: string;
}) {
  try {
    const backendUrl =
      process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/v1/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oauthData),
    });

    if (!response.ok) {
      throw new Error(`Backend user creation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create/find user in backend:', error);
    throw error;
  }
}

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

    const userName = isFirstSignIn
      ? `${givenName} ${familyName}`
      : 'apple-user';
    const userEmail = isFirstSignIn ? email! : 'example@icloud.com';

    const backendUser = await createOrFindUser({
      providerId: sub,
      provider: 'apple',
      email: userEmail,
      name: userName,
    });

    const backendUserId = backendUser.id;
    userInfoWithoutExp.id = backendUserId;
    userInfoWithoutExp.provider = 'apple';
    userInfoWithoutExp.isNewUser = backendUser.isNewUser;

    const issuedAt = Math.floor(Date.now() / 1000);

    const jti = crypto.randomUUID();

    const accessToken = await new jose.SignJWT({
      ...userInfoWithoutExp,
      email: userEmail,
      name: userName,
      email_verified: (payload as any).email_verified ?? false,
      is_private_email: (payload as any).is_private_email ?? false,
      real_user_status: (payload as any).real_user_status ?? 0,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(backendUserId)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new jose.SignJWT({
      sub: backendUserId,
      jti,
      type: 'refresh',
      email: userEmail,
      name: userName,
      email_verified: (payload as any).email_verified ?? false,
      is_private_email: (payload as any).is_private_email ?? false,
      real_user_status: (payload as any).real_user_status ?? 0,
      nonce_supported: (payload as any).nonce_supported ?? false,
      iss: 'https://appleid.apple.com',
      aud: (payload as any).aud,
      provider: 'apple',
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

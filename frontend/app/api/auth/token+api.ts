import * as jose from 'jose';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_MAX_AGE,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  COOKIE_OPTIONS,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_COOKIE_OPTIONS,
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

export async function POST(request: Request) {
  const body = await request.formData();
  const code = body.get('code') as string;
  const platform = (body.get('platform') as string) || 'native';

  if (!code) {
    return Response.json(
      { error: 'Missing authorization code' },
      { status: 400 },
    );
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
      code: code,
    }),
  });

  const data = await response.json();

  if (!data.id_token) {
    return Response.json(
      { error: 'Missing required parameters' },
      { status: 400 },
    );
  }

  const userInfo = jose.decodeJwt(data.id_token) as object;

  const { exp, ...userInfoWithoutExp } = userInfo as any;

  const sub = (userInfo as { sub: string }).sub;

  try {
    const backendUser = await createOrFindUser({
      providerId: sub,
      provider: 'google',
      email: (userInfo as any).email,
      name: (userInfo as any).name,
      picture: (userInfo as any).picture,
    });

    const backendUserId = backendUser.id;
    userInfoWithoutExp.id = backendUserId;
    userInfoWithoutExp.provider = 'google';
    userInfoWithoutExp.isNewUser = backendUser.isNewUser;
  } catch (error) {
    return Response.json(
      { error: 'Failed to create user account' },
      { status: 500 },
    );
  }

  const issuedAt = Math.floor(Date.now() / 1000);

  const jti = crypto.randomUUID();

  const accessToken = await new jose.SignJWT({
    ...userInfoWithoutExp,
    id: userInfoWithoutExp.id, // Explicitly include the id field
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(userInfoWithoutExp.id)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  const refreshToken = await new jose.SignJWT({
    sub: userInfoWithoutExp.id,
    id: userInfoWithoutExp.id, // Explicitly include the id field
    jti,
    type: 'refresh',
    name: (userInfo as any).name,
    email: (userInfo as any).email,
    picture: (userInfo as any).picture,
    given_name: (userInfo as any).given_name,
    family_name: (userInfo as any).family_name,
    email_verified: (userInfo as any).email_verified,
    provider: 'google',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt(issuedAt)
    .sign(new TextEncoder().encode(JWT_SECRET));

  if (data.error) {
    return Response.json(
      {
        error: data.error,
        error_description: data.error_description,
        message:
          "OAuth validation error - please ensure the app complies with Google's OAuth 2.0 policy",
      },
      {
        status: 400,
      },
    );
  }

  if (platform === 'web') {
    const response = Response.json({
      success: true,
      issuedAt: issuedAt,
      expiresAt: issuedAt + COOKIE_MAX_AGE,
    });

    response.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=${accessToken}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${
        COOKIE_OPTIONS.path
      }; ${COOKIE_OPTIONS.httpOnly ? 'HttpOnly;' : ''} ${
        COOKIE_OPTIONS.secure ? 'Secure;' : ''
      } SameSite=${COOKIE_OPTIONS.sameSite}`,
    );

    response.headers.append(
      'Set-Cookie',
      `${REFRESH_COOKIE_NAME}=${refreshToken}; Max-Age=${
        REFRESH_COOKIE_OPTIONS.maxAge
      }; Path=${REFRESH_COOKIE_OPTIONS.path}; ${
        REFRESH_COOKIE_OPTIONS.httpOnly ? 'HttpOnly;' : ''
      } ${REFRESH_COOKIE_OPTIONS.secure ? 'Secure;' : ''} SameSite=${
        REFRESH_COOKIE_OPTIONS.sameSite
      }`,
    );

    return response;
  }

  return Response.json({
    accessToken,
    refreshToken,
  });
}

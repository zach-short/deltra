import { verifyAndCreateTokens } from '@/utils/apple-auth';

export async function POST(req: Request) {
  const { identityToken, rawNonce, givenName, familyName, email } =
    await req.json();

  try {
    const { accessToken, refreshToken } = await verifyAndCreateTokens({
      identityToken,
      rawNonce,
      givenName,
      familyName,
      email,
    });

    return Response.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}

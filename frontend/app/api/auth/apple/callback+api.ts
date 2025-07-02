import { BASE_URL, APP_SCHEME } from '@/constants';

export async function POST(request: Request) {
  const formData = await request.formData();

  const code = formData.get('code')?.toString();
  const idToken = formData.get('id_token')?.toString();
  const combinedPlatformAndState = formData.get('state')?.toString();
  const userDataStr = formData.get('user')?.toString();

  if (!combinedPlatformAndState) {
    return Response.json({ error: 'Invalid state' }, { status: 400 });
  }

  const platform = combinedPlatformAndState.split('|')[0];
  const state = combinedPlatformAndState.split('|')[1];

  let userData = null;
  if (userDataStr) {
    try {
      userData = JSON.parse(userDataStr);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }

  const outgoingParams = new URLSearchParams({
    code: code || '',
    state,
  });

  return Response.redirect(
    (platform === 'web' ? BASE_URL : APP_SCHEME) +
      '?' +
      outgoingParams.toString(),
  );
}

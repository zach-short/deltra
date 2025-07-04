import { COOKIE_NAME, JWT_SECRET } from '@/constants';
import { User } from '@/models';
import * as jose from 'jose';

function mapJwtToUser(payload: any): User {
  return {
    id: payload.sub || payload.id,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    given_name: payload.given_name,
    family_name: payload.family_name,
    email_verified: payload.email_verified,
    provider: payload.provider,
    exp: payload.exp,
    cookieExpiration: payload.cookieExpiration,
  };
}

export function withAuth<T extends Response>(
  handler: (req: Request, user: User) => Promise<T>,
) {
  return async (req: Request): Promise<T | Response> => {
    try {
      let token: string | null = null;
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      if (!token) {
        const cookieHeader = req.headers.get('cookie');
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split('=');
              acc[key.trim()] = value;
              return acc;
            },
            {} as Record<string, string>,
          );

          token = cookies[COOKIE_NAME];
        }
      }

      if (!token) {
        return Response.json(
          { error: 'Authentication required' },
          { status: 401 },
        );
      }

      const jwtSecret = JWT_SECRET;

      if (!jwtSecret) {
        return Response.json(
          { error: 'Server misconfiguration' },
          { status: 500 },
        );
      }

      const decoded = await jose.jwtVerify(
        token,
        new TextEncoder().encode(jwtSecret),
      );

      return await handler(req, mapJwtToUser(decoded.payload));
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        console.error(error.reason);
        return Response.json({ error: 'Token expired' }, { status: 401 });
      } else if (error instanceof jose.errors.JWTInvalid) {
        console.error(error.message);
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      } else {
        console.error(error);
        return Response.json(
          { error: 'Authentication failed' },
          { status: 500 },
        );
      }
    }
  };
}

import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { User } from '@/models';
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from 'expo-auth-session';
import { tokenCache } from '@/utils/cache';
import { Platform } from 'react-native';
import { BASE_URL } from '@/constants';
import * as jose from 'jose';
import { randomUUID } from 'expo-crypto';
import { handleAppleAuthError } from '@/utils';
import { initializeApiClient } from '@/utils/shared/api/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  user: null as User | null,
  signIn: () => {},
  signOut: () => {},
  signInWithApple: () => {},
  signInWithAppleWebBrowser: () => Promise.resolve(),
  signInAsGuest: () => Promise.resolve(),
  fetchWithAuth: (url: string, options: RequestInit) =>
    Promise.resolve(new Response()),
  isLoading: false,
  error: null as AuthError | null,
});

const config: AuthRequestConfig = {
  clientId: 'google',
  scopes: ['openid', 'profile', 'email'],
  redirectUri: makeRedirectUri(),
};

const appleConfig: AuthRequestConfig = {
  clientId: 'apple',
  scopes: ['name', 'email'],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

const appleDiscovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/apple/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/apple/token`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const [appleRequest, appleResponse, promptAppleAsync] = useAuthRequest(
    appleConfig,
    appleDiscovery,
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError | null>(null);
  const isWeb = Platform.OS === 'web';
  const refreshInProgressRef = React.useRef(false);

  React.useEffect(() => {
    initializeApiClient(
      () => user?.id || '',
      () => fetchWithAuth,
    );
  }, [user?.id]);

  React.useEffect(() => {
    handleResponse();
  }, [response]);

  React.useEffect(() => {
    handleAppleResponse();
  }, [appleResponse]);

  React.useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const guestUser = await AsyncStorage.getItem('guest_user');
        if (guestUser) {
          setUser(JSON.parse(guestUser));
          setIsLoading(false);
          return;
        }

        if (isWeb) {
          const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: 'GET',
            credentials: 'include',
          });

          if (sessionResponse.ok) {
            const userData = await sessionResponse.json();
            setUser(mapJwtToUser(userData));
          } else {
            console.log('No active web session found');

            try {
              await refreshAccessToken();
            } catch (e) {
              console.log('Failed to refresh token on startup');
            }
          }
        } else {
          const storedAccessToken = await tokenCache?.getToken('accessToken');
          const storedRefreshToken = await tokenCache?.getToken('refreshToken');

          if (storedAccessToken) {
            try {
              const decoded = jose.decodeJwt(storedAccessToken);
              const exp = (decoded as any).exp;
              const now = Math.floor(Date.now() / 1000);

              if (exp && exp > now) {
                console.log('Access token is still valid, using it');
                setAccessToken(storedAccessToken);

                if (storedRefreshToken) {
                  setRefreshToken(storedRefreshToken);
                }

                setUser(mapJwtToUser(decoded));
              } else if (storedRefreshToken) {
                console.log('Access token expired, using refresh token');
                setRefreshToken(storedRefreshToken);
                await refreshAccessToken(storedRefreshToken);
              }
            } catch (e) {
              console.error('Error decoding stored token:', e);

              if (storedRefreshToken) {
                console.log('Error with access token, trying refresh token');
                setRefreshToken(storedRefreshToken);
                await refreshAccessToken(storedRefreshToken);
              }
            }
          } else if (storedRefreshToken) {
            console.log('No access token, using refresh token');
            setRefreshToken(storedRefreshToken);
            await refreshAccessToken(storedRefreshToken);
          } else {
            console.log('User is not authenticated');
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [isWeb]);

  const refreshAccessToken = async (tokenToUse?: string) => {
    if (refreshInProgressRef.current) {
      console.log('Token refresh already in progress, skipping');
      return null;
    }

    refreshInProgressRef.current = true;

    try {
      console.log('Refreshing access token...');

      const currentRefreshToken = tokenToUse || refreshToken;

      console.log(
        'Current refresh token:',
        currentRefreshToken ? 'exists' : 'missing',
      );

      if (isWeb) {
        const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ platform: 'web' }),
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.json();
          console.error('Token refresh failed:', errorData);

          if (refreshResponse.status === 401) {
            signOut();
          }
          return null;
        }

        const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setUser(sessionData as User);
        }

        return null;
      } else {
        if (!currentRefreshToken) {
          console.error('No refresh token available');
          signOut();
          return null;
        }

        console.log('Using refresh token to get new tokens');
        const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform: 'native',
            refreshToken: currentRefreshToken,
          }),
        });

        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.json();
          console.error('Token refresh failed:', errorData);

          if (refreshResponse.status === 401) {
            signOut();
          }
          return null;
        }

        const tokens = await refreshResponse.json();
        const newAccessToken = tokens.accessToken;
        const newRefreshToken = tokens.refreshToken;

        if (newAccessToken) setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);

        if (newAccessToken)
          await tokenCache?.saveToken('accessToken', newAccessToken);
        if (newRefreshToken)
          await tokenCache?.saveToken('refreshToken', newRefreshToken);

        if (newAccessToken) {
          const decoded = jose.decodeJwt(newAccessToken);
          console.log('Decoded user data:', decoded);
          const hasRequiredFields =
            decoded &&
            (decoded as any).name &&
            (decoded as any).email &&
            (decoded as any).picture;

          if (!hasRequiredFields) {
          }

          setUser(mapJwtToUser(decoded));
        }

        return newAccessToken;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      signOut();
      return null;
    } finally {
      refreshInProgressRef.current = false;
    }
  };

  const handleNativeTokens = async (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      tokens;

    if (newAccessToken) setAccessToken(newAccessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);

    if (newAccessToken)
      await tokenCache?.saveToken('accessToken', newAccessToken);
    if (newRefreshToken)
      await tokenCache?.saveToken('refreshToken', newRefreshToken);

    if (newAccessToken) {
      const decoded = jose.decodeJwt(newAccessToken);
      setUser(decoded as User);
    }
  };

  const handleAppleResponse = async () => {
    if (appleResponse?.type === 'success') {
      try {
        const { code } = appleResponse.params;
        const response = await exchangeCodeAsync(
          {
            clientId: 'apple',
            code,
            redirectUri: makeRedirectUri(),
            extraParams: {
              platform: Platform.OS,
            },
          },
          appleDiscovery,
        );
        if (isWeb) {
          const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: 'GET',
            credentials: 'include',
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setUser(mapJwtToUser(sessionData));
          }
        } else {
          await handleNativeTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken!,
          });
        }
      } catch (e) {
        console.log('Error exchanging code:', e);
      }
    } else if (appleResponse?.type === 'cancel') {
      console.log('appleResponse cancelled');
    } else if (appleResponse?.type === 'error') {
      console.log('appleResponse error');
    }
  };

  async function handleResponse() {
    if (response?.type === 'success') {
      try {
        setIsLoading(true);
        const { code } = response.params;

        const formData = new FormData();
        formData.append('code', code);

        if (isWeb) {
          formData.append('platform', 'web');
        }

        console.log('request', request);
        if (request?.codeVerifier) {
          formData.append('code_verifier', request.codeVerifier);
        } else {
          console.warn('No code verifier found in request object');
        }

        const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
          method: 'POST',
          body: formData,
          credentials: isWeb ? 'include' : 'same-origin',
        });

        if (isWeb) {
          const userData = await tokenResponse.json();
          if (userData.success) {
            const sessionResponse = await fetch(
              `${BASE_URL}/api/auth/session`,
              {
                method: 'GET',
                credentials: 'include',
              },
            );

            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              setUser(mapJwtToUser(sessionData));
            }
          }
        } else {
          const tokens = await tokenResponse.json();
          await handleNativeTokens(tokens);
        }
      } catch (e) {
        console.error('Error handling auth response:', e);
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === 'cancel') {
      alert('Sign in cancelled');
    } else if (response?.type === 'error') {
      setError(response?.error as AuthError);
    }
  }

  const fetchWithAuth = async (url: string, options: RequestInit) => {
    if (isWeb) {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
      });

      if (response.status === 401) {
        console.log('API request failed with 401, attempting to refresh token');

        await refreshAccessToken();

        if (user) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        }
      }

      return response;
    } else {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        console.log('API request failed with 401, attempting to refresh token');

        const newToken = await refreshAccessToken();

        if (newToken) {
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        }
      }

      return response;
    }
  };

  const signIn = async () => {
    try {
      if (!request) {
        console.log('No request');
        return;
      }

      await promptAsync();
    } catch (e) {
      console.log(e);
    }
  };

  const signInWithAppleWebBrowser = async () => {
    try {
      if (!appleRequest) {
        console.log('No appleRequest');
        return;
      }
      await promptAppleAsync();
    } catch (e) {
      console.log(e);
    }
  };

  const signInWithApple = async () => {
    try {
      const rawNonce = randomUUID();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: rawNonce,
      });

      if (credential.fullName?.givenName && credential.email) {
        // You can handle this on the server side as well, just keep in mind that
        // Apple only provides name and email on the first sign in
        // On subsequent sign ins, these fields will be null
        console.log('🍎 first sign in');
      }

      const appleResponse = await fetch(
        `${BASE_URL}/api/auth/apple/apple-native`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identityToken: credential.identityToken,
            rawNonce,

            // IMPORTANT:
            // Apple only provides name and email on the first sign in
            // On subsequent sign ins, these fields will be null
            // We need to store the user info from the first sign in in our database
            // And retrieve it on subsequent sign ins using the stable user ID
            givenName: credential.fullName?.givenName,
            familyName: credential.fullName?.familyName,
            email: credential.email,
          }),
        },
      );

      const tokens = await appleResponse.json();
      await handleNativeTokens(tokens);
    } catch (e) {
      console.log(e);
      handleAppleAuthError(e);
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser: User = {
        id: `guest_${randomUUID()}`,
        email: '',
        name: 'Guest User',
        provider: 'guest',
      };

      await AsyncStorage.setItem('guest_user', JSON.stringify(guestUser));
      setUser(guestUser);
    } catch (error) {
      console.error('Error creating guest user:', error);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('guest_user');

    if (isWeb) {
      try {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error during web logout:', error);
      }
    } else {
      await tokenCache?.deleteToken('accessToken');
      await tokenCache?.deleteToken('refreshToken');
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        signInWithApple,
        signInWithAppleWebBrowser,
        signInAsGuest,
        isLoading,
        error,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

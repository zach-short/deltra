# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cross-platform authentication example built with Expo that demonstrates BFF (Backend-for-Frontend) architecture for Google and Apple Sign-In. The project uses file-based routing with Expo Router and implements JWT-based token management for native platforms and cookie-based session management for web.

## Development Commands

### Setup and Installation

```bash
bun install
```

### Development

```bash
expo start -d
expo start --web
expo run:ios
expo run:android
```

### Testing and Quality

```bash
jest --watchAll
expo lint
```

### Build and Deploy

```bash
eas build --platform ios
eas build --platform android
npx expo export --platform web -c
```

### Utility Commands

```bash
node ./scripts/reset-project.js
```

## Architecture Overview

### Authentication System

The app implements a sophisticated dual-authentication system:

- **Web Platform**: Uses HTTP-only cookies for session management (secure against XSS)
- **Native Platforms**: Uses JWT tokens stored in Expo SecureStore
- **Token Refresh**: Automatic token refresh with fallback handling
- **Providers**: Google OAuth and Apple Sign-In with platform-specific implementations

### API Architecture (BFF Pattern)

The project uses Expo API Routes to create a Backend-for-Frontend:

- `app/api/auth/` - Core authentication endpoints (authorize, token, session, refresh, logout)
- `app/api/auth/apple/` - Apple-specific authentication endpoints
- `app/api/protected/` - Endpoints requiring authentication
- `app/api/public/` - Public endpoints

### Key Authentication Flow Components

1. **Context Provider** (`context/auth.tsx`): Centralized auth state management with platform detection
2. **Middleware** (`utils/middleware.ts`): `withAuth` HOF for protecting API routes
3. **Token Management**: Automatic refresh logic with concurrent request handling
4. **Platform Detection**: Handles web vs native authentication differently

### File Structure Patterns

- **File-based Routing**: Expo Router with typed routes enabled
- **Component Organization**: Shared components in `/components`, themed components for consistency
- **Utils Organization**: Authentication utilities, caching, constants, and middleware
- **API Routes**: Follows Expo Router API convention with `+api.ts` suffix

### Environment Configuration

Required environment variables (see `.env.local.example`):

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET` for token signing
- `EXPO_PUBLIC_BASE_URL` for API base URL
- `EXPO_PUBLIC_SCHEME` matching app.json scheme
- `APPLE_CLIENT_SECRET` (generate at https://applekeygen.expo.app)

### Platform-Specific Considerations

**iOS**:

- Requires `usesAppleSignIn: true` in app.json
- Uses `expo-apple-authentication` for native Apple Sign-In
- Native token storage via Expo SecureStore

**Web**:

- Uses OAuth redirect flow with PKCE
- Secure HTTP-only cookies for session management
- Automatic CSRF protection

**Android**:

- Uses OAuth redirect flow
- Native token storage via Expo SecureStore

### Testing Strategy

- Jest configuration with `jest-expo` preset
- Test files should follow standard Jest conventions

### Key Dependencies

**Authentication**: expo-auth-session, expo-apple-authentication, jose (JWT handling)
**Storage**: expo-secure-store (native), HTTP-only cookies (web)
**Navigation**: expo-router with typed routes
**UI**: React Native with themed components


# Deltra - Cost Basis Tracker for Covered Calls

Deltra is a minimal, modern app to help investors track cost basis, covered calls sold, and how options impact their holdings with a Raycast-inspired aesthetic and a focus on simplicity and clarity.

## Stack

| Layer    | Tech                                                           |
| -------- | -------------------------------------------------------------- |
| Frontend | [Expo](https://expo.dev/) (React Native for iOS, Android, Web) |
| Auth     | [Supabase](https://supabase.com/) (Google & Apple OAuth)       |
| Backend  | Go with [Gin](https://gin-gonic.com/)                          |
| Database | Supabase Postgres                                              |
| Hosting  | Supabase (for now)                                             |

## Monorepo Structure

```
deltra/
├── frontend/
│   ├── app/
│   ├── assets/
│   └── ...
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── config/
│   └── main.go
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Go (1.20+)
- Supabase project with Google & Apple auth enabled
- `supabase` CLI (optional, for local testing)

### Setup

#### 1. Clone

```bash
git clone https://github.com/zach-short/deltra.git
cd deltra
```

#### 2. Setup Environment

Create a .env file in the root, and optionally inside `/frontend` and `/backend`.

Minimal .env for backend:

```env
PORT=8080
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
```

For frontend:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

#### 3. Frontend (Expo Web & Mobile)

```bash
cd frontend
bun install
bunx expo start
```

#### 4. Backend (Go + Gin)

```bash
cd backend
go mod tidy
go run main.go
```

## Features (Work in Progress)

- **Authentication**: Google & Apple OAuth via Supabase
- **Stock Tracking**: Add stocks and track cost basis
- **Covered Calls**: Add covered calls with adjustment history
- **Returns Analysis**: Display implied return from premiums
- **Visualization**: Rolling calls and basis shifts visualization
- **AI Assistant**: Optimal roll/call analysis (planned)

## Design Philosophy

Deltra is built with a modern UX - fast, minimal, keyboard-centric on web, and gesture-friendly on mobile. Designed for retail traders who actually track their strategy, not just vibe it.

## Technical Todo

- [ ] Validate auth tokens on backend requests
- [ ] Rate limiting + robust error middleware
- [ ] CI/CD (GitHub Actions)
- [ ] Unit tests for models + controllers
- [ ] Clean frontend animations + skeleton loading

## Support & Contributions

This is currently a solo project - contributions, feedback, and PRs are welcome.

If you want to collaborate or pair on anything, reach out anytime.

## Additional Resources

Let me know if you want:

- A deploy guide (Expo Hosting + Supabase + Railway/Render/Fly.io)
- A license section
- CI/CD config suggestions (GitHub Actions YAML)

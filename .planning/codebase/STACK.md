# Technology Stack

**Analysis Date:** 2026-02-28

## Languages

**Primary:**
- TypeScript 5.7.3 - Used across all workspaces (backend, frontend, shared)
- JavaScript (ESNext) - Runtime module format, transpiled via TypeScript

**Secondary:**
- JSON - Configuration and locale files
- CSS - Styling with Tailwind CSS and custom stylesheets

## Runtime

**Environment:**
- Node.js (ES2022 target, ESNext module format - Node 18+ recommended)
- Browser (React 19 web frontend)

**Package Manager:**
- Yarn (required, enforced in CLAUDE.md)
- Lockfile: `yarn.lock`

## Frameworks

**Core:**
- React 19.0.0 - Frontend UI framework (web app)
- Socket.IO 4.8.1 - Real-time bidirectional communication (server and client)
- Node.js native `http` module - Server HTTP transport layer

**Testing:**
- Vitest 3.0.8 - Unit test runner (server and web)
- jsdom 28.1.0 - DOM implementation for frontend testing

**Build/Dev:**
- Vite 6.1.0 - Frontend build tool and dev server (web)
- esbuild 0.25.0 - Backend bundler (server)
- tsx 4.19.3 - TypeScript execution and watch mode (server development)
- TypeScript 5.7.3 - Type checking and compilation

## Key Dependencies

**Critical:**
- socket.io 4.8.1 - Server WebSocket multiplexer, enables real-time game state sync
- socket.io-client 4.8.1 - Client WebSocket connection to server
- ioredis 5.4.2 - Redis client for game state persistence and TTL management
- @imposter/shared 1.0.0 - Shared types and DTOs between server and client

**Infrastructure:**
- nanoid 5.1.5 - UUID generation for room IDs and player IDs

**Frontend Libraries:**
- react-dom 19.0.0 - React DOM rendering
- pixel-retroui 2.1.0 - Retro pixel-art UI component library
- qrcode.react 4.2.0 - QR code generation for room sharing
- i18next 25.8.11 - Internationalization framework
- react-i18next 16.5.4 - React i18n integration

**Styling:**
- tailwindcss 3.4.17 - Utility-first CSS framework
- autoprefixer 10.4.20 - PostCSS plugin for vendor prefixes
- postcss 8.5.3 - CSS transformation framework

**Type Definitions:**
- @types/react 19.0.10 - React type definitions
- @types/react-dom 19.0.4 - React DOM type definitions
- @types/node 22.13.8 - Node.js type definitions

## Configuration

**Environment:**
- Server env vars configured at startup (see `apps/server/src/index.ts`):
  - `PORT` - Socket server port (default: 3001)
  - `REDIS_URL` - Redis connection string (default: redis://127.0.0.1:6379)
- Client server URL configured in `apps/web/src/data/socketGateway.ts` (passed to SocketGateway constructor)
- Locale stored in browser localStorage (key: `imposter_locale`, default: `vi`)

**Build:**
- `tsconfig.base.json` - Root TypeScript configuration (ES2022 target, ESNext modules, Bundler resolution)
- `apps/web/vite.config.ts` - Vite config for React dev server (port 5173) and build
- `apps/web/tailwind.config.ts` - Tailwind configuration extending AppColor design tokens
- `apps/web/postcss.config.js` - PostCSS configuration for Tailwind and autoprefixer
- `.prettierrc` - Code formatter config (100 char line width, trailing commas, single quotes)
- `.firebaserc` - Firebase project mapping (default: imposter-game-staging)
- `firebase.json` - Firebase Hosting config (serves `apps/web/dist`, rewrites to `/index.html`)

**TypeScript Paths:**
- `@imposter/shared` → `packages/shared/src/index.ts` - Shared models and types

## Platform Requirements

**Development:**
- Node.js 18+ (ES2022 support)
- Yarn package manager
- Redis server running locally (default: `127.0.0.1:6379`)

**Production:**
- Node.js 18+ runtime for Socket.IO server
- Redis instance accessible via `REDIS_URL` env var
- Firebase Hosting for web frontend (single-page app with rewrites)
- Network connectivity between web clients and Socket.IO server

---

*Stack analysis: 2026-02-28*

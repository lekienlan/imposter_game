# External Integrations

**Analysis Date:** 2026-02-28

## APIs & External Services

**Real-Time Communication:**
- Socket.IO - WebSocket-based event-driven communication
  - Server: `socket.io` 4.8.1
  - Client: `socket.io-client` 4.8.1
  - Configuration: `apps/server/src/infrastructure/socketServer.ts` (CORS: `origin: '*'`)
  - Transports: WebSocket only (enforced in `apps/web/src/data/socketGateway.ts`)

## Data Storage

**Databases:**
- Redis (in-memory data store)
  - Client: `ioredis` 5.4.2
  - Connection: Environment variable `REDIS_URL` (default: `redis://127.0.0.1:6379`)
  - Purpose: Game state persistence (`RedisGameStateRepository` at `apps/server/src/infrastructure/model/RedisGameStateRepository.ts`)
  - TTL: 4 hours (14,400 seconds) per room
  - Key pattern: `room:{roomId}`

**File Storage:**
- None - Application is stateless except for Redis

**Caching:**
- Redis (serves as both cache and persistent storage for game state)

## Authentication & Identity

**Auth Provider:**
- Custom (None) - No third-party auth service
  - Implementation: Player identified by `playerId` (generated via nanoid)
  - Room access: Simple room code (no authentication required, code-based access control)
  - No user accounts or session management

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console logging only (see `apps/server/src/infrastructure/socketServer.ts` line 49: `console.log` on server startup)
- No structured logging or external log aggregation

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting for web frontend
  - Configured in `firebase.json` and `.firebaserc`
  - Public directory: `apps/web/dist`
  - Rewrites: All routes → `/index.html` (SPA rewrite rule)
  - Project: `imposter-game-staging` (default in `.firebaserc`)

**Backend Hosting:**
- Not specified in codebase - Server deployment configuration missing
  - Socket.IO server expects to run on `PORT` (default: 3001)
  - Requires externally accessible hostname for clients to connect

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or similar configuration found

**Build Commands:**
```bash
npm run build:web       # Build frontend for production
npm run build:staging   # Build frontend for staging environment
npm run build           # Build all workspaces
npm run dev            # Run dev servers (web + server concurrently)
```

## Environment Configuration

**Required env vars:**

**Server (`apps/server/src/index.ts`):**
- `PORT` - Socket server port (optional, default: 3001)
- `REDIS_URL` - Redis connection string (optional, default: redis://127.0.0.1:6379)

**Client (`apps/web`):**
- `VITE_SERVER_URL` - Socket.IO server URL (must be configured in SocketGateway constructor during app initialization)
- No env vars detected for locale (localStorage used instead)

**Secrets location:**
- `.env` and `.env.*` files (present in `.gitignore` but not in codebase)
- No secrets management service (AWS Secrets, Vault, etc.) detected

## Webhooks & Callbacks

**Incoming:**
- None - Socket.IO is event-driven but not triggered by external webhooks

**Outgoing:**
- None - Application does not call external webhooks

## Socket.IO Events

**Client → Server (ClientToServerEvents):**
Located in `packages/shared/src/dto/socket.ts`
- `room:create` - Create new game room
- `room:preview` - Preview room before joining
- `room:join` - Join existing room
- `player:reconnect` - Reconnect player to room
- `game:start` - Start game
- `game:reset` - Reset game to initial state
- `room:disband` - Disband room (host only)
- `statement:submit` - Submit word/statement during word phase
- `voting:start` - Begin voting phase
- `vote:submit` - Submit vote on player

**Server → Client (ServerToClientEvents):**
Located in `packages/shared/src/dto/socket.ts`
- `state:update` - Push updated game state to client
- `server:error` - Server error notification
- `room:created` - Room creation confirmation
- `room:joined` - Room join confirmation
- `room:previewed` - Room preview data
- `room:disbanded` - Room disbanded notification

## Data Flow

**Connection Pattern:**
1. Client connects via `SocketGateway` (`apps/web/src/data/socketGateway.ts`)
2. Server accepts connection in `socketServer.ts` and registers handlers via `registerSocketHandlers`
3. Handlers invoke use cases (`apps/server/src/application/usecases/*`)
4. Use cases read/write game state via `RedisGameStateRepository`
5. Server emits state updates to clients via Socket.IO

**Game State Persistence:**
- Game state stored in Redis with 4-hour TTL
- State is JSON-serialized game object (`GameState` type from `@imposter/shared`)
- Room ID is key: `room:{roomId}`

---

*Integration audit: 2026-02-28*

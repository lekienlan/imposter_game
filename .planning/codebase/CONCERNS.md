# Codebase Concerns

**Analysis Date:** 2026-02-28

## Tech Debt

**Large Game Rules Module:**
- Issue: `apps/server/src/utils/gameRules.ts` is 376 lines, violating the 300-line constraint. Contains multiple complex functions (role assignment, vote resolution, white role transition, winner evaluation) that should be split into focused modules.
- Files: `apps/server/src/utils/gameRules.ts`
- Impact: Difficult to test individual rules, harder to modify voting/role logic without affecting other systems, code is harder to review and understand at a glance
- Fix approach: Split into separate files by concern - `RoleAssignment.ts`, `VoteResolution.ts`, `WinnerEvaluation.ts`, `WhiteTransition.ts` each handling a single responsibility

**Socket Gateway Event Handler Registration:**
- Issue: `apps/web/src/data/socketGateway.ts` stores multiple handler arrays (stateUpdateHandlers, errorHandlers, roomCreatedHandlers, etc.) and re-registers them each time `createSocket()` is called. This pattern can lead to memory leaks and duplicate handler invocations.
- Files: `apps/web/src/data/socketGateway.ts` (lines 34-42)
- Impact: Potential memory leaks if socket is recreated multiple times; handlers may fire multiple times for same event; difficult to debug event flow
- Fix approach: Implement proper cleanup/disposal pattern. Either prevent socket recreation or clear handler arrays before re-registering. Consider using a socket factory pattern.

**Scattered localStorage Usage Without Abstraction:**
- Issue: localStorage operations are scattered across `useGatewayEvents.ts`, `App.tsx`, `useLocale.ts` without a centralized storage abstraction. No validation of retrieved values.
- Files: `apps/web/src/domain/hooks/useGatewayEvents.ts` (lines 60-73, 93-94, 132-157), `apps/web/src/presentation/App.tsx` (lines 37, 81-96, 129), `apps/web/src/data/i18nSetup.ts`
- Impact: Makes it hard to change storage implementation; no type safety for stored values; susceptible to data corruption or tampering; roomId/playerId could be stale or invalid
- Fix approach: Create `StorageService` module in `apps/web/src/infrastructure` with typed methods like `saveSession(roomId, playerId)`, `getSession()`, `clearSession()`. Validate retrieved values against expected format.

**Hardcoded Error Messages Without i18n:**
- Issue: Error messages thrown in use cases are in English without internationalization support. Users in non-English locales see untranslated errors.
- Files: `apps/server/src/utils/gameRules.ts` (multiple throw statements), `apps/server/src/application/usecases/*.ts` (all use case files)
- Impact: Poor user experience for non-English speakers; errors are not translatable
- Fix approach: Create error codes/enum (e.g., `ERROR_ROOM_NOT_FOUND`) and translate on the client side, or pass error codes from server and translate in gateway

**Missing Reconnection Timeout Validation:**
- Issue: `apps/web/src/domain/hooks/useGatewayEvents.ts` uses a hardcoded 30-second reconnection timeout (line 124). No exponential backoff or configurable retry strategy.
- Files: `apps/web/src/domain/hooks/useGatewayEvents.ts` (line 124)
- Impact: Users with intermittent connections may lose session after 30 seconds regardless of network conditions; no user control over reconnection behavior
- Fix approach: Make timeout configurable via environment variable, implement exponential backoff with max retries, or add UI to let users retry manually

## Known Bugs

**Word Popup May Not Trigger on Certain Phase Transitions:**
- Symptoms: Word reveal popup may not appear for some players when entering ROUND_DESCRIPTION phase
- Files: `apps/web/src/domain/hooks/useGatewayEvents.ts` (lines 85-108), `apps/web/src/presentation/App.tsx` (lines 67-72)
- Trigger: Occurs when game state updates happen rapidly or when word changes between rounds and the marker logic fails to detect change
- Workaround: Manual refresh or re-connection resets the popup state and triggers display
- Issue: The word marker is calculated as `${playerId}:${round}:${word}` but relies on strict equality check. If word string changes case or whitespace between rounds, marker won't match and popup won't display.

**Vote Retraction State Not Synced Properly:**
- Symptoms: In two-step voting, selecting then deselecting a target doesn't always update UI immediately; broadcast may miss the retraction
- Files: `apps/web/src/presentation/voting/VotingPanel.tsx`, `apps/server/src/utils/gameRules.ts` (retractVote function)
- Trigger: Rapid clicking to select/deselect same target in voting phase
- Root cause: `retractVote()` in gameRules removes from votes array but may not always reach the broadcast if socket event is dropped

**LocalStorage Session Persistence on Reconnection:**
- Symptoms: Player rejoins with stale roomId/playerId from localStorage, connecting to expired room, then gets "Room not found" error with no clear recovery path
- Files: `apps/web/src/domain/hooks/useGatewayEvents.ts` (lines 132-157), `apps/web/src/presentation/App.tsx` (lines 81-92)
- Trigger: Long network disconnect (>4 hours Redis TTL), player returns and browser has cached session data
- Root cause: No validation that stored room ID still exists before attempting reconnect; no TTL matching between client cache and Redis

## Security Considerations

**Open CORS Configuration:**
- Risk: CORS is set to `origin: '*'` allowing any domain to connect to the socket server and interact with game state
- Files: `apps/server/src/infrastructure/socketServer.ts` (lines 22-24)
- Current mitigation: Game state is sanitized per viewer before broadcast; no sensitive data exposed except per-player state
- Recommendations: Restrict CORS to known origins (web domain, staging domain). Store allowed origins in environment variable. Implement origin validation before accepting connections.

**No Rate Limiting on Socket Events:**
- Risk: Malicious client can spam vote submissions, statement submissions, game resets to DOS the server
- Files: `apps/server/src/infrastructure/socketHandlers.ts` (all event handlers)
- Current mitigation: Each use case validates authorization (e.g., "Only host can submit votes") but no rate limit on event frequency
- Recommendations: Implement per-socket rate limiting (e.g., max 10 events per second). Add cooldown between vote submissions (e.g., 100ms). Use middleware to enforce limits.

**Client-Side Vote Validation Missing:**
- Risk: No validation that targetPlayerId exists and is alive on client before submitting vote. Malicious client could vote for non-existent player, bypassing UI validation
- Files: `apps/web/src/domain/usecases/SubmitVote.ts` (no validation), `apps/web/src/presentation/voting/VotingPanel.tsx`
- Current mitigation: Server validates in `SubmitVoteUseCase.execute()` but client sends unvalidated data
- Recommendations: Add client-side validation that target is in alivePlayers before emitting vote. Add integrity check on target selection.

**Environment Variable Exposure:**
- Risk: `VITE_SERVER_URL` and `VITE_SHARE_ORIGIN` are embedded in bundle as client-side env vars. Build artifacts reveal server URL
- Files: `apps/web/src/presentation/App.tsx` (line 22), `apps/web/src/presentation/shared/ShareModal.tsx` (line 17)
- Current mitigation: These are dev/staging URLs, not sensitive credentials
- Recommendations: Document that these are public and non-sensitive. Consider defaulting to same-origin if not provided.

## Performance Bottlenecks

**Large GameState Broadcast on Every Event:**
- Problem: `broadcastState()` in socketHandlers serializes full GameState and sends to all players on every vote/statement/phase change. GameState includes full player array, votes, speakingOrder for each broadcast.
- Files: `apps/server/src/infrastructure/socketHandlers.ts` (lines 46-57, used in all handlers)
- Cause: Sends complete sanitized state rather than delta/patch. No compression or incremental updates.
- Improvement path: Implement state diffing to send only changed fields. Create `StateUpdate` DTO with `prev` and `next` values. For large games (20+ players), broadcast size could be reduced by 70%+. Use binary protocol (MessagePack) instead of JSON if scaling beyond 1000 concurrent rooms.

**No Pagination or Filtering for Vote History:**
- Problem: All votes stored in gameState.votes array and sent to all players every update. If game has 8 rounds with multiple vote rounds, votes array grows indefinitely during the session.
- Files: `apps/server/src/utils/gameRules.ts` (summarizeVotes clears votes between rounds), game state structure in `@imposter/shared`
- Cause: Votes are retained in gameState rather than cleaned up after round resolution
- Improvement path: Clear votes array after round completion (after elimination result is broadcast). Archive vote history separately if audit trail needed.

**Synchronous Redis JSON.stringify/parse:**
- Problem: GameState serialized to JSON string and stored in Redis on every state change. No batch operations. Each save is a separate Redis SET call.
- Files: `apps/server/src/infrastructure/model/RedisGameStateRepository.ts` (lines 22-28)
- Cause: Simple write-through pattern without buffering
- Improvement path: For high-traffic rooms, use Redis transactions or pipelining to batch saves. Consider storing separate structures for votes (Hash) and speakingOrder (List) instead of serializing entire object.

## Fragile Areas

**Voting Phase State Machine:**
- Files: `apps/server/src/utils/gameRules.ts` (resolveVoting, applyRoundResult, advanceAfterRound functions), `apps/server/src/application/usecases/SubmitVoteUseCase.ts`, `apps/server/src/infrastructure/socketHandlers.ts` (vote:submit handler)
- Why fragile: Complex logic for handling PENDING → REVOTE → ELIMINATED transitions. White role special case in CLASSIC mode only. Tie-breaking uses firstRoundTopTargetIds which must be preserved across vote rounds. One missing null check in tie-break candidate selection causes runtime error.
- Safe modification: Add integration tests for all vote scenarios (unanimous vote, skip vote, tie with revote, tie-break in round 2+). Test white player tie-break rules. Validate firstRoundTopTargetIds is set before using in tie-break.
- Test coverage: Unit tests exist in `apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts` but missing integration tests for full vote → elimination → round advance flow

**White Role Transition Logic:**
- Files: `apps/server/src/utils/gameRules.ts` (applyWhiteTransition function, lines 334-349), vote resolution in resolveVoting
- Why fragile: White player auto-converts to CITIZEN only if mode=CLASSIC AND round >= 2 AND white is alive. Logic depends on gameSettings.mode and round counter. If white is eliminated in round 1, transition never happens. If round is incorrect, timing is wrong.
- Safe modification: Add assertion that white transition only happens once. Test all combinations: (CLASSIC mode, HARDCORE mode) × (white enabled, disabled) × (white alive, dead) × (round 1, 2, 3+)
- Test coverage: No dedicated test for white transition; only covered implicitly in game flow tests

**Share Link URL Building and Validation:**
- Files: `apps/web/src/domain/usecases/ShareLink.ts` (buildShareUrl, resolveShareOrigin functions), `apps/web/src/domain/hooks/useGatewayEvents.ts` (line 140, parseShareInvite usage)
- Why fragile: Share link parsing relies on URLSearchParams and regex. resolveShareOrigin validates origin format but error message is in Vietnamese. If VITE_SHARE_ORIGIN is malformed, entire share feature breaks silently.
- Safe modification: Add validation that VITE_SHARE_ORIGIN is a valid URL origin at build time. Use URL constructor for validation rather than regex. Test with trailing slashes, port numbers, subdomains.
- Test coverage: Basic test in `apps/web/src/domain/__tests__/ShareLink.test.ts` but missing edge cases (invalid domains, protocol mismatch)

**Room Disband Cascade:**
- Files: `apps/server/src/application/usecases/DisbandRoomUseCase.ts`, `apps/server/src/infrastructure/socketHandlers.ts` (room:disband handler), `apps/web/src/domain/hooks/useGatewayEvents.ts` (onRoomDisbanded)
- Why fragile: Only host can disband (checked in use case). When room disbands, all players receive `room:disbanded` event and clear state. If host disconnects before disband completes, room persists in Redis for 4 hours (TTL). Non-host has 3s timeout to clear state; host clears immediately (line 78).
- Safe modification: Implement room cleanup on host disconnect. Add explicit timeout cleanup for non-host state (maybe longer than 3s for slow networks). Test disband with varying network conditions.
- Test coverage: No test for disband functionality; manual testing only

## Scaling Limits

**Redis TTL Fixed at 4 Hours:**
- Current capacity: Single Redis instance, games expire after 4 hours
- Limit: If game plays longer than 4 hours (8 rounds max is 2-3 hours but buffer needed), state is lost mid-game and room becomes unrecoverable
- Scaling path: Make TTL configurable based on game duration. Reset TTL on every state update to keep active rooms fresh. Monitor Redis memory with large number of concurrent rooms.

**Single Room Index:**
- Current capacity: Room ID generation uses `nanoid(6).toUpperCase()` (62^6 ≈ 56 billion possible IDs)
- Limit: No index or query capability; room lookup is O(1) via Redis key but no way to list/search rooms or implement room history
- Scaling path: Add secondary index in Redis (Set of active room IDs) for listing. If supporting room history/replay, move to database with proper indexing.

**In-Memory Socket.IO Store:**
- Current capacity: Default adapter stores all rooms in process memory. Works for single server up to ~10k concurrent rooms
- Limit: Breaks with multiple servers; no room persistence across restarts; memory grows linearly with concurrent rooms
- Scaling path: Use Redis adapter for Socket.IO (`socket.io-redis` or `socket.io-redis-adapter`) to support multiple servers. Persistence is automatic through Redis.

## Dependencies at Risk

**ioredis Version 5.4.2:**
- Risk: No major breaking changes expected but Redis protocol evolving. Lock to range that allows patch updates.
- Impact: If Redis server changes significantly (7.0+ features), client must be updated
- Migration plan: Monitor Redis changelog; update ioredis before updating Redis server. Test in staging first.

**socket.io Version 4.8.1:**
- Risk: Major version differences between server (4.8.1) and client (4.8.1) must match. Npm workspace doesn't enforce this.
- Impact: Client-server version mismatch causes protocol negotiation failures and connection drops
- Migration plan: Pin versions identically in both `@imposter/server` and `@imposter/web` package.json. Add CI check that versions match.

**React 19 With Concurrent Features:**
- Risk: React 19 introduces concurrent rendering. If `setGameState` updates cause too many state transitions, rendering could stall
- Impact: UI freezes briefly when receiving rapid state updates in group voting scenarios
- Migration plan: Monitor frame rates during stress tests (20+ concurrent players voting). Use `React.startTransition()` wrapper around state updates if needed.

## Missing Critical Features

**No Game History or Replay:**
- Problem: Games are ephemeral; no way to review past games, access statistics, or replay voted-out players' statements
- Blocks: Can't learn from past games; no competitive ladder or leaderboard possible; no audit trail for disputes

**No Player Disconnection Recovery UI:**
- Problem: When player disconnects, they see "Reconnecting..." banner for 30s then session clears. No option to manually reconnect or see disconnection reason
- Blocks: Can't recover from network hiccups; players confused by session loss

**No Moderation or Admin Tools:**
- Problem: No way to kick players, mute, or remove inappropriate content. Host has limited control.
- Blocks: Can't handle disruptive players; no abuse reporting

## Test Coverage Gaps

**Game Rule Edge Cases:**
- What's not tested: Role distribution edge cases (e.g., 1 spy vs 99 citizens in HARDCORE). Tie-breaking when firstRoundTopTargetIds is empty. White role with 2 players total in CLASSIC.
- Files: `apps/server/src/utils/gameRules.ts`, test file `apps/server/src/utils/__tests__/gameRules.test.ts`
- Risk: Edge case triggering runtime error in production (e.g., "Cannot find first tie-break candidate")
- Priority: High

**Front-End Component Integration:**
- What's not tested: Multiple phases in sequence (description → voting → round result → next round). Word popup with rapid phase changes. Vote submission then phase change race condition.
- Files: `apps/web/src/presentation/**`, `apps/web/src/domain/hooks/useGatewayEvents.ts`
- Risk: UI state desynchronization with server state; popup appears at wrong time; form data lost on phase change
- Priority: High

**Reconnection Scenarios:**
- What's not tested: Reconnect with expired room (>4 hours). Reconnect after room disbanded. Reconnect during voting phase. Reconnect with invalid playerId.
- Files: `apps/web/src/domain/hooks/useGatewayEvents.ts`, `apps/server/src/application/usecases/ReconnectPlayerUseCase.ts`
- Risk: Silent failure or cryptic error when rejoin fails; no recovery path for user
- Priority: Medium

**CORS and Security:**
- What's not tested: Requests from unauthorized origins. Socket connections without proper handshake. Rate limiting under load.
- Files: `apps/server/src/infrastructure/socketServer.ts`, socket handlers
- Risk: Security vulnerabilities go undetected in CI; production exposure
- Priority: High

---

*Concerns audit: 2026-02-28*

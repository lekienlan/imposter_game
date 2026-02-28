# Phase 1: Selector Foundation - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract derived game-state logic from inline presentation components into a shared `gameSelectors.ts` module. Pure refactor — zero visible UI change. Enables safe implementation of Phases 2-5 without duplicating logic across components.

Functions to extract: `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`, `canViewerSeeWord`, `isGameOver`.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
- All implementation decisions deferred to Claude (pure technical refactor with no user-facing decisions)
- File placement within domain layer
- Test coverage approach and depth
- Whether to extract additional inline derived state beyond the 5 named functions
- How aggressively to clean up inline logic after extraction

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-selector-foundation*
*Context gathered: 2026-02-28*

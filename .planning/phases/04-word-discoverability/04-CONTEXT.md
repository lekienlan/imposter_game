# Phase 4: Word Discoverability - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable a player who missed or closed the Word Reveal popup to find their secret word again — via a closing cue on the popup and an inline access mechanism on their ViewerCard during DISCUSSION and VOTING phases.

</domain>

<decisions>
## Implementation Decisions

### Inline Word Access
- A 👁 eye icon button is placed on the player's own ViewerCard
- Tapping the icon shows the word in a mini popup near the card (not inline text, not a full-screen overlay)
- The word is hidden by default — the player must tap the eye icon to reveal it (protects against screen-peeking)
- This button/icon is visible during DISCUSSION and VOTING phases

### Claude's Discretion
- Closing cue behavior (text, animation, duration) when the Word Reveal popup dismisses
- ViewerCard one-time pulse/highlight visual design after popup closes
- Mini popup styling, positioning, and auto-dismiss behavior
- Whether the mini popup stays open until manually dismissed or auto-closes

</decisions>

<specifics>
## Specific Ideas

No specific references provided — open to standard approaches for mini popup and eye icon styling.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-word-discoverability*
*Context gathered: 2026-03-03*

---
phase: 02-phase-clarity
verified: 2026-03-18T11:14:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Phase badge visible in WAITING phase for both host and non-host"
    expected: "Badge shows 'CHO' (Vietnamese 'Chờ') in top bar with correct color tone"
    why_human: "Visual rendering depends on i18n resolution and CSS — cannot verify pixel output from source"
  - test: "Badge absent in ROLE_DISTRIBUTION and GAME_ENDED phases"
    expected: "Top bar shows only room code and share button during those phases"
    why_human: "Conditional rendering requires live game session to step through phases"
  - test: "Role-differentiated guidance text in VOTING phase"
    expected: "Host sees 'Chọn người bị nghi ngờ'; non-host sees 'Đang chờ host bầu chọn'"
    why_human: "Requires two simultaneous browser sessions with different roles to compare"
  - test: "No raw Phase enum strings visible in top bar"
    expected: "No strings like 'ROUND_VOTING', 'GAME_CREATION' appear in any UI area"
    why_human: "Runtime check — source confirms t() wrapping but actual translation keys must resolve"
---

# Phase 2: Phase Clarity Verification Report

**Phase Goal:** Players know exactly which phase the game is in without reading carefully
**Verified:** 2026-03-18T11:14:00Z
**Status:** human_needed (all automated checks passed; visual confirmation pending)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | phaseLabel maps every Phase enum value to a non-empty i18n key string | VERIFIED | All 11 Phase values covered in `phasePresentation.ts` lines 17-29; 12 unit tests confirm every value + exhaustive loop test |
| 2 | phaseGuidanceKey returns a role-differentiated i18n key for every Phase and both host/non-host | VERIFIED | `phaseGuidanceKey` at line 45 composes role + slot; 15 unit tests confirm including exhaustive loops |
| 3 | All 4 locale files contain same key structure under phase.label.* and phase.guidance.* | VERIFIED | Python check: vi/en/ko/zh all have 5 label keys and 7 host + 7 player guidance keys; zero missing keys |
| 4 | Old phaseGuide object no longer exported from phasePresentation.ts | VERIFIED | grep confirms "phaseGuide" absent from both phasePresentation.ts and ActionBoard.tsx |
| 5 | Phase badge (pill) visible in top bar, hidden on GAME_ENDED and ROLE_DISTRIBUTION | VERIFIED (code) | `showPhaseInfo` guard at ActionBoard.tsx lines 52-54; badge wrapped in `{showPhaseInfo && ...}` at lines 77-81 |
| 6 | One-line guidance text appears, differentiated by host/non-host | VERIFIED (code) | `t(phaseGuidanceKey(gameState.phase, viewerHost))` at line 104; same `showPhaseInfo` guard |
| 7 | No hardcoded strings in ActionBoard.tsx JSX — all text via t() | VERIFIED | No `guide.title`/`guide.description`/`guide.tip` references found; badge and guidance both go through `t()` |

**Score:** 7/7 truths verified in source (visual truths flagged for human confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/domain/__tests__/phasePresentation.test.ts` | Unit tests for phaseLabel and phaseGuidanceKey | VERIFIED | 127 lines; 27 tests: 12 for phaseLabel, 15 for phaseGuidanceKey; all pass |
| `apps/web/src/presentation/shared/phasePresentation.ts` | phaseLabel map, phaseGuidanceKey function, phaseTone map | VERIFIED | 49 lines (well under 300); exports phaseLabel, phaseGuidanceKey, phaseTone; phaseGuide absent |
| `apps/web/src/presentation/locales/vi.json` | phase.label.* and phase.guidance.host.*/player.* keys | VERIFIED | All 5 label + 7 host + 7 player keys present; exact locked strings match plan spec |
| `apps/web/src/presentation/locales/en.json` | English translations (same structure) | VERIFIED | All 5 label + 7 host + 7 player keys present |
| `apps/web/src/presentation/locales/ko.json` | Korean translations (same structure) | VERIFIED | All 5 label + 7 host + 7 player keys present |
| `apps/web/src/presentation/locales/zh.json` | Chinese translations (same structure) | VERIFIED | All 5 label + 7 host + 7 player keys present |
| `apps/web/src/presentation/game/ActionBoard.tsx` | Phase badge + guidance wired into top bar and status box | VERIFIED | 178 lines; imports phaseLabel, phaseGuidanceKey, phaseTone; showPhaseInfo guard correct; both badge and guidance call t() |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| phasePresentation.ts phaseLabel | vi/en/ko/zh.json phase.label.* | i18n key strings returned match key paths in JSON | WIRED | phaseLabel values follow pattern `phase.label.{slot}`; all 5 slots (waiting/wordReveal/discussion/voting/ended) exist in all 4 locales |
| phasePresentation.ts phaseGuidanceKey | vi/en/ko/zh.json phase.guidance.host.*/player.* | i18n key strings returned match key paths in JSON | WIRED | phaseGuidanceKey returns `phase.guidance.{host\|player}.{slot}`; all 7 slots exist in all 4 locales for both roles |
| ActionBoard.tsx | phasePresentation.ts phaseLabel | `import { phaseGuidanceKey, phaseLabel, phaseTone } from '../shared/phasePresentation'` | WIRED | Line 5 import confirmed; `phaseLabel[gameState.phase]` used at line 79 inside `t()` |
| ActionBoard.tsx | i18n locale JSONs | `t(phaseLabel[gameState.phase])` and `t(phaseGuidanceKey(...))` | WIRED | Lines 79 and 104; both calls go through `t()` to resolve locale strings |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PHASE-01 | 02-01-PLAN, 02-02-PLAN | Player sees current phase name clearly as a badge/label | SATISFIED | Phase badge pill rendered at ActionBoard.tsx line 77-81 via `t(phaseLabel[...])` |
| PHASE-02 | 02-01-PLAN, 02-02-PLAN | Player sees next-action guidance matching phase and role | SATISFIED | Guidance rendered at ActionBoard.tsx line 102-106 via `t(phaseGuidanceKey(phase, viewerHost))` |

**Note:** REQUIREMENTS.md traceability table still shows PHASE-01 and PHASE-02 as "In Progress (02-01 done, 02-02 pending)" — this is a stale documentation state. The implementation is complete. The checkboxes at lines 10-11 of REQUIREMENTS.md are also still unchecked `[ ]`. These should be updated to `[x]` and the status changed to "Complete".

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No TODO/FIXME/placeholder comments found. No empty implementations. No hardcoded display strings in JSX. Both files are well within the 300-line limit (49 and 178 lines respectively).

### Human Verification Required

#### 1. Phase Badge Renders Correctly in All Phases

**Test:** Start a game, cycle through phases (WAITING → WORD_REVEAL → DISCUSSION → VOTING → GAME_ENDED). Observe the top bar.
**Expected:** Badge shows localized short phase name (e.g. "CHO", "THAO LUAN", "BAU CHON") with correct color tone for each active phase; badge is absent in ROLE_DISTRIBUTION and GAME_ENDED.
**Why human:** Visual rendering requires live i18n resolution — source code confirms `t()` wrapping but actual displayed text depends on runtime locale and i18n initialization.

#### 2. Role-Differentiated Guidance in WAITING and VOTING

**Test:** Open two browser sessions — one as host, one as non-host — in the same room. Observe guidance text in WAITING phase and then in VOTING phase.
**Expected:** Host sees "Nhan Start khi du nguoi choi" (WAITING) and "Chon nguoi bi nghi ngo" (VOTING). Non-host sees "Cho host bat dau" (WAITING) and "Dang cho host bau chon" (VOTING).
**Why human:** Requires two simultaneous authenticated sessions with different player roles.

#### 3. No Raw Phase Enum Strings Visible

**Test:** Navigate through all game phases and inspect the top bar area.
**Expected:** No strings like "ROUND_VOTING", "GAME_CREATION", "WAITING_FOR_PLAYERS" appear anywhere in the top bar. Only translated human-readable labels.
**Why human:** Source confirms enum is no longer rendered directly, but runtime verification rules out any fallback path.

### Gaps Summary

No gaps found. All automated checks passed:
- phasePresentation.ts exports correct functions with complete Phase coverage
- phaseGuide old export is fully removed
- All 4 locale files have the complete key structure with exact locked translations
- ActionBoard.tsx correctly imports and wires both phaseLabel and phaseGuidanceKey through t()
- showPhaseInfo guard correctly excludes GAME_ENDED and ROLE_DISTRIBUTION
- 27 unit tests pass; full test suite (67 tests) green
- Both modified files are under 300 lines

Only visual confirmation is pending.

---

_Verified: 2026-03-18T11:14:00Z_
_Verifier: Claude (gsd-verifier)_

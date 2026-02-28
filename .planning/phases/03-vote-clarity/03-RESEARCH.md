# Phase 3: Vote Clarity - Research

**Researched:** 2026-02-28
**Domain:** React UI components — voting phase UX, two-step interaction, submit state management
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Trạng thái khóa (non-host)**
- Grid người chơi bị ẩn hoàn toàn — không hiển thị danh sách khi non-host vào VOTING phase
- Thay thế bằng badge tĩnh, nổi bật, giải thích ngắn (ví dụ: "Host đang vote cho cả nhóm") kèm icon khóa
- Badge hiển thị phía trên, ngay dưới tiêu đề phase — người dùng đọc từ trên xuống thấy ngay
- Badge hoàn toàn tĩnh: không spinner, không animation — rõ ràng là "trạng thái chờ" chứ không phải loading

**UX chọn mục tiêu (host)**
- Host chọn mục tiêu bằng cách click vào card — một click để chọn, click lại để bỏ chọn
- Card được chọn: viền nổi bật (accent color) + nền nhạt khác biệt — phải rõ ràng, không thể bỏ sót
- Nút Submit disabled rõ ràng (mờ + cursor not-allowed) khi chưa chọn ai → chuyển active khi đã chọn
- Nút Submit hiển thị tên mục tiêu đã chọn (ví dụ: "Vote loại An") để confirm trước khi gửi

**Phản hồi sau khi submit**
- Sau khi host bấm Submit: spinner xuất hiện trên nút + nút bị disable ngay lập tức
- Grid người chơi giữ nguyên trong lúc chờ — chỉ nút thay đổi, không làm xáo trộn layout
- Sau khi server xác nhận: game tự động chuyển phase qua server push event — không cần xử lý thêm phía client
- Nếu server trả lỗi: toast thông báo lỗi + re-enable nút + giữ nguyên lựa chọn để host có thể submit lại

**Layout grid người chơi trong VOTING**
- Layout grid card (2 cột hoặc nhiều hơn) — nhất quán với các phase khác
- Người đã bị loại (eliminated): hiển thị trong grid nhưng bị mờ và không thể chọn
- Host hiển thị như player bình thường và có thể tự vote cho mình (host chỉ thực hiện quyết định của cả nhóm, không có quyền ưu tiên)
- Mỗi card chỉ hiển thị tên — không có avatar trong VOTING phase

### Claude's Discretion
- Màu sắc cụ thể của viền/nền khi card được chọn (dùng design token từ AppColor.ts)
- Nội dung text chính xác của badge non-host (ngôn ngữ i18n)
- Khoảng cách và typography chi tiết
- Thời gian hiển thị toast lỗi

### Deferred Ideas (OUT OF SCOPE)
Không có — thảo luận giữ đúng trong phạm vi Phase 3.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VOTE-01 | Non-host không thấy vote UI trong VOTING phase — chỉ thấy trạng thái "Đang chờ host vote..." | Replace current `<p className="arcade-muted">` text with styled static badge; VotingPanel already guards non-host path at line 34-37 |
| VOTE-02 | Host thấy danh sách players có thể vote và nút Submit (two-step: chọn → submit) | Rebuild host path in VotingPanel: card grid with selected state + dynamic Submit label + isSubmitting guard post-click |
</phase_requirements>

---

## Summary

Phase 3 is a pure presentation-layer change to `VotingPanel.tsx`. No server changes, no new domain logic, no new routes. The component already has correct host/non-host branching — the work is to upgrade the visual quality and interaction fidelity of both branches.

For the **non-host path**: the existing `<p className="arcade-muted">` text is functionally correct but visually inadequate — it looks like an error or placeholder. The fix is a styled static badge with a lock icon character, placed prominently with a meaningful explanation ("Host đang vote cho cả nhóm"). The badge must be clearly static (no spinner, no pulse) so it reads as an intentional state, not a loading screen.

For the **host path**: the current implementation already has two-step interaction (select → submit) but the card grid uses generic `Button` elements from `pixel-retroui` which do not communicate selection state strongly enough. The redesign uses CSS-driven card selection (border + background highlight via design tokens), a dynamic Submit button label showing the target name, and an `isSubmitting` local state that disables the button and shows a spinner after click. Error recovery (re-enable on server error) uses the existing `error` prop already threaded from `App.tsx → GameScreen → ActionBoard → VotingPanel`.

**Primary recommendation:** Rewrite `VotingPanel.tsx` with both branches upgraded; add `arcade-vote-card` and `arcade-vote-card--selected` CSS classes in `uxEnhancements.css`; add two new i18n keys (`game.hostVotingForGroup`, `game.voteFor`) to all 4 locale files.

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.0.0 | Component state (`useState` for `selectedTarget`, `isSubmitting`) | Project standard |
| react-i18next | ^16.5.4 | All UI text via `t()` | Project standard — all text must be translatable |
| pixel-retroui | ^2.1.0 | `Button` component for Submit button | Already used in VotingPanel |
| Tailwind / CSS custom | ^3.4.17 | Card selection styles via CSS classes | Existing `uxEnhancements.css` pattern |

### No New Dependencies

All Phase 3 work uses existing libraries. No `npm install` / `yarn add` required.

Lock icon: use a Unicode character (`🔒` is not allowed per project rules) → use CSS `::before` content with a plain ASCII lock `[LOCKED]` text or an SVG inline. Recommendation: use a simple SVG lock icon rendered inline, or the text prefix `■` as a visual marker — keep it simple and consistent with the arcade aesthetic.

**Revision:** Given the project explicitly prohibits emojis, use a plain text marker or a minimal inline SVG. Recommended: badge text only with a distinct border style (no icon dependency). The badge border/background contrast is sufficient for the arcade aesthetic.

---

## Architecture Patterns

### Recommended File Changes

```
apps/web/src/
├── presentation/
│   ├── voting/
│   │   └── VotingPanel.tsx          # PRIMARY: rewrite both branches
│   ├── styles/
│   │   └── uxEnhancements.css       # ADD: arcade-vote-card, arcade-vote-card--selected, arcade-non-host-badge, arcade-vote-submitting
│   └── locales/
│       ├── en.json                  # ADD: game.hostVotingForGroup, game.voteFor
│       ├── vi.json                  # ADD: same keys
│       ├── ko.json                  # ADD: same keys
│       └── zh.json                  # ADD: same keys
```

No changes to: `ActionBoard.tsx`, `GameScreen.tsx`, `App.tsx`, `gameSelectors.ts`, `SubmitVote.ts`, `socketGateway.ts`.

### Pattern 1: Static Badge for Non-Host State

**What:** Replace `<p className="arcade-muted">` with a styled badge div that signals "this is intentional state, not a loading state."
**When to use:** Non-host player enters VOTING phase.

**Current code (line 34-37 in VotingPanel.tsx):**
```typescript
if (!viewerIsHost) {
  if (!viewer?.isAlive) return null;
  return <p className="arcade-muted">{t('game.waitingForHostVote').toUpperCase()}</p>;
}
```

**New pattern:**
```typescript
if (!viewerIsHost) {
  if (!viewer?.isAlive) return null;
  return (
    <div className="arcade-non-host-badge">
      <span className="arcade-non-host-badge__icon">[LOCKED]</span>
      <p className="arcade-non-host-badge__text">
        {t('game.hostVotingForGroup').toUpperCase()}
      </p>
    </div>
  );
}
```

Key: badge must NOT contain a spinner. Static layout only.

### Pattern 2: Card-Based Selection Grid (Host Path)

**What:** Replace `Button` elements from `pixel-retroui` with div-based clickable cards that carry CSS selection state.
**When to use:** Host in VOTING phase, selecting vote target.

**New pattern:**
```typescript
// Local state
const [selectedTarget, setSelectedTarget] = useState<string | null | undefined>(undefined);
const [isSubmitting, setIsSubmitting] = useState(false);

// Card rendering
{alivePlayers.map((player) => {
  const isSelected = selectedTarget === player.id;
  const isEliminated = !player.isAlive;
  return (
    <button
      key={player.id}
      type="button"
      className={[
        'arcade-vote-card',
        isSelected ? 'arcade-vote-card--selected' : '',
        isEliminated ? 'arcade-vote-card--eliminated' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => !isEliminated && !isSubmitting && setSelectedTarget(
        selectedTarget === player.id ? undefined : player.id
      )}
      disabled={isEliminated || isSubmitting}
      aria-pressed={isSelected}
    >
      {player.name.toUpperCase()}
    </button>
  );
})}
```

Note: Eliminated players display in the grid (muted/dimmed) but are `disabled` — click has no effect. This matches the CONTEXT.md decision.

### Pattern 3: isSubmitting Guard on Submit Button

**What:** Local `isSubmitting` state tracks "waiting for server confirmation" window.
**When to use:** Immediately on host submit click; reset only on error (server confirms via phase transition, not explicit ack).

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = () => {
  if (selectedTarget === undefined || isSubmitting) return;
  setIsSubmitting(true);
  onSubmitVote(selectedTarget);
  // isSubmitting stays true until: phase changes (unmounts this view) OR error resets it
};

// Reset on error (error prop changes from '' to a message)
useEffect(() => {
  if (error) {
    setIsSubmitting(false);
    // selectedTarget preserved — host can retry
  }
}, [error]);
```

**Submit button:**
```typescript
<Button
  type="button"
  className="arcade-btn arcade-btn-primary"
  onClick={handleSubmit}
  disabled={selectedTarget === undefined || isSubmitting}
  bg={selectedTarget !== undefined && !isSubmitting ? 'var(--green-400)' : 'var(--neutral-400)'}
  textColor="var(--neutral-black)"
  borderColor="var(--neutral-black)"
  shadow={selectedTarget !== undefined && !isSubmitting ? 'var(--green-700)' : 'var(--neutral-700)'}
>
  {isSubmitting
    ? '...'
    : selectedTarget !== undefined
      ? `${t('game.voteFor').toUpperCase()} ${targetName}`
      : t('game.submitVote').toUpperCase()}
</Button>
```

Note: `isSubmitting` shows `'...'` spinner text (pure CSS spinner is an alternative — see Pitfalls section). Phase transition from server will unmount VotingPanel entirely, so isSubmitting never needs an explicit reset on success.

### Anti-Patterns to Avoid

- **Showing spinner in non-host badge:** Confuses "waiting for something to load" vs. "this is how the game works." The badge must be static.
- **Re-enabling submit button immediately after onSubmitVote call:** Submit must stay disabled until phase changes or error arrives. Never re-enable in the same handler.
- **Hiding eliminated players from the grid:** CONTEXT.md explicitly says eliminated players display in the grid, dimmed and unclickable. Do not filter them out of the map.
- **Removing selectedTarget on error:** CONTEXT.md says keep selection intact on error so host can retry. Reset `isSubmitting` to false, but leave `selectedTarget` unchanged.
- **Adding vote logic to ActionBoard or GameScreen:** All vote-specific state (`selectedTarget`, `isSubmitting`) stays inside `VotingPanel.tsx`. Do not push state up.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spinner/loading indicator | Custom animated SVG | `'...'` text or CSS `@keyframes` in existing uxEnhancements.css | Project already has `arcade-action-enter` animation pattern — reuse |
| Toast notifications | Custom toast system | Existing `error` state prop already displayed by `ActionBoard`'s `arcade-error` block | Error display is already wired from `App → ActionBoard`; no new toast infra needed |
| Card selection state | Redux/Zustand for selectedTarget | `useState` in VotingPanel | Scope is entirely local to this component; no global state needed |
| i18n string management | Hardcoded conditional strings | `t()` keys for all UI text | Project rule: all strings in locale files |

**Key insight:** The existing error pipeline (`gateway.onError → setError in App → error prop → ActionBoard → arcade-error div`) already handles the "server error → show message" path. VotingPanel just needs to observe the `error` prop change to reset `isSubmitting`.

---

## Common Pitfalls

### Pitfall 1: error prop not yet threaded into VotingPanel

**What goes wrong:** `VotingPanel` currently receives no `error` prop. To reset `isSubmitting` on server error, VotingPanel needs to observe the error string.
**Why it happens:** The component was written before the "isSubmitting" requirement existed. ActionBoard has `error` but doesn't pass it to VotingPanel.
**How to avoid:** Add `error: string` to `VotingPanel`'s Props interface. Pass `error={error}` from ActionBoard where VotingPanel is rendered (line 164-172 in ActionBoard.tsx). Then use `useEffect` on `error` to reset `isSubmitting`.
**Warning signs:** If you see `isSubmitting` stuck on true after a server vote error, this prop is missing.

### Pitfall 2: VotingPanel line count approaching 300

**What goes wrong:** The current VotingPanel is 103 lines. After adding the non-host badge, card grid, isSubmitting logic, and effects, it may approach 150-180 lines — still within the 300-line limit. Watch this closely.
**Why it happens:** All interaction logic lives in one component.
**How to avoid:** If line count exceeds 200, extract `HostVotingPanel` and `NonHostVotingBadge` as separate files. Keep VotingPanel as a router/orchestrator. For now, one file should be safe.
**Warning signs:** File exceeds 200 lines after implementation — pre-split before it hits 300.

### Pitfall 3: selectedTarget type mismatch (undefined vs null)

**What goes wrong:** Current code uses `undefined` to mean "no selection" and `null` to mean "skip vote" (in CLASSIC mode). Adding new logic without understanding this distinction causes bugs.
**Why it happens:** The existing `onSubmitVote: (targetPlayerId: string | null) => void` accepts `null` as a valid skip vote. The `selectedTarget` state uses `undefined` as the unset sentinel.
**How to avoid:** CONTEXT.md decisions removed the skip vote option from the new design — the grid only shows players, not a skip button. Therefore `selectedTarget` type is `string | undefined` in the new implementation. Remove the `null` skip option entirely from the host path. Confirm with CONTEXT.md: "Không có cơ chế hòa phiếu vì host là người vote duy nhất" confirms skip is gone.
**Warning signs:** TypeScript error on `onSubmitVote(selectedTarget)` if `selectedTarget` is `string | undefined` but the function expects `string | null`. Cast appropriately or check type.

### Pitfall 4: CSS class naming collision with existing arcade-vote-grid

**What goes wrong:** `uxEnhancements.css` already defines `.arcade-vote-grid` for the Button-based layout. If new card classes reuse names, specificity conflicts occur.
**Why it happens:** Two definitions of `.arcade-vote-grid` already exist (layout.css line 44 and uxEnhancements.css line 93) — they conflict. New card styles should use a new name.
**How to avoid:** Use `.arcade-vote-card` and `.arcade-vote-card--selected` (BEM-style) for the new card-based grid. Do not reuse `.arcade-vote-grid` for the card container. Add a `.arcade-vote-card-grid` container class if needed.
**Warning signs:** Card selection styles not applying, or layout broken in voting phase.

### Pitfall 5: isSubmitting state not reset after phase transition

**What goes wrong:** On success, phase changes server-side and triggers a `state:update` event. React will unmount `VotingPanel` and mount the new phase UI. The `isSubmitting` state is naturally destroyed. No explicit reset is needed for the success path.
**Why it happens:** Developers sometimes add cleanup logic that isn't needed, causing unexpected re-renders.
**How to avoid:** Trust React's unmount behavior. Only reset `isSubmitting` on the `error` path. Do not add a timer-based reset.

---

## Code Examples

### Non-Host Badge CSS (add to uxEnhancements.css)

```css
/* Non-host voting badge — static, no animation */
.arcade-non-host-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 3px solid var(--blue-500);
  background: color-mix(in srgb, var(--surface-primary) 88%, var(--blue-900));
  text-align: center;
}

.arcade-non-host-badge__icon {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--yellow-300);
  border: 2px solid var(--yellow-400);
  padding: 2px 8px;
}

.arcade-non-host-badge__text {
  margin: 0;
  color: var(--blue-100);
  letter-spacing: 0.06em;
  font-size: 0.9rem;
}
```

### Vote Card CSS (add to uxEnhancements.css)

```css
/* Vote target card — host only */
.arcade-vote-card {
  display: block;
  width: 100%;
  padding: 12px 8px;
  border: 3px solid var(--blue-600);
  background: color-mix(in srgb, var(--surface-primary) 86%, var(--blue-900));
  color: var(--neutral-white);
  font: inherit;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: center;
  cursor: pointer;
  transition: none; /* arcade aesthetic: no smooth transitions */
}

.arcade-vote-card:hover:not(:disabled) {
  border-color: var(--yellow-400);
  background: color-mix(in srgb, var(--surface-primary) 80%, var(--yellow-900));
}

.arcade-vote-card--selected {
  border-color: var(--yellow-400);
  background: color-mix(in srgb, var(--surface-primary) 72%, var(--yellow-900));
  color: var(--yellow-300);
  box-shadow: 0 0 0 2px var(--yellow-400);
}

.arcade-vote-card--eliminated {
  opacity: 0.35;
  cursor: not-allowed;
}

.arcade-vote-card:disabled {
  cursor: not-allowed;
}

/* Card grid layout for voting */
.arcade-vote-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
```

### i18n Keys to Add (all 4 locale files)

**en.json additions inside `"game"` object:**
```json
"hostVotingForGroup": "Host is voting on behalf of the group",
"voteFor": "Vote out"
```

**vi.json additions:**
```json
"hostVotingForGroup": "Host đang vote cho cả nhóm",
"voteFor": "Vote loại"
```

**ko.json additions:**
```json
"hostVotingForGroup": "호스트가 그룹을 대신해 투표 중입니다",
"voteFor": "투표"
```

**zh.json additions:**
```json
"hostVotingForGroup": "主持人正在代表小组投票",
"voteFor": "投票淘汰"
```

### VotingPanel Props Interface

```typescript
interface Props {
  gameState: GameState;
  playerId: string;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForId: string | null | undefined;
  error: string;                        // NEW: needed to reset isSubmitting on server error
  onSubmitVote: (targetPlayerId: string) => void;  // NOTE: null/skip removed per CONTEXT.md
}
```

Note: The `onSubmitVote` signature change (removing `| null`) must also be updated in `ActionBoard.tsx` and `App.tsx` — or keep `string | null` signature and only pass string from the new implementation. Simpler: keep the existing `(targetPlayerId: string | null) => void` signature, just never call it with `null` in the new host UI.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Button elements from pixel-retroui for vote targets | Native `<button>` with CSS BEM classes | Phase 3 | Better selection state control, no library prop drilling for selection state |
| Plain text "Waiting for host vote..." | Styled static badge | Phase 3 | Non-host understands game rules, not confused by loading state |
| No submit feedback | isSubmitting state + disabled button | Phase 3 | Host gets confirmation flow; server error recovery preserved |
| Skip vote button (CLASSIC mode) | Removed from host UI | Phase 3 per CONTEXT.md | Simpler host UX; skip is not part of current CONTEXT.md decisions |

**Note on skip button removal:** Current `VotingPanel.tsx` shows a "Skip" button for CLASSIC mode. CONTEXT.md decisions make no mention of skip — the grid "only shows players, not a skip button." The CLAUDE.md rule states "Không có cơ chế hòa phiếu vì host là người vote duy nhất." Remove skip from the new implementation.

---

## Open Questions

1. **Skip vote button removal confirmation**
   - What we know: CONTEXT.md does not mention skip; CLAUDE.md rules say no tie-breaking needed
   - What's unclear: Is skip intentionally removed, or just unmentioned?
   - Recommendation: Remove skip from Phase 3 implementation. If user later asks for it back, it is a Phase 3 scope extension. The CLAUDE.md rule is explicit: "Không có cơ chế hòa phiếu vì host là người vote duy nhất."

2. **Lock icon approach**
   - What we know: Project prohibits emojis; badge needs a visual lock metaphor
   - What's unclear: SVG inline vs. text-only marker vs. CSS character
   - Recommendation: Use styled text `[LOCKED]` with uppercase arcade styling as the icon. Keep it consistent with the arcade font aesthetic. No external icon library needed.

3. **Toast duration for error**
   - What we know: CONTEXT.md marks toast duration as Claude's Discretion
   - What's unclear: Specific duration
   - Recommendation: Use the existing `error` prop display mechanism in `ActionBoard.tsx` (the `arcade-error` div). This is already visible and auto-cleared when the next action succeeds. No separate toast component needed — the existing error display is sufficient and consistent.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — all findings derived from reading actual source files
  - `apps/web/src/presentation/voting/VotingPanel.tsx` — current implementation baseline
  - `apps/web/src/presentation/game/ActionBoard.tsx` — how VotingPanel is rendered and what props are available
  - `apps/web/src/presentation/styles/uxEnhancements.css` — existing CSS patterns and class names
  - `apps/web/src/presentation/styles/components.css` — existing component styles
  - `apps/web/src/presentation/design-system/AppColor.ts` — design token values
  - `apps/web/src/presentation/locales/en.json`, `vi.json` — existing i18n keys
  - `apps/web/src/domain/utils/gameSelectors.ts` — `isHost`, `alivePlayers` selectors
  - `.planning/phases/03-vote-clarity/03-CONTEXT.md` — locked user decisions

### Secondary (MEDIUM confidence)
- React `useState` + `useEffect` patterns for local component state — standard React patterns, consistent with existing hooks in project (verified in `ActionBoard.tsx` lines 46-58, `useGatewayEvents.ts`)
- CSS BEM-style class naming — consistent with existing `.arcade-player-eliminated`, `.arcade-action-enter` patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new dependencies
- Architecture: HIGH — derived directly from reading existing source files
- Pitfalls: HIGH — `error` prop threading gap identified from direct code inspection (VotingPanel props at line 7-14 has no `error`); CSS collision identified from reading both CSS files

**Research date:** 2026-02-28
**Valid until:** 2026-03-28 (stable — no external APIs, all internal codebase patterns)

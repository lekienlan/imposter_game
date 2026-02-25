# Agent Team Prompt — Imposter Arcade

Monorepo tại `/Users/lanle98/Desktop/imposter_game`.
Kiến trúc: `domain → application → infrastructure → presentation`.
Package manager: **yarn**. File source ≤ 300 dòng. Logic và UI tách file riêng.
Shared types từ `@imposter/shared`. Màu từ `apps/web/src/design-system/AppColor.ts`.

---

## Agent 1 — UX Upgrade

### Nhiệm vụ

Cải thiện toàn bộ UX của game: luồng người dùng rõ hơn, feedback tốt hơn, trạng thái game dễ hiểu hơn.

### Scope

- `apps/web/src/presentation/` — tất cả component React
- `apps/web/src/presentation/styles/` — CSS
- `apps/web/src/presentation/phasePresentation.ts` — phase guide text

### Việc cần làm

**1. Lobby (`LobbyScreen.tsx`)**

- Thêm progress indicator khi đang tạo/join phòng (loading state).
- Hiển thị số ký tự hiện tại / max cho WORD PAIRS textarea.
- Thêm tooltip/help text inline giải thích Classic vs Hardcore ngay bên dưới mỗi option.
- Validate tên người chơi trước khi submit (trim whitespace, min 2 ký tự, max 20 ký tự).

**2. Game Screen (`GameScreen.tsx`)**

- Panel YOU: nếu `viewer.word` là `null` và game chưa bắt đầu, hiển thị hint "Game hasn't started yet" thay vì "LOCKED".
- Panel PLAYERS: highlight người đang là speaker trong `ROUND_DESCRIPTION` phase.
- Panel PLAYERS: với player đã bị loại (`isAlive = false`), áp dụng style mờ (opacity thấp) thay vì chỉ đổi label.
- ACTION BOARD: thêm animation/transition khi phase thay đổi (CSS class toggle).
- SHARE ROOM button: hiển thị ở tất cả phase (không chỉ `WAITING_FOR_PLAYERS`), nhưng vẫn chỉ dành cho host.
- Sau khi vote, disable các vote button ngay lập tức (dùng `viewerVotedForName` để detect).

**3. Word Reveal Popup (`WordRevealPopup.tsx`)**

- Thêm countdown 3 giây trước khi nút READY xuất hiện (tránh bấm nhầm).
- Animation fade-in cho popup khi mở.

**4. Phase Guide (`phasePresentation.ts`)**

- Bổ sung `tip` field cho mỗi phase: ngắn gọn, actionable, dành cho người chơi thường (không phải host).
- Ví dụ: `ROUND_VOTING.tip = "Vote someone you think is the imposter. Skip if unsure."`

**5. Responsive/mobile (`styles/responsive.css`)**

- Đảm bảo vote grid (`.arcade-vote-grid`) wrap tốt trên màn hình nhỏ.
- Touch target tối thiểu 44px cho tất cả button.

### Không được làm

- Không thêm dependency mới nếu chưa hỏi.
- Không sửa domain/application/infrastructure layer.
- Không thay đổi màu trong CSS trực tiếp — dùng CSS variable từ design token.

### Checklist hoàn thành

- [ ] Không file nào vượt 300 dòng
- [ ] Logic (nếu có) tách vào `domain/` hoặc `application/`
- [ ] Không hardcode màu hex mới
- [ ] UI render đúng trên mobile (375px width)

---

## Agent 2 — Đa ngôn ngữ (Vietnamese + Korean)

### Nhiệm vụ

Thêm hệ thống i18n hỗ trợ **Tiếng Việt (vi)** và **Tiếng Hàn (ko)**, mặc định là English (en). Người chơi có thể chọn ngôn ngữ từ UI.

### Stack

Dùng **`i18next`** + **`react-i18next`**. Tích hợp vào `apps/web`.

### Cấu trúc file cần tạo

```
apps/web/src/
├── application/
│   └── useLocale.ts              # hook: đọc/ghi locale, persist localStorage
├── infrastructure/
│   └── i18nSetup.ts              # khởi tạo i18next instance
├── presentation/
│   ├── LanguageSwitcher.tsx      # dropdown chọn ngôn ngữ (EN | VI | KO)
│   └── locales/
│       ├── en.json               # English strings
│       ├── vi.json               # Vietnamese strings
│       └── ko.json               # Korean strings
```

### Chuỗi cần dịch (keys chuẩn — lấy từ UI hiện tại)

```json
{
  "lobby.title": "IMPOSTER ARCADE",
  "lobby.subtitle": "ONE ROOM. ONE SECRET WORD. FIND THE IMPOSTER.",
  "lobby.hostTerminal": "HOST TERMINAL",
  "lobby.createRoom": "CREATE ROOM",
  "lobby.playerTerminal": "PLAYER TERMINAL",
  "lobby.enterRoom": "ENTER ROOM",
  "lobby.name": "NAME",
  "lobby.namePlaceholder": "PLAYER NAME",
  "lobby.wordPairs": "WORD PAIRS",
  "lobby.wordPairsHelp": "FORMAT: APPLE | PEAR",
  "lobby.mode": "MODE",
  "lobby.modeClassic": "CLASSIC",
  "lobby.modeClassicDesc": "STANDARD FLOW, EASY ENTRY.",
  "lobby.modeHardcore": "HARDCORE",
  "lobby.modeHardcoreDesc": "NO WHITE ROLE, HIGHER PRESSURE.",
  "lobby.whiteRoleOn": "WHITE ROLE: ON",
  "lobby.whiteRoleOff": "WHITE ROLE: OFF",
  "lobby.rulePanel": "RULE PANEL",
  "lobby.howToPlay": "HOW TO PLAY",
  "lobby.rule1": "ALL PLAYERS JOIN THE SAME ROOM CODE.",
  "lobby.rule2": "EACH PLAYER READS A SECRET ROLE.",
  "lobby.rule3": "SPEAK ONE STATEMENT EACH ROUND.",
  "lobby.rule4": "DISCUSS AND ELIMINATE A SUSPECT.",
  "game.roomCode": "ROOM CODE",
  "game.copyCode": "COPY CODE",
  "game.codeCopied": "CODE COPIED",
  "game.shareRoom": "SHARE ROOM",
  "game.linkCopied": "LINK COPIED",
  "game.phase": "PHASE",
  "game.winner": "WINNER",
  "game.you": "YOU",
  "game.role": "ROLE",
  "game.name": "NAME",
  "game.word": "WORD",
  "game.roleLocked": "HIDDEN",
  "game.wordLocked": "LOCKED",
  "game.viewerUnavailable": "VIEWER STATE UNAVAILABLE.",
  "game.players": "PLAYERS",
  "game.alive": "ALIVE",
  "game.out": "OUT",
  "game.statement": "STATEMENT",
  "game.actionBoard": "ACTION BOARD",
  "game.nextMove": "NEXT MOVE",
  "game.speaker": "SPEAKER",
  "game.voteRound": "VOTE ROUND",
  "game.startGame": "START GAME",
  "game.resetGame": "RESET GAME",
  "game.yourStatement": "YOUR STATEMENT",
  "game.statementPlaceholder": "ONE LINE. NO EXACT KEYWORD.",
  "game.sendStatement": "SEND STATEMENT",
  "game.startVoting": "START VOTING",
  "game.castVote": "CAST YOUR VOTE NOW.",
  "game.currentVote": "CURRENT VOTE",
  "game.skip": "SKIP",
  "game.hardcoreVoteNotice": "IN HARDCORE, ONLY CITIZENS CAST REAL VOTES.",
  "game.finalReason": "FINAL REASON",
  "wordPopup.ready": "READY",
  "roomPreview.host": "HOST",
  "roomPreview.phase": "PHASE",
  "roomPreview.players": "PLAYERS"
}
```

### Rules khi implement

- `i18nSetup.ts` khởi tạo i18next với `lng` mặc định từ `localStorage` hoặc `'en'`.
- `useLocale.ts` export `{ locale, setLocale }` — wrap `i18next.changeLanguage`.
- `LanguageSwitcher.tsx` là component nhỏ, đặt ở góc trên phải của màn hình (absolute/fixed, không phá layout).
- Tất cả string trong `LobbyScreen.tsx` và `GameScreen.tsx` phải dùng `useTranslation` hook (`t('key')`).
- `phasePresentation.ts` — các string title/description trong phaseGuide cũng phải i18n-ized; nếu cần, chuyển `phaseGuide` thành function nhận `t` làm param.
- Không dùng `any` type.

### Checklist hoàn thành

- [ ] `en.json`, `vi.json`, `ko.json` đầy đủ tất cả key
- [ ] `LanguageSwitcher` hiển thị đúng 3 option: EN / VI / KO
- [ ] Chuyển ngôn ngữ không reload trang
- [ ] Locale persist sau khi refresh (localStorage)
- [ ] Không file nào vượt 300 dòng

---

## Agent 3 — QR Code Share

### Nhiệm vụ

Thêm tính năng **share phòng bằng QR code** bên cạnh option copy link hiện tại. Host có thể mở modal hiển thị QR code để người chơi quét trực tiếp.

### Dependency

Dùng **`qrcode.react`** (đã phổ biến, nhẹ, zero-config):

```bash
yarn workspace @imposter/web add qrcode.react
```

### Cấu trúc file cần tạo/sửa

```
apps/web/src/
├── application/
│   └── useShareModal.ts          # state quản lý modal QR (isOpen, toggle)
├── presentation/
│   ├── ShareModal.tsx            # modal hiển thị QR + copy link button
│   └── ShareButton.tsx           # button group: [COPY LINK] [SHOW QR]
```

### Spec chi tiết

**`useShareModal.ts`**

```typescript
// export: { isQrOpen, openQr, closeQr }
// lưu state isQrOpen dùng useState
```

**`ShareModal.tsx`**

- Nhận props: `{ shareUrl: string; roomId: string; onClose: () => void }`
- Dùng `<QRCodeCanvas>` từ `qrcode.react`, kích thước 200×200.
- Hiển thị `shareUrl` dạng text bên dưới QR (truncated nếu quá dài).
- Nút CLOSE để đóng modal.
- Overlay backdrop khi click ra ngoài cũng đóng modal.
- Style retro/arcade, dùng `Card` từ `pixel-retroui` làm container.
- Không quá 100 dòng.

**`ShareButton.tsx`**

- Nhận props: `{ shareUrl: string; roomId: string; shareCopied: boolean; onCopyLink: () => void }`
- Render hai button cạnh nhau:
  - `[COPY LINK]` — gọi `onCopyLink`, hiển thị "LINK COPIED" khi `shareCopied = true`
  - `[SHOW QR]` — toggle `ShareModal`
- Dùng `useShareModal` hook nội bộ.
- Style: COPY LINK dùng màu `var(--pink-500)`, SHOW QR dùng màu `var(--yellow-400)`.

**Tích hợp vào `GameScreen.tsx`**

- Thay thế button SHARE ROOM hiện tại (lines 83–95) bằng `<ShareButton>`.
- `shareUrl` phải được tính ở `App.tsx` (layer application), truyền xuống qua props.
- Không tính URL trong presentation layer.

**Tính `shareUrl` trong `App.tsx`**

- Dùng `buildShareUrl` từ `domain/ShareLink.ts` (đã có sẵn).
- Truyền `shareUrl` vào `GameScreen` qua props mới.

### Không được làm

- Không tự gọi `navigator.clipboard` trong `ShareButton` — nhận `onCopyLink` callback từ props.
- Không thêm state QR vào `App.tsx` — dùng local state trong `ShareButton` qua `useShareModal`.
- Không hardcode màu.

### Checklist hoàn thành

- [ ] `qrcode.react` được cài đúng workspace
- [ ] QR code hiển thị đúng URL share
- [ ] Click ra ngoài modal → đóng
- [ ] COPY LINK vẫn hoạt động song song QR
- [ ] Không file nào vượt 300 dòng
- [ ] `shareUrl` tính ở `App.tsx`, không phải presentation

---

## Phối hợp giữa agents

| Dependency                                         | Ghi chú                                                  |
| -------------------------------------------------- | -------------------------------------------------------- |
| Agent 2 phải hoàn thành trước khi Agent 1 sửa text | Agent 1 dùng `t('key')` thay vì hardcode string          |
| Agent 3 độc lập hoàn toàn                          | Không conflict với Agent 1 hoặc 2                        |
| Nếu Agent 1 và Agent 2 chạy song song              | Agent 1 tạm dùng English string, Agent 2 sẽ wrap lại sau |

## Checklist chung (áp dụng cho tất cả agents)

- [ ] Không file source code nào vượt 300 dòng
- [ ] Logic và UI tách file riêng
- [ ] Không vi phạm hướng phụ thuộc giữa layer
- [ ] Tái sử dụng type từ `@imposter/shared` khi có thể
- [ ] Không dùng `npm`, chỉ dùng `yarn`
- [ ] Màu lấy từ design token (`var(--...)`)

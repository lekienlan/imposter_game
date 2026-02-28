# Phase 2: Phase Clarity - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Thêm phase label rõ ràng và action guidance theo vai trò vào màn game. Người chơi nhìn vào là biết ngay đang ở phase nào và phải làm gì — không cần đọc kỹ. Không thêm feature mới, chỉ cải thiện thông tin hiện thị.

</domain>

<decisions>
## Implementation Decisions

### Vị trí & Style label
- Phase label nằm trong **top bar** của game screen — luôn visible, không chắn content
- Style: **pill badge nhỏ**, chia sẻ space với các element hiện có trong top bar
- Mỗi phase có màu riêng theo mood:
  - WAITING: xanh lá/neutral
  - WORD_REVEAL: vàng/amber
  - DISCUSSION: xanh dương
  - VOTING: đỏ/cam
  - ENDED: không show (modal đã cover)
- Icon kèm badge: Claude tự quyết (tùy retro style hiện tại)

### Nội dung text
- Hiển thị **tên ngắn tiếng Việt**: Chờ • Tiết lộ từ • Thảo luận • Bầu chọn • Kết thúc
- Host và non-host **thấy cùng tên phase**, chỉ khác phần action guidance bên dưới

### Action guidance
- Nằm **dưới phase badge** trong top bar — liền mạch, dễ đọc
- Show ở **tất cả 5 phases** — player không bao giờ thấy trống
- Format **1 dòng ngắn**:
  - WAITING → Host: "Nhấn Start khi đủ người chơi" | Non-host: "Chờ host bắt đầu"
  - WORD_REVEAL → Badge không show (popup che màn hình)
  - DISCUSSION → Host & Non-host: "Thảo luận với bạn chơi" (hoặc tương tự)
  - VOTING → Host: "Chọn người bị nghi ngờ" | Non-host: "Đang chờ host bầu chọn"
  - ENDED → Không show (modal đã cover)
- **Không animate** khi phase đổi — đổi thẳng

### Phase WAITING & ENDED
- **WAITING**: Label "Chờ" + guidance khác nhau: Host "Nhấn Start khi đủ người" / Non-host "Chờ host bắt đầu"
- **ENDED**: Không show label hoặc guidance — game over modal handle toàn bộ
- **WORD_REVEAL**: Không show badge — popup đang che toàn màn hình
- **Phase transition flash**: Claude tự quyết (tùy retro style)

### Claude's Discretion
- Icon kèm badge (emoji hay không)
- Exact wording của guidance text (trong khuôn tiếng Việt 1 dòng ngắn)
- Flash / transition animation khi phase đổi
- Typography size và spacing trong top bar

</decisions>

<specifics>
## Specific Ideas

- Pill badge nhỏ — không chiếm top bar, share space với room info
- Màu badge phải visual/intuitive (đỏ = nguy hiểm/VOTING, xanh = an toàn/WAITING)
- Tất cả text phải qua i18n `t()` — không hardcode tiếng Việt trong JSX

</specifics>

<deferred>
## Deferred Ideas

- Animation chuyển phase (fade/slide) — đã ghi nhận cho v2 (PHASE-03)

</deferred>

---

*Phase: 02-phase-clarity*
*Context gathered: 2026-02-28*

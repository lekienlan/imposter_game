# Imposter Game — UX Milestone

## What This Is

Game đoán vai xã hội (social deduction) chạy real-time qua Socket.IO. Người chơi vào phòng, nhận vai (Imposter / Villager), thảo luận bí mật, rồi host vote loại người bị nghi ngờ. Mục tiêu milestone này: cải thiện rõ ràng visual trong màn game để người chơi tự hiểu trạng thái mà không cần giải thích.

## Core Value

Người chơi nhìn vào màn hình là biết ngay mình đang ở phase nào, phải làm gì, và kết quả là gì — không cần hỏi.

## Requirements

### Validated

- ✓ Tạo phòng và chia sẻ link tham gia — existing
- ✓ Nhận vai (Imposter / Villager) và từ bí mật — existing
- ✓ Hệ thống vote: chỉ host vote, two-step UI (chọn → submit) — existing
- ✓ Word reveal popup (chỉ hiển thị từ, không hiện role) — existing
- ✓ Game over modal với reveal role — existing
- ✓ Reconnect khi mất kết nối — existing
- ✓ Reset game về GAME_CREATION — existing
- ✓ i18n (Tiếng Việt) — existing

### Active

- [ ] Phase indicator rõ ràng — người chơi biết ngay đang ở phase nào mà không phải đọc kỹ
- [ ] Vote rules tự giải thích — non-host hiểu rõ mình không được vote, host hiểu rõ mình đang vote ai
- [ ] Word reveal hiện đúng lúc, dễ tìm lại — từ bí mật không bị mất sau khi popup đóng
- [ ] End game rõ ràng — ai thắng, tại sao, ai là imposter — trình bày trực quan không cần đọc nhiều

### Out of Scope

- Redesign toàn bộ layout — không cần, cải thiện visual hiện tại đủ rồi
- Thêm tính năng gameplay mới — đây là UX milestone, không phải feature milestone
- Mobile app native — web-first
- OAuth / authentication — không liên quan milestone này

## Context

- Stack: React 19 + Tailwind + pixel-retroui, Socket.IO, Redis, TypeScript monorepo
- Architecture: Clean Architecture 4 layers (domain → application → infrastructure → presentation)
- Hiện tại: UI components nằm trong `apps/web/src/presentation/`, logic trong `apps/web/src/domain/`
- Pain points được xác nhận qua user feedback: 4 điểm mù thông tin trong màn game
- Design system: `apps/web/src/design-system/AppColor.ts` là single source of truth cho màu

## Constraints

- **Architecture**: Giữ phân tầng hiện có — không đưa game rule vào presentation
- **File size**: Không vượt 300 dòng mỗi file source code
- **Package manager**: Yarn only
- **Design tokens**: Dùng AppColor.ts, không hardcode màu

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cải thiện visual, không redesign | User xác nhận chỉ cần làm rõ hơn, không làm lại | — Pending |
| Non-host nhìn thấy rõ mình không được vote | Self-explanatory UI thay vì error message | — Pending |

---
*Last updated: 2026-02-28 after initialization*

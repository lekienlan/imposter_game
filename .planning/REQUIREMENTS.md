# Requirements: Imposter Game — UX Milestone

**Defined:** 2026-02-28
**Core Value:** Người chơi nhìn vào màn hình là biết ngay mình đang ở phase nào, phải làm gì, và kết quả là gì — không cần hỏi.

## v1 Requirements

### Phase Indicator

- [ ] **PHASE-01**: Người chơi thấy tên phase hiện tại rõ ràng (WAITING / WORD_REVEAL / DISCUSSION / VOTING / ENDED) dưới dạng badge/label
- [ ] **PHASE-02**: Người chơi thấy hướng dẫn action tiếp theo phù hợp với phase và vai trò (host vs non-host)

### Vote UI

- [ ] **VOTE-01**: Non-host không thấy vote UI trong VOTING phase — chỉ thấy trạng thái "Đang chờ host vote..."
- [ ] **VOTE-02**: Host thấy danh sách players có thể vote và nút Submit (two-step: chọn → submit)

### Word Reveal

- [ ] **WORD-01**: Sau khi đóng Word Reveal popup, player có thể mở lại bất kỳ lúc nào qua icon/button nhỏ trên màn hình
- [ ] **WORD-02**: Button xem lại từ bí mật visible trong suốt DISCUSSION và VOTING phase

### End Game

- [ ] **END-01**: Màn kết thúc hiển thị kết quả thắng/thua rõ ràng: "Villagers Win" hoặc "Imposter Wins" với visual nổi bật
- [ ] **END-02**: Màn kết thúc reveal role của tất cả người chơi (Imposter / Villager)
- [ ] **END-03**: Màn kết thúc hiển thị win/lose status của từng player

## v2 Requirements

### Phase Indicator

- **PHASE-03**: Animation chuyển phase (fade hoặc slide) để người chơi nhận ra phase đã đổi

### Vote UI

- **VOTE-03**: Non-host thấy ai đang bị chọn theo thời gian thực (host đang hover) — spectator mode

### End Game

- **END-04**: Tóm tắt lý do kết thúc: bị vote đúng imposter hay vote sai người
- **END-05**: Từ bí mật của Imposter được reveal (so sánh với Villagers)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Redesign toàn bộ layout | UX milestone — cải thiện visual hiện tại, không làm lại |
| Thêm gameplay mới | Feature milestone riêng |
| Mobile app native | Web-first |
| OAuth / authentication | Không liên quan milestone này |
| Chat trong game | Chức năng mới, ngoài scope UX |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PHASE-01 | Phase 1 | Pending |
| PHASE-02 | Phase 1 | Pending |
| VOTE-01 | Phase 2 | Pending |
| VOTE-02 | Phase 2 | Pending |
| WORD-01 | Phase 3 | Pending |
| WORD-02 | Phase 3 | Pending |
| END-01 | Phase 4 | Pending |
| END-02 | Phase 4 | Pending |
| END-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after initial definition*

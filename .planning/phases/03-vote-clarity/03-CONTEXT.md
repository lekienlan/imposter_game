# Phase 3: Vote Clarity - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Làm rõ luật vote cho tất cả người chơi trong VOTING phase: non-host thấy trạng thái bị khóa với giải thích rõ ràng, host thấy giao diện two-step (chọn → submit) với phản hồi đầy đủ. Không thêm tính năng vote mới, không thay đổi game rule.

</domain>

<decisions>
## Implementation Decisions

### Trạng thái khóa (non-host)
- Grid người chơi bị ẩn hoàn toàn — không hiển thị danh sách khi non-host vào VOTING phase
- Thay thế bằng badge tĩnh, nổi bật, giải thích ngắn (ví dụ: "Host đang vote cho cả nhóm") kèm icon khóa
- Badge hiển thị phía trên, ngay dưới tiêu đề phase — người dùng đọc từ trên xuống thấy ngay
- Badge hoàn toàn tĩnh: không spinner, không animation — rõ ràng là "trạng thái chờ" chứ không phải loading

### UX chọn mục tiêu (host)
- Host chọn mục tiêu bằng cách click vào card — một click để chọn, click lại để bỏ chọn
- Card được chọn: viền nổi bật (accent color) + nền nhạt khác biệt — phải rõ ràng, không thể bỏ sót
- Nút Submit disabled rõ ràng (mờ + cursor not-allowed) khi chưa chọn ai → chuyển active khi đã chọn
- Nút Submit hiển thị tên mục tiêu đã chọn (ví dụ: "Vote loại An") để confirm trước khi gửi

### Phản hồi sau khi submit
- Sau khi host bấm Submit: spinner xuất hiện trên nút + nút bị disable ngay lập tức
- Grid người chơi giữ nguyên trong lúc chờ — chỉ nút thay đổi, không làm xáo trộn layout
- Sau khi server xác nhận: game tự động chuyển phase qua server push event — không cần xử lý thêm phía client
- Nếu server trả lỗi: toast thông báo lỗi + re-enable nút + giữ nguyên lựa chọn để host có thể submit lại

### Layout grid người chơi trong VOTING
- Layout grid card (2 cột hoặc nhiều hơn) — nhất quán với các phase khác
- Người đã bị loại (eliminated): hiển thị trong grid nhưng bị mờ và không thể chọn
- Host hiển thị như player bình thường và có thể tự vote cho mình (host chỉ thực hiện quyết định của cả nhóm, không có quyền ưu tiên)
- Mỗi card chỉ hiển thị tên — không có avatar trong VOTING phase

### Claude's Discretion
- Màu sắc cụ thể của viền/nền khi card được chọn (dùng design token từ AppColor.ts)
- Nội dung text chính xác của badge non-host (ngôn ngữ i18n)
- Khoảng cách và typography chi tiết
- Thời gian hiển thị toast lỗi

</decisions>

<specifics>
## Specific Ideas

- Host là người thực hiện quyết định của cả nhóm — không có quyền ưu tiên, nên tự vote loại mình là hợp lệ
- Badge non-host phải giải thích LÝ DO khóa ("Host vote cho cả nhóm"), không chỉ nói "Đang chờ..."
- Nút Submit thay đổi text theo lựa chọn: "Vote loại [Tên]" thay vì chỉ "Submit"

</specifics>

<deferred>
## Deferred Ideas

Không có — thảo luận giữ đúng trong phạm vi Phase 3.

</deferred>

---

*Phase: 03-vote-clarity*
*Context gathered: 2026-02-28*

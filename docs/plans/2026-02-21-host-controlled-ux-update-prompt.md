# Prompt chi tiết: Update Function + UX (Host Control, i18n, Role Reveal)

## 1) Bối cảnh
App game hiện tại cần điều chỉnh lại flow để giảm thao tác của người chơi thường (non-host), tăng quyền điều khiển cho host, và làm rõ thông tin hiển thị theo từng phase.

## 2) Mục tiêu
- Chỉ **host** có quyền nhập/chỉnh `statement` và điều khiển các bước chính của game.
- Chỉ **host** có quyền bấm vote/chốt kết quả vote.
- Người chơi khi join chỉ cần nhập **tên**; sau khi vào phòng không cần nhập thêm dữ liệu.
- Mặc định ngôn ngữ ứng dụng là **tiếng Việt**.
- Trong UI chọn ngôn ngữ, thứ tự ưu tiên hiển thị là **VI trước EN**.
- Kết thúc game sẽ có luồng reveal role: popup cá nhân trước, sau đó Game Over modal tổng cho tất cả.

## 3) Yêu cầu chức năng

### 3.1 Phân quyền host và statement
- Chỉ host được phép gửi `statement`.
- Mọi action liên quan đến `statement` từ non-host phải bị chặn ở cả:
  - `frontend` (ẩn hoàn toàn input/button host-only), và
  - `backend` (validate quyền trước khi xử lý để tránh bypass).
- Nếu non-host cố submit qua API/socket thủ công, server trả lỗi quyền hạn phù hợp.

### 3.1b Phân quyền vote (host-only)
- Chỉ host được phép thực hiện action vote/chốt vote (bao gồm chọn người bị loại hoặc bỏ qua).
- Người chơi thường thảo luận offline, không có input vote trên UI.
- Bảng/danh sách vote phải hiển thị đầy đủ tất cả người chơi, **bao gồm cả host**.
- Mọi action vote từ non-host phải bị chặn ở cả:
  - `frontend` (ẩn hoàn toàn control vote host-only), và
  - `backend` (validate quyền trước khi xử lý để tránh bypass).
- Nếu non-host cố submit vote qua API/socket thủ công, server trả lỗi quyền hạn phù hợp.

### 3.2 Flow join game
- Ở màn join room, người dùng chỉ nhập:
  - `playerName`
- Không yêu cầu bất kỳ input bổ sung nào khác trong flow join.
- Sau khi join thành công, người chơi chuyển sang trạng thái “chờ/quan sát theo phase” và nhận thông tin từ host.

### 3.3 Mặc định ngôn ngữ
- Locale mặc định khi mở app lần đầu là `vi`.
- Nếu đã có lựa chọn ngôn ngữ lưu trước đó (ví dụ local storage), áp dụng theo dữ liệu đã lưu.
- Nếu không có dữ liệu lưu, fallback về `vi`.

### 3.4 Language switcher
- Thứ tự option ngôn ngữ trong UI:
  1. VI
  2. EN
- Giữ ngôn ngữ KO trong danh sách.
- Nếu có thêm ngôn ngữ khác trong tương lai, vẫn giữ nguyên nguyên tắc ưu tiên hiển thị VI trước EN.

### 3.5 Luồng reveal role khi kết thúc game
- Trong các phase đang chơi, không hiển thị role.
- Khi game kết thúc:
  - Bước 1: hiện popup reveal role cho từng người (client-side theo từng người).
  - Bước 2: sau đó hiện `Game Over` modal tổng cho tất cả người chơi.
- Đảm bảo không lộ role sớm qua label, tooltip, aria-label, debug text, hoặc payload hiển thị công khai trước phase kết thúc.

### 3.6 Xử lý mất kết nối (reconnect/retry)
- Cần có cơ chế retry socket khi host hoặc bất kỳ player nào mất kết nối tạm thời.
- Trong thời gian retry, cố gắng khôi phục phiên chơi thay vì kết thúc game ngay.
- Nếu host chủ động end game, game kết thúc theo flow bình thường.
- Nếu host rời phòng theo hành vi được xác định là "chủ động rời", kết thúc game luôn (không transfer host).
- Quy ước xác định host rời chủ động:
  - Chỉ khi host bấm `Leave` hoặc `End Game` mới tính là rời chủ động.
  - Các trường hợp mất mạng/timeout/disconnect ngoài ý muốn chỉ xử lý theo retry.
- Thời gian retry tối đa trước khi coi là fail: `30 giây`.

## 4) Yêu cầu UX/UI
- Non-host nhìn thấy giao diện tối giản theo hướng “read-only theo phase”, không có các input hành động dành cho host.
- Ẩn hoàn toàn các control host-only với non-host (không render disabled control).
- Mọi text mặc định theo tiếng Việt, giọng văn thân thiện, đời thường, dễ hiểu.

## 5) Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Non-host không thể nhập/gửi `statement` từ UI.
- [ ] Non-host không thể gửi `statement` bằng request/socket thủ công (server từ chối).
- [ ] Non-host không thấy control vote và không thể gửi vote thủ công (server từ chối).
- [ ] Bảng vote có hiển thị tên host trong danh sách người chơi.
- [ ] Join flow chỉ yêu cầu nhập tên.
- [ ] Locale mặc định là `vi` khi chưa có preference.
- [ ] Language switcher hiển thị VI trước EN.
- [ ] Language switcher vẫn giữ KO.
- [ ] Role không hiển thị trong các phase đang chơi.
- [ ] Kết thúc game có popup reveal role theo từng người trước khi hiện Game Over modal tổng.
- [ ] Có cơ chế retry socket khi mất kết nối tạm thời và khôi phục vào game thành công trong trường hợp mạng chập chờn.

## 6) Kỹ thuật đề xuất
- Cập nhật contract socket/use case cho `submitStatement` để validate `isHost` ở server.
- Cập nhật contract socket/use case cho `submitVote` để validate `isHost` ở server.
- Refactor các component action panel/reveal panel để tách rõ `hostActions` vs `viewerInfo`.
- Rà soát i18n setup (init locale, fallback locale, danh sách language options).
- Rà soát luồng reconnect hiện tại ở socket gateway + server handlers để thêm retry/backoff và resume state.
- Bổ sung/điều chỉnh test:
  - Unit test server authorization cho `SubmitStatementUseCase`.
  - Unit test server authorization cho `SubmitVoteUseCase`.
  - UI test/logic test cho language default + option order.
  - UI test cho luồng reveal role cuối game (popup cá nhân -> game over modal tổng).
  - Integration test cho reconnect/retry khi mất kết nối tạm thời.

## 7) Out of scope
- Không thay đổi luật thắng/thua cốt lõi của game.
- Không redesign toàn bộ visual system; chỉ chỉnh UX theo phạm vi nêu trên.

## 8) Quyết định đã chốt
1. Host rời chủ động chỉ khi bấm `Leave/End Game`; mất mạng thì retry.
2. Retry socket tối đa `30 giây`.

# 🎭 GAME SUY LUẬN – FULL GAME FLOW (LOGIC-ONLY)

## FINAL – LOCKED v4

## Roles: citizen / spy / white

## Phases: UPPER_CASE

Tài liệu này mô tả **luồng logic của toàn bộ game**, tập trung **100% vào hành vi & luật ở từng phase**.  
❌ Không mô tả field, payload, schema hay implementation chi tiết.  
✅ Chỉ mô tả **game làm gì – người chơi được làm gì – game chuyển trạng thái khi nào**.

---

## TỔNG QUAN

- Game vận hành theo **FINITE STATE MACHINE**
- Server là **nguồn quyết định duy nhất**
- Game kết thúc ngay khi đạt điều kiện thắng / thua
- Tối đa **8 ROUND**
- Không setup trước số lượng người chơi
- Host chỉ chọn:
  - Mode: CLASSIC hoặc HARDCORE
  - Bật / tắt white (chỉ CLASSIC)

## LUẬT TOÀN CỤC: RESET GAME (MỌI PHASE)

- Ở tất cả phase, UI luôn hiển thị nút `Reset Game` cho host.
- Host có thể reset game ở bất kỳ thời điểm nào.
- Khi reset:
  - Phase quay về `WAITING_FOR_PLAYERS`
  - Giữ nguyên room, host, danh sách người chơi và settings hiện tại
  - Xóa toàn bộ state theo ván (role, keyword, statement, vote, round, winner, kết quả loại)

---

## PHASE: GAME_CREATION

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Host tạo game
- Chọn mode
- Nếu mode là CLASSIC, có thể bật / tắt white
- Game được tạo và chờ người chơi tham gia

**Chuyển phase**

- Sang WAITING_FOR_PLAYERS ngay lập tức

---

## PHASE: WAITING_FOR_PLAYERS

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Người chơi tham gia bằng code
- Không giới hạn số lượng
- Người chơi có thể ra / vào tự do
- Tất cả người chơi phải kết nối realtime để chơi

**Chuyển phase**

- Host quyết định khi nào bắt đầu game

---

## PHASE: LOBBY_READY

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Game đã có đủ người để chơi (tối thiểu logic, không hard limit)
- Host xác nhận bắt đầu game
- Lobby bị khóa, không cho người mới vào

**Chuyển phase**

- Sang ROLE_DISTRIBUTION

---

## PHASE: ROLE_DISTRIBUTION

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Game dựa trên **số người chơi hiện tại** để chia vai

### CLASSIC

- Phần lớn là citizen
- Một phần là spy
- Nếu bật white:
  - Tối đa 1 white
  - White không có keyword ở đầu game
  - White luôn được tính là citizen cho thắng / thua

### HARDCORE

- Spy nhiều hơn citizen
- Không có white

**Logic chung**

- Mỗi người chỉ biết vai trò & keyword của mình
- Không ai biết vai trò người khác
- UI hiển thị popup `Word Reveal` riêng cho từng người chơi để đọc keyword rõ ràng (font lớn, dạng modal)
- Popup này là hành vi presentation, **không phải phase logic mới của server**

**Chuyển phase**

- Server tiếp tục flow round như hiện tại, chuyển sang `ROUND_DESCRIPTION`
- Việc đóng popup là thao tác UI phía client, không chặn state machine ở backend

---

## PHASE: ROUND_LOOP (ROUND 1 → ROUND 8)

Mỗi ROUND gồm 4 sub-phase theo thứ tự cố định.

---

### SUB-PHASE: ROUND_N_DESCRIPTION

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Tất cả người chơi còn sống **bắt buộc phải nói ít nhất 1 câu**
- Không được nói trực tiếp keyword
- Thứ tự nói:
  - Ngẫu nhiên mỗi round
  - Ngoại lệ:
    - Round 1 + có white → không bắt đầu bằng white

**Chuyển phase**

- Khi tất cả người chơi còn sống đã nói xong

---

### SUB-PHASE: ROUND_N_DISCUSSION

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Người chơi tự do tranh luận
- Có thể:
  - Nghi ngờ
  - Bảo vệ
  - Gây nhiễu
  - Thao túng tâm lý
- Không có hành động bắt buộc

**Chuyển phase**

- Khi host hoặc timer kết thúc thảo luận

---

### SUB-PHASE: ROUND_N_VOTING

**Logic – CLASSIC**

- Host luôn có quyền bấm `Reset Game`
- Tất cả người chơi còn sống được vote
- Mỗi người có thể:
  - Vote 1 người
  - Hoặc skip
- Có thể đổi vote trong thời gian vote

**Logic – HARDCORE**

- Chỉ citizen có quyền vote thật
- Mỗi round **bắt buộc phải loại đúng 1 người**
- Spy chỉ được giả vờ vote để gây nhiễu

**Xử lý hòa**

- Nếu hòa → vote lại ngay
- Nếu vẫn hòa → loại người thuộc nhóm nhiều phiếu nhất ở lần vote đầu

**Chuyển phase**

- Khi voting kết thúc

---

### SUB-PHASE: ROUND_N_RESULT

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Nếu skip → không ai bị loại
- Nếu có người bị loại:
  - Người đó chết
  - Vai trò được công bố công khai

**Luật thua ngay**

CLASSIC:

- Nếu white bị loại ở round 1 hoặc round 2  
  → citizen thua ngay

HARDCORE:

- Nếu citizen vote nhầm để loại citizen  
  → citizen thua ngay

**Chuyển phase**

- Sang WHITE_TRANSITION (nếu có)
- Sau đó sang WIN_LOSE_CHECK

---

## PHASE: WHITE_TRANSITION (CLASSIC ONLY)

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Chỉ xảy ra **sau round 2**
- Nếu white còn sống:
  - White trở thành citizen
  - Nhận keyword của citizen
- Sau phase này:
  - Không còn luật phạt đặc biệt liên quan đến white

**Chuyển phase**

- Sang WIN_LOSE_CHECK

---

## PHASE: WIN_LOSE_CHECK

**Logic – CLASSIC**

- Host luôn có quyền bấm `Reset Game`
- Citizen thắng nếu:
  - Số citizen còn sống > số spy còn sống
- Spy thắng nếu:
  - Số citizen ≤ số spy
  - Hoặc citizen đã thua do loại nhầm white

**Logic – HARDCORE**

- Citizen thắng nếu:
  - Số citizen ≥ số spy
- Spy thắng nếu:
  - Citizen vote nhầm bất kỳ citizen nào

**Chuyển phase**

- Nếu có phe thắng → GAME_ENDED
- Nếu chưa → sang ROUND\_(N+1)\_DESCRIPTION

---

## PHASE: GAME_ENDED

**Logic**

- Host luôn có quyền bấm `Reset Game`
- Game kết thúc hoàn toàn
- Công bố phe thắng và lý do
- Người chơi không được nói hoặc hành động thêm

**Sau game**

- Có thể replay
- Có thể rematch
- Có thể tạo game mới

---

## GHI CHÚ CUỐI

- citizen: phe kiểm soát, thắng bằng suy luận
- spy: phe thao túng, thắng bằng gây nhiễu
- white: biến số áp lực cao, **không phải lá chắn**

**Luật rõ – Phase rõ – Không có logic mơ hồ**

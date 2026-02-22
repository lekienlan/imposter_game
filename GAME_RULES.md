# 🎭 GAME SUY LUẬN – LUẬT CHƠI CHÍNH THỨC

## FINAL – LOCKED v4

Trò chơi **nói chuyện – suy luận – thao túng tâm lý**, chơi trực tiếp hoặc online.  
Người chơi **chỉ chọn tổng số người**, hệ thống/host **tự động chia vai** theo mode.

- ⏳ Tối đa **8 vòng**
- 🎯 Game có thể kết thúc sớm nếu đạt điều kiện thắng / thua
- 🗳️ Mỗi vòng **tối đa 1 người bị loại**

---

## 🧑‍🤝‍🧑 CÁC VAI TRÒ

### 🟢 DÂN

- Nhận **từ khóa A**
- Mục tiêu: **giữ quyền kiểm soát và loại gián điệp**

---

### 🔴 GIÁN ĐIỆP

- Nhận **từ khóa B** (gần nghĩa với từ của dân)
- Mục tiêu: **làm dân mất quyền kiểm soát hoặc vote sai**

---

### 🧢 ẨN SỐ

_(OPTIONAL – chỉ dùng trong Mode CLASSIC nếu host chọn)_

- Không có từ khóa ban đầu
- Không thuộc phe nào ban đầu
- **Luôn được tính là DÂN cho mọi điều kiện thắng / thua**
- Là vai trò **áp lực cao**

---

# 🟢 MODE 1: CLASSIC

## ⚙️ Chia phe

- Khoảng **70% là DÂN**
- Khoảng **30% là GIÁN ĐIỆP**
- **Ẩn số: TÙY CHỌN**
  - Tối đa **1 Ẩn số**
  - Khuyến nghị dùng khi **từ 6 người trở lên**

---

## 🔄 Luồng chơi mỗi vòng (CLASSIC)

1. **Mô tả**
   - Tất cả người chơi còn sống **bắt buộc phải nói ít nhất 1 câu**
   - Không được nói trực tiếp từ khóa

2. **Thảo luận**
   - Tranh luận, đặt nghi vấn, bảo vệ quan điểm

3. **Bỏ phiếu**
   - **Chỉ host vote thay mặt cả nhóm**
   - Host chọn mục tiêu (highlight), sau đó nhấn **Submit Vote** để xác nhận
   - Host **có thể chọn skip (không loại ai)**
   - Non-host xem danh sách player nhưng không thể vote

4. **Kết quả**
   - Nếu skip → **không ai bị loại**
   - Nếu có người bị loại → vai trò được công bố

---

## 🧢 LUẬT RIÊNG CHO ẨN SỐ (CLASSIC – CỐT LÕI)

### 🔸 Trạng thái

- **Vòng 1 & 2**
  - Chưa có từ khóa
  - Chưa trở thành DÂN
- **Từ vòng 3 trở đi**
  - Nếu còn sống → **trở thành DÂN**
  - Nhận từ khóa của dân

### ❌ Hình phạt đặc biệt

> **Nếu Ẩn số bị loại trong vòng 1 hoặc vòng 2  
> → DÂN THUA NGAY LẬP TỨC**

- Chỉ áp dụng khi **Ẩn số thực sự bị loại**
- Skip **không kích hoạt** hình phạt này

---

## 🏆 Điều kiện thắng – Mode CLASSIC

### 🟢 DÂN THẮNG KHI

- **Tất cả GIÁN ĐIỆP đã bị loại** (số GIÁN ĐIỆP còn sống = 0)

### 🔴 GIÁN ĐIỆP THẮNG KHI

- **Số GIÁN ĐIỆP còn sống ≥ số DÂN còn sống**
- **HOẶC**
- Dân thua ngay do **loại nhầm Ẩn số ở vòng 1–2**

> Điều kiện thắng / thua được kiểm tra **sau khi kết thúc mỗi vòng**.

---

# 🔥 MODE 2: HARDCORE

> Chế độ áp lực cực cao – **mỗi quyết định đều có thể kết thúc game**

---

## ⚙️ Chia phe

- **KHÔNG có Ẩn số**
- Khoảng **30% là DÂN**
- Khoảng **70% là GIÁN ĐIỆP**
- Gián điệp **luôn nhiều hơn dân khi bắt đầu**

---

## 🧑‍🤝‍🧑 Quyền hạn & luật đặc biệt

### 🟢 DÂN

- Là **phe duy nhất có quyền vote thật**
- **Mỗi vòng BẮT BUỘC phải loại đúng 1 người**
- Chỉ được vote **1 người / vòng**

### 🔴 GIÁN ĐIỆP

- Không có quyền vote thật
- Có thể giả vờ vote, gây nhiễu, thao túng

---

## ❌ LUẬT THUA NGAY (HARDCORE – CỐT LÕI)

> **Nếu dân vote nhầm để loại 1 DÂN  
> → DÂN THUA NGAY LẬP TỨC**

---

## 🏆 Điều kiện thắng – Mode HARDCORE

### 🟢 DÂN THẮNG KHI

- **Số DÂN còn sống ≥ số GIÁN ĐIỆP còn sống**

### 🔴 GIÁN ĐIỆP THẮNG KHI

- Dân vote nhầm **bất kỳ dân nào** ở bất kỳ vòng nào

> Điều kiện thắng / thua được kiểm tra **sau khi kết thúc vòng có người bị loại**.

---

# ⚖️ LUẬT CHUNG ÁP DỤNG CHO MỌI MODE

## 👁️ Hiển thị từ khóa (UI-only)

- Ngay sau khi game bắt đầu và người chơi nhận role/word, client hiển thị popup `Word Reveal` cho từng người chơi.
- Popup dùng để highlight keyword (font lớn, dễ đọc), chỉ hiển thị keyword của chính người chơi đó.
- Đây là hành vi giao diện (presentation), **không tạo thêm phase gameplay mới** và không thay đổi state machine của server.

## 🗣️ Luật phát biểu

- Thứ tự phát biểu **random lại mỗi vòng**
- **Mỗi vòng, tất cả người chơi còn sống phải nói ít nhất 1 câu**
- **Ngoại lệ duy nhất**:
  - Ở **vòng 1**, nếu có **Ẩn số**, thứ tự phát biểu **không bắt đầu bằng Ẩn số**
  - Ẩn số **vẫn phải nói**, chỉ không nói đầu tiên

---

## 🚫 Người bị loại

- **Không được nói thêm**
- Không ra dấu, không tiết lộ vai trò trước khi công bố

---

## ⏳ Giới hạn vòng

- Tối đa **8 vòng**
- Game kết thúc ngay khi đạt điều kiện thắng / thua

---

## 📌 GHI CHÚ CUỐI

- CLASSIC: cho phép do dự, đọc nhịp, kiểm soát rủi ro
- HARDCORE: ép quyết định, sai là chết
- Ẩn số (nếu bật): **vai trò nguy hiểm, không phải lá chắn**

**Mode CLASSIC để học kiểm soát.  
Mode HARDCORE để thử bản lĩnh.**

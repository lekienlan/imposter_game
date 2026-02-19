# GAME_FLOWS

## 1. Host Share Flow
1. Host tạo phòng và game ở phase `WAITING_FOR_PLAYERS`.
2. UI hiển thị nút `Share Game` chỉ cho host.
3. Khi host bấm nút:
- Client build URL với `roomId` và `hostName`.
- Nếu đang chạy local (`localhost/127.0.0.1/::1`), origin sẽ lấy từ `VITE_SHARE_ORIGIN`.
- URL được copy vào clipboard để gửi cho máy khác.

## 2. Invite Accept Flow
1. Player mở link có query `roomId`.
2. App hiện popup: `Muốn tham gia game của {player_name} k`.
3. Nếu player bấm **Có**:
- Xóa session cũ (`roomId`, `playerId`) ở localStorage.
- Reset socket connection để tránh dính room cũ.
- Auto join vào room mới bằng tên local (fallback rỗng nếu chưa có).
- Player vào luồng chờ game (`WAITING_FOR_PLAYERS`).

## 3. Invite Decline Flow
1. Player mở link invite.
2. Player bấm **Không** trong popup.
3. App:
- Xóa session cũ ở localStorage.
- Xóa state hiện tại của game trên client.
- Quay về lobby (`GAME_CREATION`).

## 4. Invalid Invite / Error Flow
- Nếu link thiếu `roomId`: bỏ qua invite flow, vào lobby bình thường.
- Nếu room không tồn tại hoặc game đã start: server trả lỗi qua `server:error`; UI hiển thị banner lỗi.
- Sau khi xử lý popup (accept/decline), query invite bị xóa khỏi URL để tránh chạy lặp.

## 5. Localhost To LAN IP Configuration
Để share được từ máy host sang máy khác trong cùng mạng LAN khi chạy local:

```bash
VITE_SHARE_ORIGIN=http://<LAN_IP>:5173
```

Ví dụ:

```bash
VITE_SHARE_ORIGIN=http://192.168.1.23:5173
```

Nếu thiếu `VITE_SHARE_ORIGIN` khi chạy localhost, app sẽ báo lỗi để host cấu hình lại trước khi share.

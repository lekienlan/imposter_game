# AGENTS.md

## Mục tiêu
Tài liệu này định nghĩa rule làm việc cho toàn bộ monorepo `imposter_game`, bám theo kiến trúc hiện tại và giúp code nhất quán, dễ review, dễ mở rộng.

## Cấu trúc dự án
- `apps/server`: backend Socket.IO + use case game.
- `apps/web`: frontend React + Tailwind.
- `packages/shared`: model/enums/dto dùng chung cho cả web và server.

## Kiến trúc bắt buộc
- Luôn giữ phân tầng rõ ràng: `domain -> application -> infrastructure -> interfaces/presentation`.
- `domain` phải thuần logic, không phụ thuộc framework (không React, không Socket, không Redis).
- `application` chỉ điều phối use case, gọi domain/repository/gateway qua interface.
- `infrastructure` chứa adapter cụ thể (Socket, Redis, gateway implementation).
- `presentation` chỉ render UI và xử lý tương tác UI.
- Không đặt game rule trực tiếp trong `presentation` hoặc `interfaces`.

## Rule tách Logic và UI
- Logic và UI phải nằm ở file khác nhau.
- Với frontend:
  - Logic nghiệp vụ/selector/use case: đặt ở `apps/web/src/domain` hoặc `apps/web/src/application`.
  - Adapter gọi socket/api: đặt ở `apps/web/src/infrastructure`.
  - Component React và style: đặt ở `apps/web/src/presentation`.
- Component UI không tự tính game rule phức tạp; chỉ gọi function từ layer logic.

## Rule giới hạn kích thước file
- File source code không được vượt quá `300 dòng`.
- Ngoại lệ (không áp dụng giới hạn 300 dòng):
  - File lock/generated: `yarn.lock`, `package-lock.json`, `pnpm-lock.yaml`.
  - File manifest/config toolchain: `package.json`, `tsconfig*.json`, `vite.config.*`, `tailwind.config.*`, `postcss.config.*`.
  - Tài liệu hoặc dữ liệu không phải source runtime (ví dụ: `README.md`, snapshot, fixture lớn).
- Nếu file có nguy cơ vượt ngưỡng:
  - Tách helper/function ra file riêng.
  - Tách component con hoặc hook riêng.
  - Tách constants/config ra module riêng.

## Quy tắc import và phụ thuộc
- Dùng model/enums/dto từ `@imposter/shared`, không tự định nghĩa trùng lặp.
- Không import ngược tầng (ví dụ `domain` không import từ `infrastructure`/`presentation`).
- Hạn chế side-effect trong module khi import.

## Quy tắc Package Manager
- Luôn sử dụng `yarn` cho mọi thao tác cài dependency và chạy script.
- Không sử dụng `npm` trong monorepo này.

## Quy tắc Design Token (Web)
- `apps/web/src/design-system/AppColor.ts` là nguồn màu duy nhất (single source of truth).
- Không hardcode mã màu trong `tailwind.config.ts` hoặc file CSS presentation nếu màu đã có trong design token.
- Tailwind color map phải lấy từ token TypeScript (import từ `AppColor.ts`) thay vì lặp lại object màu.
- CSS variable trong `design-system/colors.css` phải ưu tiên đọc qua `theme("colors...")` để đồng bộ với Tailwind token.

## Naming convention
- Tên file TypeScript/TSX dùng `PascalCase` cho class/use-case/model:
  - `CreateRoomUseCase.ts`, `SubmitVoteUseCase.ts`, `GameStateRepository.ts`.
- Tên hàm/biến dùng `camelCase`:
  - `assignRoles`, `evaluateWinner`, `playerId`.
- Enum/value hằng số dùng `UPPER_SNAKE_CASE` theo shared enums.
- Tên interface/class mô tả rõ vai trò:
  - `GameGateway`, `SocketGateway`, `GameStateRepository`.
- Tên selector domain frontend ưu tiên động từ/ngữ nghĩa rõ:
  - `getViewer`, `alivePlayers`, `isHost`.

## Testing và chất lượng
- Domain rule quan trọng cần có unit test (ưu tiên `apps/server/src/domain/__tests__`).
- Mỗi thay đổi rule game phải cập nhật test tương ứng.
- Tránh để logic quan trọng chỉ được kiểm thử qua UI thủ công.

## Quy tắc cập nhật code
- Khi thêm tính năng mới, ưu tiên mở rộng theo layer hiện có thay vì thêm nhanh vào `App.tsx`.
- Không trộn refactor lớn cùng PR fix nhỏ nếu không cần thiết.
- Giữ hàm ngắn gọn, ưu tiên pure function cho phần tính toán.
- Mỗi lần phát sinh thay đổi rule của project, phải hỏi user: có muốn cập nhật `CLAUDE.md` theo rule mới hay không, trước khi chỉnh sửa file rule.
- **Không tự động build hoặc commit code** sau mỗi lần chỉnh sửa. Chỉ build/commit khi user yêu cầu rõ ràng.
- Rule reset game:
  - UI chỉ hiển thị nút `Reset Game` cho host, ở tất cả phase trong màn game.
  - Chỉ host được phép thực thi reset.
  - Reset đưa game về `GAME_CREATION` và xóa toàn bộ state theo round/vote/role để bắt đầu ván mới.
- Rule hiển thị role:
  - **Không hiện role name trong bất kỳ UI nào** khi game chưa kết thúc. Hiển thị `???` thay thế.
  - Role chỉ được reveal ở phase `GAME_ENDED` (trong `ViewerCard` và `GameOverModal`).
  - `WordRevealPopup` chỉ hiển thị từ bí mật, **không** hiển thị role.
- Rule vote:
  - **Chỉ host được vote** – server và UI đều guard, non-host không được gửi vote.
  - Không có cơ chế hòa phiếu vì host là người vote duy nhất.
  - UI vote phải là **two-step**: chọn mục tiêu (highlight local state) → nhấn Submit mới gửi lên server.

## Checklist trước khi hoàn thành task
- Có vi phạm rule `>300 dòng` ở file source code không?
- Logic và UI đã tách file chưa?
- Có vi phạm hướng phụ thuộc giữa các layer không?
- Có tái sử dụng kiểu dữ liệu từ `@imposter/shared` chưa?
- Rule game mới đã có test chưa?

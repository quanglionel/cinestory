# CineStory - Ứng dụng đọc truyện & Xem phim (Modular Version)

Dự án CineStory đã được refactor toàn diện sang kiến trúc Module để đảm bảo tính mở rộng và dễ bảo trì.

## 📁 Cấu trúc dự án mới

### 🌐 Frontend (`/assets`, `/pages`)
- **Architechture**: Sử dụng ES Modules cho logic và CSS Modules cho giao diện.
- **JS Modules (`/assets/js/modules/`)**:
  - `api.js`: Quản lý giao tiếp với Backend.
  - `storage.js`: Xử lý LocalStorage (Lịch sử, Tiến trình đọc).
  - `config.js`: Lưu trữ các hằng số cấu hình.
  - `renderer.js`: Logic render giao diện dùng chung.
- **Page Logic**: `main.js` (Trang chủ), `detail.js` (Chi tiết), `reader.js` (Đọc truyện).
- **Styles**: Tách biệt CSS cho từng trang (`detail.css`, `reader.css`) để tối ưu tốc độ tải.

### 🖥️ Backend (`/server`)
- **Framework**: Express.js
- **Services**:
  - `otruyen.js`: Service chuyên trách giao tiếp với OTruyenAPI, format dữ liệu chuẩn cho frontend.
  - `cache.js`: Hệ thống Cache in-memory giúp giảm tải cho API gốc và tăng tốc độ phản hồi.

## 🚀 Hướng dẫn phát triển

1. **Cài đặt**: `npm install`
2. **Chạy Debug**: `node server/index.js`
3. **Môi trường Docker**: `docker-compose up --build`

## 🛠️ Tính năng hiện có
- [x] Xem danh sách truyện mới, truyện hoàn thành.
- [x] Tìm kiếm truyện thời gian thực.
- [x] Xem chi tiết truyện, tác giả, thể loại.
- [x] Đọc truyện với chế độ tối tối ưu, tự động chuyển chương khi cuộn cuối trang.
- [x] Lưu lịch sử và tiến trình đọc (đọc tiếp chương cũ).
- [x] Chuyển đổi linh hoạt giữa giao diện Anime và Truyện.

## 🔜 Lộ trình sắp tới (Roadmap)
- [ ] Tích hợp API Anime để xem phim.
- [ ] Hỗ trợ chế độ PWA (Dùng offline).
- [ ] Hệ thống Bookmark (Yêu thích).
- [ ] Đồng bộ hóa dữ liệu người dùng qua tài khoản.

---
*Dự án được bảo trì và phát triển bởi Antigravity AI.*

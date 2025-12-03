# 🚀 Hướng Dẫn Khởi Động Nhanh

## Cài đặt trong 5 phút

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cài đặt MySQL
```bash
mysql -u root -p
CREATE DATABASE ghost_webhook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### 3. Cấu hình môi trường
```bash
cp .env.example .env
nano .env  # Edit MySQL credentials
```

### 4. Tạo tài khoản Admin
```bash
npm run create-admin
# Username: admin
# Password: admin123
```

### 5. Khởi động Server
```bash
npm start
# hoặc: npm run dev (development mode)
```

### 6. Mở Admin Dashboard
```
http://localhost:3000/admin
```

### 7. Thêm cấu hình Platform

1. Đăng nhập vào dashboard
2. Nhấn "Add Platform"
3. Chọn nền tảng (Telegram/Facebook)
4. Nhập thông tin xác thực
5. Lưu lại

### 8. Cấu hình Ghost Webhook

1. Ghost Admin > Cài đặt > Tích hợp
2. Thêm tích hợp tùy chỉnh
3. Thêm webhook:
   - Sự kiện: Bài viết được xuất bản
   - URL: `http://your-server:3000/webhook/ghost`

### 9. Kiểm tra

Xuất bản một bài viết mới trên Ghost!

Kiểm tra:
- ✅ Dashboard > Nhật ký
- ✅ Thông báo Telegram/Facebook
- ✅ Thống kê được cập nhật

---

## Các lệnh

```bash
# Chế độ phát triển
npm run dev

# Chế độ production
npm start

# Tạo tài khoản admin
npm run create-admin

# PM2 (production)
pm2 start server.js --name ghost-webhook
pm2 logs ghost-webhook
```

## Các đường dẫn

- **Bảng điều khiển Admin:** `http://localhost:3000/admin`
- **Điểm cuối Webhook:** `http://localhost:3000/webhook/ghost`
- **Kiểm tra sức khỏe:** `http://localhost:3000/health`

## Thông tin đăng nhập mặc định

- Tên đăng nhập: `admin`
- Mật khẩu: `admin123`

⚠️ **Đổi mật khẩu ngay sau khi đăng nhập lần đầu!**

---

Cần trợ giúp? Xem [README.md](README.md) để biết tài liệu chi tiết.

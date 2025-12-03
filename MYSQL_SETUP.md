# Cài đặt Cơ sở dữ liệu MySQL

## Cách 1: Sử dụng dòng lệnh MySQL

```bash
# Login vào MySQL
mysql -u root -p

# Chạy script setup
source setup-db.sql

# Hoặc
mysql -u root -p < setup-db.sql
```

## Cách 2: Tạo database thủ công

```sql
CREATE DATABASE ghost_webhook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sau đó app sẽ tự động tạo tables khi chạy lần đầu.

## Cách 3: Sử dụng phpMyAdmin / MySQL Workbench

1. Tạo cơ sở dữ liệu mới tên `ghost_webhook`
2. Nhập file `setup-db.sql`

## Cấu hình .env

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa thông tin MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ghost_webhook
```

## Tài khoản Admin mặc định

- **Tên đăng nhập:** admin
- **Mật khẩu:** admin123

⚠️ **QUAN TRỌNG:** Đổi mật khẩu ngay sau khi đăng nhập lần đầu!

## Kiểm tra kết nối

```bash
npm start
```

Nếu thấy `✓ MySQL connected successfully` (MySQL kết nối thành công) là OK!

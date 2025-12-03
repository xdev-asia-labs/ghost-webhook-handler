-- Script khởi tạo database MySQL cho Ghost Webhook Handler
-- Chạy script này trước khi start app

-- Tạo database
CREATE DATABASE IF NOT EXISTS ghost_webhook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE ghost_webhook;

-- Xóa tables cũ nếu cần (cẩn thận trong production!)
-- DROP TABLE IF EXISTS notification_logs;
-- DROP TABLE IF EXISTS webhook_logs;
-- DROP TABLE IF EXISTS configs;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS settings;

-- Tạo tables (app sẽ tự tạo khi chạy, nhưng có thể dùng script này để setup manual)

-- Bảng configs
CREATE TABLE IF NOT EXISTS configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50) NOT NULL UNIQUE,
    enabled TINYINT(1) DEFAULT 1,
    config_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_platform (platform),
    INDEX idx_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id VARCHAR(100),
    post_title VARCHAR(500),
    post_url VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    payload TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    webhook_log_id INT,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    response_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_log_id) REFERENCES webhook_logs(id) ON DELETE CASCADE,
    INDEX idx_webhook_log_id (webhook_log_id),
    INDEX idx_platform (platform),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng settings
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
-- IMPORTANT: Đổi password ngay sau khi login lần đầu!
INSERT IGNORE INTO users (username, password_hash) 
VALUES ('admin', '$2b$10$rKvVJvBXz5y7WxJ0O5YgQ.xYxQX8vBJLKQQZxZxQ5y7WxJ0O5YgQ.');

-- Thông báo hoàn thành
SELECT '✓ Database setup completed successfully!' as message;

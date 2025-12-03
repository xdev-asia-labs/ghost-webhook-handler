import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ghost_webhook',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('✓ MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('✗ MySQL connection error:', err.message);
    });

/**
 * Khởi tạo database schema
 */
export async function initDatabase() {
    const connection = await pool.getConnection();

    try {
        // Bảng cấu hình platforms
        await connection.query(`
            CREATE TABLE IF NOT EXISTS configs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform VARCHAR(50) NOT NULL UNIQUE,
                enabled TINYINT(1) DEFAULT 1,
                config_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_platform (platform),
                INDEX idx_enabled (enabled)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Bảng webhook logs
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Bảng notification logs
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Bảng users (admin accounts)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Bảng settings (general settings)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                \`key\` VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ Database tables initialized');
    } finally {
        connection.release();
    }
}

// ============= CONFIG OPERATIONS =============

export async function getConfig(platform) {
    const [rows] = await pool.query('SELECT * FROM configs WHERE platform = ?', [platform]);
    return rows[0] || null;
}

export async function getAllConfigs() {
    const [rows] = await pool.query('SELECT * FROM configs ORDER BY platform');
    return rows;
}

export async function saveConfig(platform, enabled, configData) {
    const [result] = await pool.query(`
        INSERT INTO configs (platform, enabled, config_data)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            enabled = VALUES(enabled),
            config_data = VALUES(config_data),
            updated_at = CURRENT_TIMESTAMP
    `, [platform, enabled ? 1 : 0, JSON.stringify(configData)]);
    return result;
}

export async function deleteConfig(platform) {
    const [result] = await pool.query('DELETE FROM configs WHERE platform = ?', [platform]);
    return result;
}

export async function toggleConfig(platform, enabled) {
    const [result] = await pool.query(`
        UPDATE configs 
        SET enabled = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE platform = ?
    `, [enabled ? 1 : 0, platform]);
    return result;
}

// ============= WEBHOOK LOGS =============

export async function logWebhook(postId, postTitle, postUrl, status, errorMessage = null, payload = null) {
    const [result] = await pool.query(`
        INSERT INTO webhook_logs (post_id, post_title, post_url, status, error_message, payload)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [postId, postTitle, postUrl, status, errorMessage, payload ? JSON.stringify(payload) : null]);
    return result.insertId;
}

export async function getWebhookLogs(limit = 50, offset = 0) {
    const [rows] = await pool.query(`
        SELECT * FROM webhook_logs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
}

export async function getWebhookLogById(id) {
    const [rows] = await pool.query('SELECT * FROM webhook_logs WHERE id = ?', [id]);
    return rows[0] || null;
}

export async function getWebhookStats() {
    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
            SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
        FROM webhook_logs
    `);
    return rows[0];
}

// ============= NOTIFICATION LOGS =============

export async function logNotification(webhookLogId, platform, status, errorMessage = null, responseData = null) {
    const [result] = await pool.query(`
        INSERT INTO notification_logs (webhook_log_id, platform, status, error_message, response_data)
        VALUES (?, ?, ?, ?, ?)
    `, [webhookLogId, platform, status, errorMessage, responseData ? JSON.stringify(responseData) : null]);
    return result;
}

export async function getNotificationLogs(webhookLogId = null, limit = 50) {
    let query = 'SELECT * FROM notification_logs';
    let params = [];

    if (webhookLogId) {
        query += ' WHERE webhook_log_id = ?';
        params.push(webhookLogId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.query(query, params);
    return rows;
}

export async function getNotificationStats() {
    const [rows] = await pool.query(`
        SELECT 
            platform,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
            SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
        FROM notification_logs
        GROUP BY platform
    `);
    return rows;
}

// ============= USER OPERATIONS =============

export async function createUser(username, passwordHash) {
    const [result] = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
    );
    return result;
}

export async function getUser(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
}

export async function getAllUsers() {
    const [rows] = await pool.query('SELECT id, username, created_at FROM users');
    return rows;
}

export async function deleteUser(username) {
    const [result] = await pool.query('DELETE FROM users WHERE username = ?', [username]);
    return result;
}

// ============= SETTINGS OPERATIONS =============

export async function getSetting(key) {
    const [rows] = await pool.query('SELECT value FROM settings WHERE `key` = ?', [key]);
    return rows[0] ? rows[0].value : null;
}

export async function setSetting(key, value) {
    const [result] = await pool.query(`
        INSERT INTO settings (\`key\`, value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
            value = VALUES(value),
            updated_at = CURRENT_TIMESTAMP
    `, [key, value]);
    return result;
}

export async function getAllSettings() {
    const [rows] = await pool.query('SELECT * FROM settings');
    return rows;
}

// Cleanup function
export async function closeDatabase() {
    await pool.end();
}

export default pool;

import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendTelegramNotification } from './telegram.js';
import { postToFacebook } from './facebook.js';
import {
    initDatabase,
    getConfig,
    getAllConfigs,
    saveConfig,
    deleteConfig,
    toggleConfig,
    logWebhook,
    logNotification,
    getWebhookLogs,
    getWebhookStats,
    getNotificationStats,
    closeDatabase
} from './db.js';
import {
    authenticateUser,
    hashPassword,
    requireAuth,
    requireAuthPage
} from './auth.js';
import pool from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MySQLStore = MySQLStoreFactory(session);

// Session store
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000
}, pool);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Webhook handler is running' });
});

// ============= ADMIN UI ROUTES =============

// Login page
app.get('/admin/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin');
    }
    res.render('login', { error: null });
});

// Login handler
app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authenticateUser(username, password);

        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        req.session.user = user;
        res.redirect('/admin');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Login failed' });
    }
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Admin dashboard
app.get('/admin', requireAuthPage, async (req, res) => {
    try {
        const configs = await getAllConfigs();
        const webhookStats = await getWebhookStats();
        const notificationStats = await getNotificationStats();

        res.render('dashboard', {
            user: req.session.user,
            configs,
            webhookStats,
            notificationStats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Server error');
    }
});

// Logs page
app.get('/admin/logs', requireAuthPage, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const logs = await getWebhookLogs(limit, offset);
        res.render('logs', { user: req.session.user, logs, page });
    } catch (error) {
        console.error('Logs error:', error);
        res.status(500).send('Server error');
    }
});

// ============= ADMIN API ROUTES =============

// Get all configs
app.get('/api/configs', requireAuth, async (req, res) => {
    try {
        const configs = await getAllConfigs();
        res.json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save config
app.post('/api/configs', requireAuth, async (req, res) => {
    try {
        const { platform, enabled, configData } = req.body;
        await saveConfig(platform, enabled, configData);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle config
app.patch('/api/configs/:platform/toggle', requireAuth, async (req, res) => {
    try {
        const { platform } = req.params;
        const { enabled } = req.body;
        await toggleConfig(platform, enabled);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete config
app.delete('/api/configs/:platform', requireAuth, async (req, res) => {
    try {
        const { platform } = req.params;
        await deleteConfig(platform);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stats
app.get('/api/stats', requireAuth, async (req, res) => {
    try {
        const webhookStats = await getWebhookStats();
        const notificationStats = await getNotificationStats();
        res.json({ webhookStats, notificationStats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get log by ID
app.get('/api/logs/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const log = await getWebhookLogById(id);
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= WEBHOOK ENDPOINT =============

// Main webhook endpoint for Ghost
app.post('/webhook/ghost', async (req, res) => {
    let webhookLogId = null;

    try {
        const { post } = req.body;

        // Kiểm tra xem có phải bài viết mới được publish không
        if (!post || !post.current) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        const postData = post.current;

        // Chỉ xử lý khi bài viết được publish (không phải draft hay scheduled)
        if (postData.status !== 'published') {
            console.log(`Post "${postData.title}" is not published yet. Skipping...`);
            return res.json({ message: 'Post is not published' });
        }

        console.log(`New published post detected: ${postData.title}`);

        // Log webhook
        webhookLogId = await logWebhook(
            postData.id,
            postData.title,
            postData.url,
            'processing',
            null,
            req.body
        );

        // Chuẩn bị thông tin bài viết
        const postInfo = {
            title: postData.title,
            url: postData.url,
            excerpt: postData.excerpt || postData.custom_excerpt || '',
            featureImage: postData.feature_image || '',
            publishedAt: postData.published_at,
            authors: postData.authors?.map(a => a.name).join(', ') || 'Unknown'
        };

        // Lấy configs từ database
        const configs = await getAllConfigs();
        const notifications = [];

        // Gửi thông báo qua các platforms đã enable
        for (const config of configs) {
            if (!config.enabled) continue;

            const configData = JSON.parse(config.config_data);

            if (config.platform === 'telegram' && configData.botToken && configData.chatId) {
                notifications.push(
                    sendTelegramNotification(postInfo)
                        .then(() => {
                            console.log('✓ Telegram notification sent');
                            return logNotification(webhookLogId, 'telegram', 'success');
                        })
                        .catch(err => {
                            console.error('✗ Telegram error:', err.message);
                            return logNotification(webhookLogId, 'telegram', 'error', err.message);
                        })
                );
            }

            if (config.platform === 'facebook' && configData.pageId && configData.accessToken) {
                notifications.push(
                    postToFacebook(postInfo)
                        .then(() => {
                            console.log('✓ Facebook post published');
                            return logNotification(webhookLogId, 'facebook', 'success');
                        })
                        .catch(err => {
                            console.error('✗ Facebook error:', err.message);
                            return logNotification(webhookLogId, 'facebook', 'error', err.message);
                        })
                );
            }
        }

        // Đợi tất cả notifications hoàn thành
        await Promise.allSettled(notifications);

        // Update webhook status
        await logWebhook(
            postData.id,
            postData.title,
            postData.url,
            'success'
        );

        res.json({
            success: true,
            message: 'Notifications sent',
            post: postInfo.title
        });

    } catch (error) {
        console.error('Webhook error:', error);

        if (webhookLogId) {
            await logWebhook(null, null, null, 'error', error.message);
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Webhook handler running on port ${PORT}`);
            console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook/ghost`);
            console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
            console.log(`\nDefault login: admin / admin123`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

startServer();

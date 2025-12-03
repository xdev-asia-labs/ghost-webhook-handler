# 🚀 Ghost Webhook Handler - Full-Stack Admin Dashboard

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-18+-43853d.svg?style=flat&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-8.0-4479a1.svg?style=flat&logo=mysql&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=flat&logo=githubactions&logoColor=white)

Automated webhook handler system with admin dashboard to manage notifications to multiple platforms when new posts are published on Ghost.

## 📖 Quick Links

- 🚀 [Quick Start Guide](QUICKSTART.md) - Get running in 5 minutes
- 🐳 [Docker Deployment](DOCKER.md) - Production deployment with Docker
- 🔑 [GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md) - 2-step CI/CD setup
- ⚙️ [GitHub Actions Details](GITHUB_ACTIONS.md) - Complete automation guide
- ✅ [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre/post deployment verification

## ✨ Features

### Core Features

- ✅ **Admin Dashboard** - Web interface to manage the entire system
- ✅ **MySQL Database** - Store configs, logs and user data
- ✅ **Multi-Platform Support** - Telegram, Facebook, Discord, Slack
- ✅ **Real-time Logging** - Track all webhook events and notifications
- ✅ **Statistics Dashboard** - View stats and success rates
- ✅ **Config Management** - Enable/disable platforms, edit configs via UI
- ✅ **User Authentication** - Secure admin panel with session management
- ✅ **Auto Retry** - Automatic error logging and retry logic
- ✅ **CI/CD Pipeline** - Automatic Docker build and push with GitHub Actions
- ✅ **Multi-Platform Images** - Support for AMD64 and ARM64 architectures

### Platform Features

- ✅ Automatically send notifications via Telegram Bot
- ✅ Automatically post to Facebook Fanpage
- ✅ Support featured image attachments
- ✅ Beautiful message formatting with Markdown
- ✅ Parallel notification processing

## 📋 Requirements

- Node.js >= 18
- MySQL >= 5.7 or MariaDB >= 10.2
- Ghost blog installed

## 🚀 Installation

### Step 1: Clone & Install

```bash
cd ghost-webhook-handler
npm install
```

### Step 2: Setup MySQL Database

```bash
# Create database
mysql -u root -p
```

```sql
CREATE DATABASE ghost_webhook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or import SQL file:

```bash
mysql -u root -p < setup-db.sql
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_random_secret_key_here

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ghost_webhook

# Webhook Secret (optional)
WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 4: Create Admin User

```bash
npm run create-admin
```

Default credentials:

- **Username:** admin
- **Password:** admin123

⚠️ **Change password immediately after first login!**

### Step 5: Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Or use PM2
pm2 start server.js --name ghost-webhook
```

### Step 6: Access Admin Dashboard

Open browser: **<http://localhost:3000/admin>**

Login with credentials from Step 4.

## 🔧 How to Get Credentials

### Telegram Bot

1. **Create Telegram Bot:**
   - Open Telegram and find `@BotFather`
   - Send command `/newbot`
   - Name your bot
   - Get Bot Token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Get Chat ID:**

   **Method 1: Send message to bot**
   - Send any message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find `"chat":{"id": 123456789}` in response

   **Method 2: Create channel**
   - Create new channel on Telegram
   - Add bot to channel with admin rights
   - Chat ID will be `@your_channel_name` or `-100123456789`

### Facebook Page Access Token

1. **Create Facebook App:**
   - Visit [Facebook Developers](https://developers.facebook.com/)
   - Create new app, select type "Business"
   - Add product "Facebook Login"

2. **Get Page Access Token:**
   - Go to Tools > Graph API Explorer
   - Select your page
   - Add permissions: `pages_manage_posts`, `pages_read_engagement`
   - Generate Access Token
   - **Important:** Convert to long-lived token (60 days or never expire)

3. **Get Page ID:**
   - Go to your page
   - Settings > About > Page ID

## 🎨 Using Admin Dashboard

### 1. Manage Platforms

Go to **Dashboard** > **Add Platform**:

**Telegram:**

- Platform: `telegram`
- Bot Token: `123456:ABCdef...`
- Chat ID: `@your_channel` or `123456789`

**Facebook:**

- Platform: `facebook`
- Page ID: `123456789`
- Access Token: `EAAxxxxx...`

### 2. Enable/Disable Platforms

Toggle switch next to each platform to enable/disable.

### 3. View Logs

Go to **Logs** to view history:

- All webhook requests
- Success/error status
- Payload and response details

### 4. View Statistics

Dashboard displays:

- Total webhooks
- Success rate
- Platform-specific stats

## 🌐 Configure Ghost Webhook

### Step 1: Expose Server (if running locally)

```bash
# Install ngrok
brew install ngrok

# Expose port 3000
ngrok http 3000
```

### Step 2: Create Custom Integration in Ghost

1. Ghost Admin > **Settings** > **Integrations**
2. **Add custom integration**
3. Name it: "Webhook Handler"

### Step 3: Create Webhook

1. Click **Add webhook**
2. **Name:** Post Published
3. **Event:** Post published
4. **Target URL:** `https://your-server.com/webhook/ghost`
5. **Create webhook**

### Step 4: Test

Publish a new post and check:

- ✅ Admin Dashboard > Logs
- ✅ Platform notifications (Telegram/Facebook)
- ✅ Statistics updated

## 📊 Database Schema

```sql
# configs - Store platform configurations
- id, platform, enabled, config_data, created_at, updated_at

# webhook_logs - Log all webhook requests
- id, post_id, post_title, post_url, status, error_message, payload, created_at

# notification_logs - Log each notification sent
- id, webhook_log_id, platform, status, error_message, response_data, created_at

# users - Admin accounts
- id, username, password_hash, created_at

# settings - General application settings
- key, value, updated_at
```

## 🔍 Troubleshooting

### MySQL Connection Error

```bash
# Check MySQL is running
mysql -u root -p

# Check database exists
SHOW DATABASES;

# Verify credentials in .env
```

### Admin Login Failed

```bash
# Recreate admin account
npm run create-admin
```

### Webhook Not Received

- Check Ghost webhook configuration
- Verify URL is accessible
- Check firewall rules
- View logs: Admin Dashboard > Logs

### Platform Not Sending

- Verify configuration in Dashboard
- Check platform is enabled (toggle)
- Test credentials manually
- View errors in Logs

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### View Logs

```bash
# PM2
pm2 logs ghost-webhook

# Admin Dashboard
http://localhost:3000/admin/logs
```

### Database Stats

```sql
-- Total webhooks
SELECT COUNT(*) FROM webhook_logs;

-- Success rate by platform
SELECT platform, 
       COUNT(*) as total,
       SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) as success
FROM notification_logs 
GROUP BY platform;
```

## 🔒 Security

1. **Do not commit `.env` file** to Git
2. Use HTTPS for webhook URL (production)
3. Add webhook secret to verify requests from Ghost
4. Rate limit webhook endpoint
5. Rotate Access Tokens periodically

## 🚢 Production Deployment

### Option 1: Docker (Recommended)

**Using pre-built image from GitHub Container Registry:**

```bash
# 1. Clone and setup
git clone https://github.com/xdev-asia-labs/ghost-webhook-handler.git
cd ghost-webhook-handler
cp .env.example .env
nano .env  # Edit configuration

# 2. Pull latest image (optional, docker-compose will pull automatically)
docker pull ghcr.io/xdev-asia-labs/ghost-webhook-handler:latest

# 3. Start all services (MySQL + App)
docker-compose up -d

# 4. Create admin user
docker-compose exec app npm run create-admin

# 5. Access at http://localhost:3000/admin
```

**Building locally (alternative):**

```bash
# Edit docker-compose.yml: comment 'image:' and uncomment 'build: .'
docker-compose up -d --build
```

**Check status:**

```bash
docker-compose ps
docker-compose logs -f app
```

📖 **Full Docker documentation:** See [DOCKER.md](DOCKER.md) for complete guide including:

- Standalone Docker deployment
- Production best practices
- Nginx reverse proxy setup
- Backup & restore procedures
- Troubleshooting

🔄 **Automatic builds:** See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) for setting up automatic Docker image builds and publishing to Docker Hub.

---

### Option 2: VPS/Server Setup

```bash
# 1. Clone repository
git clone <your-repo>
cd ghost-webhook-handler

# 2. Install dependencies
npm install --production

# 3. Setup MySQL
mysql -u root -p < setup-db.sql

# 4. Configure .env
cp .env.example .env
nano .env

# 5. Create admin account
npm run create-admin

# 6. Start with PM2
pm2 start server.js --name ghost-webhook
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy (optional)
# Point to http://localhost:3000
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=<strong-random-secret>
DB_HOST=<mysql-host>
DB_USER=<mysql-user>
DB_PASSWORD=<mysql-password>
DB_NAME=ghost_webhook
```

## 📦 Project Structure

```
ghost-webhook-handler/
├── server.js              # Main application server
├── db.js                  # MySQL database layer
├── auth.js               # Authentication logic
├── telegram.js           # Telegram integration
├── facebook.js           # Facebook integration
├── create-admin.js       # Admin user creator
├── views/                # EJS templates
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── logs.ejs
│   └── partials/
├── public/               # Static assets
│   ├── css/
│   └── js/
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── .env.example          # Environment template
├── setup-db.sql          # Database schema
├── .github/
│   └── workflows/
│       └── docker-build-push.yml  # GitHub Actions CI/CD
├── README.md             # Main documentation
├── DOCKER.md             # Docker deployment guide
├── GITHUB_ACTIONS.md     # CI/CD setup guide
├── DEPLOYMENT_CHECKLIST.md  # Deployment checklist
├── QUICKSTART.md         # Quick start guide
└── MYSQL_SETUP.md        # MySQL setup guide
```

## 📚 Documentation

- **[README.md](README.md)** - Complete guide (this file)
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[MYSQL_SETUP.md](MYSQL_SETUP.md)** - Detailed MySQL configuration
- **[DOCKER.md](DOCKER.md)** - Docker deployment & production guide
- **[GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)** - Automatic Docker build & push setup
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment verification

## 📞 Support

If you encounter issues:

1. Check logs in Admin Dashboard
2. Review configuration in `.env`
3. Test each integration individually
4. Contact: <duy@xdev.asia>

## 📄 License

MIT License - xdev.asia
MIT License - xdev.asia

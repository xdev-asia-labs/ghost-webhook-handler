# 🚀 Deployment Checklist

Quick checklist to ensure smooth deployment of Ghost Webhook Handler.

## 📋 Pre-Deployment

### 1. Environment Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET` (min 32 characters)
- [ ] Configure MySQL credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`)
- [ ] Set `DB_NAME=ghost_webhook`
- [ ] (Optional) Set `WEBHOOK_SECRET` for Ghost verification

### 2. Platform Credentials

- [ ] Get Telegram Bot Token from @BotFather
- [ ] Get Telegram Chat ID (channel or group)
- [ ] Get Facebook Page ID
- [ ] Get Facebook Page Access Token (long-lived)
- [ ] Test credentials manually before adding to dashboard

### 3. Database

- [ ] MySQL 5.7+ or MariaDB 10.2+ installed
- [ ] Database created: `ghost_webhook`
- [ ] Character set: `utf8mb4`
- [ ] Run `setup-db.sql` to create tables
- [ ] Verify all 5 tables created: `configs`, `webhook_logs`, `notification_logs`, `users`, `settings`

## 🐳 Docker Deployment

### Quick Start

```bash
# 1. Clone repository
git clone <your-repo>
cd ghost-webhook-handler

# 2. Configure environment
cp .env.example .env
nano .env

# 3. Start services
docker-compose up -d

# 4. Check logs
docker-compose logs -f app

# 5. Create admin user
docker-compose exec app npm run create-admin

# 6. Access dashboard
# http://your-server:3000/admin
```

### Verification

- [ ] MySQL container running: `docker-compose ps`
- [ ] App container running and healthy: `docker-compose ps`
- [ ] No errors in logs: `docker-compose logs app`
- [ ] Database initialized: `docker-compose exec mysql mysql -u root -p -e "USE ghost_webhook; SHOW TABLES;"`
- [ ] Admin user created successfully
- [ ] Can access login page: `http://localhost:3000/admin`
- [ ] Can login with admin credentials
- [ ] Dashboard loads without errors

## 🖥️ Manual Deployment (PM2)

### Setup

```bash
# 1. Install dependencies
npm install --production

# 2. Setup database
mysql -u root -p < setup-db.sql

# 3. Create admin
npm run create-admin

# 4. Start with PM2
pm2 start server.js --name ghost-webhook
pm2 save
pm2 startup
```

### Verification

- [ ] MySQL database configured and accessible
- [ ] All tables created successfully
- [ ] Admin user exists in `users` table
- [ ] PM2 process running: `pm2 status`
- [ ] No errors in logs: `pm2 logs ghost-webhook`
- [ ] Application accessible on port 3000
- [ ] Can login to admin panel

## 🌐 Ghost Integration

### 1. Configure Webhook Endpoint

**If using ngrok (development):**

```bash
ngrok http 3000
# Use: https://xxxx.ngrok.io/webhook/ghost
```

**If using domain (production):**

```
https://your-domain.com/webhook/ghost
```

### 2. Create Ghost Integration

- [ ] Login to Ghost Admin
- [ ] Go to Settings > Integrations
- [ ] Click "Add custom integration"
- [ ] Name: "Webhook Handler"
- [ ] Click "Add webhook"
- [ ] Name: "Post Published"
- [ ] Event: "Post published"
- [ ] Target URL: `<your-server>/webhook/ghost`
- [ ] Save webhook

### 3. Test Webhook

- [ ] Publish a test post in Ghost
- [ ] Check Admin Dashboard > Logs
- [ ] Verify webhook received (status: success)
- [ ] Check notification logs for each platform
- [ ] Verify messages sent to Telegram/Facebook
- [ ] Check statistics updated correctly

## ⚙️ Admin Dashboard Configuration

### 1. Initial Login

- [ ] Access: `http://your-server:3000/admin`
- [ ] Login with default credentials
- [ ] **IMPORTANT:** Change admin password immediately!

### 2. Add Platforms

**Telegram:**

- [ ] Click "Add Platform"
- [ ] Platform: `telegram`
- [ ] Bot Token: `123456789:ABCdef...`
- [ ] Chat ID: `@channel` or `123456789`
- [ ] Enable toggle: ON
- [ ] Test by publishing Ghost post

**Facebook:**

- [ ] Click "Add Platform"
- [ ] Platform: `facebook`
- [ ] Page ID: `123456789`
- [ ] Access Token: `EAAxxxxxxx...`
- [ ] Enable toggle: ON
- [ ] Test by publishing Ghost post

### 3. Verify Configuration

- [ ] All platforms listed in dashboard
- [ ] Toggle switches working (enable/disable)
- [ ] Edit functionality working
- [ ] Statistics showing correct counts
- [ ] Logs page accessible and showing entries

## 🔒 Security Checklist

### Environment

- [ ] `.env` file not committed to Git
- [ ] `.env` has proper permissions (600)
- [ ] `SESSION_SECRET` is strong and unique
- [ ] `NODE_ENV=production` in production

### Database

- [ ] MySQL user has minimum required permissions
- [ ] MySQL not exposed to public internet
- [ ] Strong MySQL root password set
- [ ] Regular database backups configured

### Application

- [ ] Admin password changed from default
- [ ] Using HTTPS in production
- [ ] Nginx reverse proxy configured (if applicable)
- [ ] Firewall rules configured (only allow 80/443)
- [ ] Rate limiting enabled (future feature)
- [ ] Webhook secret configured in Ghost (future feature)

### Docker (if using)

- [ ] Docker volumes persist data correctly
- [ ] Containers restart automatically: `restart: unless-stopped`
- [ ] No sensitive data in Docker image
- [ ] Using official base images only
- [ ] Regular updates: `docker-compose pull`

## 🔍 Health Checks

### Application Health

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected: {"status":"ok","timestamp":"..."}
```

### Database Health

```bash
# Docker
docker-compose exec mysql mysqladmin ping -u root -p

# Manual
mysql -u root -p -e "SELECT 1"
```

### Logs Monitoring

```bash
# Docker
docker-compose logs -f app
docker-compose logs -f mysql

# PM2
pm2 logs ghost-webhook

# Admin Dashboard
# http://your-server:3000/admin/logs
```

## 📊 Post-Deployment Monitoring

### Daily Checks

- [ ] Check webhook logs for errors
- [ ] Verify success rate > 95%
- [ ] Review notification logs
- [ ] Check disk space usage
- [ ] Verify database backups

### Weekly Checks

- [ ] Review all platform configurations
- [ ] Test each platform manually
- [ ] Check for Ghost CMS updates
- [ ] Review security logs
- [ ] Optimize database if needed

### Monthly Checks

- [ ] Rotate access tokens (Facebook)
- [ ] Update dependencies: `npm update`
- [ ] Review and archive old logs
- [ ] Test disaster recovery process
- [ ] Review and update documentation

## 🆘 Troubleshooting

### Webhook Not Received

1. Check Ghost webhook configuration
2. Verify URL is publicly accessible
3. Check firewall rules
4. Review application logs
5. Test endpoint manually: `curl -X POST http://your-server/webhook/ghost`

### Platform Not Sending

1. Verify platform is enabled (toggle ON)
2. Check credentials in dashboard
3. Test credentials manually
4. Review notification logs for errors
5. Check platform API status

### Database Connection Failed

1. Verify MySQL is running
2. Check credentials in `.env`
3. Test connection manually
4. Review MySQL logs
5. Check network connectivity (Docker)

### Admin Login Failed

1. Verify admin user exists: `SELECT * FROM users;`
2. Recreate admin: `npm run create-admin`
3. Check session configuration
4. Clear browser cookies
5. Review application logs

## 📚 Documentation

- **[README.md](README.md)** - Complete project documentation
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[MYSQL_SETUP.md](MYSQL_SETUP.md)** - Database configuration
- **[DOCKER.md](DOCKER.md)** - Docker deployment guide

## ✅ Deployment Complete

Once all items checked:

- [ ] Application running stable for 24 hours
- [ ] At least 5 successful webhook tests
- [ ] All platforms sending notifications correctly
- [ ] Admin dashboard accessible and functional
- [ ] Monitoring and alerts configured
- [ ] Team trained on admin dashboard usage
- [ ] Documentation reviewed and updated
- [ ] Backup and recovery tested

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Version:** _____________

**Environment:** Production / Staging / Development

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

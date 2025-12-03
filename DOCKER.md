# 🐳 Docker Deployment Guide

## Quick Start with Docker Compose

### 1. Pull Latest Image

```bash
# Pull the latest pre-built image from GitHub Container Registry
docker pull ghcr.io/xdev-asia-labs/ghost-webhook-handler:latest
```

### 2. Create Environment File

```bash
cp .env.example .env
nano .env
```

Edit the following variables:

```env
# Database
DB_USER=ghost
DB_PASSWORD=your_secure_password
DB_NAME=ghost_webhook

# Application
SESSION_SECRET=your_random_secret_key_here
NODE_ENV=production

# Optional: Platform Credentials
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
```

### 3. Start Services

```bash
# Start all services (uses pre-built image)
docker-compose up -d
```

**To build locally instead:**
```bash
# Edit docker-compose.yml: comment 'image:' line, uncomment 'build: .'
docker-compose up -d --build
```

### 4. Create Admin User

```bash
# Start all services (MySQL + App)
docker-compose up -d

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app
```

### 3. Create Admin User

```bash
# Execute create-admin script inside container
docker-compose exec app npm run create-admin
```

Default credentials:
- **Username:** admin
- **Password:** admin123

⚠️ **Change password immediately after first login!**

### 4. Access Application

- **Admin Dashboard:** http://localhost:3000/admin
- **Webhook Endpoint:** http://localhost:3000/webhook/ghost
- **Health Check:** http://localhost:3000/health

---

## Docker Commands

### Start/Stop Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart services
docker-compose restart

# Restart app only
docker-compose restart app
```

### View Logs

```bash
# All services
docker-compose logs -f

# App only
docker-compose logs -f app

# MySQL only
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Management

```bash
# Access MySQL shell
docker-compose exec mysql mysql -u root -p

# Backup database
docker-compose exec mysql mysqldump -u root -p ghost_webhook > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p ghost_webhook < backup.sql

# View database logs
docker-compose logs mysql
```

### Application Management

```bash
# Execute commands in app container
docker-compose exec app npm run create-admin

# Access app shell
docker-compose exec app sh

# View app environment
docker-compose exec app env

# Rebuild app container
docker-compose up -d --build app
```

---

## Production Deployment

### 1. Using Docker Compose (Recommended)

```bash
# Clone repository
git clone <your-repo>
cd ghost-webhook-handler

# Create .env file
cp .env.example .env
nano .env

# Start services
docker-compose up -d

# Create admin user
docker-compose exec app npm run create-admin

# Check status
docker-compose ps
```

### 2. Using Standalone Docker

```bash
# Build image
docker build -t ghost-webhook-app .

# Create network
docker network create ghost-webhook-network

# Run MySQL
docker run -d \
  --name ghost-webhook-mysql \
  --network ghost-webhook-network \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=ghost_webhook \
  -e MYSQL_USER=ghost \
  -e MYSQL_PASSWORD=ghostpassword \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0

# Run Application
docker run -d \
  --name ghost-webhook-app \
  --network ghost-webhook-network \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=ghost-webhook-mysql \
  -e DB_USER=ghost \
  -e DB_PASSWORD=ghostpassword \
  -e DB_NAME=ghost_webhook \
  -e SESSION_SECRET=your_secret_key \
  ghost-webhook-app

# Create admin user
docker exec -it ghost-webhook-app npm run create-admin
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `mysql` (Docker) or `localhost` |
| `DB_USER` | MySQL user | `ghost` |
| `DB_PASSWORD` | MySQL password | `your_secure_password` |
| `DB_NAME` | Database name | `ghost_webhook` |
| `SESSION_SECRET` | Session encryption key | Random string |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | `123456:ABC...` |
| `TELEGRAM_CHAT_ID` | Telegram chat/channel ID | `@channel` or `123456` |
| `FACEBOOK_PAGE_ID` | Facebook page ID | `123456789` |
| `FACEBOOK_ACCESS_TOKEN` | Facebook access token | `EAAxxxx...` |
| `WEBHOOK_SECRET` | Webhook verification secret | Random string |

---

## Nginx Reverse Proxy

### docker-compose with Nginx

Add to `docker-compose.yml`:

```yaml
  nginx:
    image: nginx:alpine
    container_name: ghost-webhook-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    networks:
      - ghost-webhook-network
```

### nginx.conf example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Container won't start

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs app

# Check container health
docker inspect ghost-webhook-app | grep -A 10 Health
```

### Database connection error

```bash
# Check MySQL is running
docker-compose ps mysql

# Test MySQL connection
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Restart MySQL
docker-compose restart mysql
```

### Application errors

```bash
# View real-time logs
docker-compose logs -f app

# Check environment variables
docker-compose exec app env | grep DB_

# Restart application
docker-compose restart app
```

### Reset everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker rmi ghost-webhook-handler_app

# Start fresh
docker-compose up -d --build
```

---

## Monitoring

### Check container status

```bash
# List all containers
docker-compose ps

# Check resource usage
docker stats

# View health status
docker inspect ghost-webhook-app --format='{{.State.Health.Status}}'
```

### Health checks

```bash
# Application health
curl http://localhost:3000/health

# Inside container
docker-compose exec app wget -qO- http://localhost:3000/health
```

---

## Backup & Restore

### Backup

```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p ghost_webhook > backup_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm \
  -v ghost-webhook-handler_mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql_backup_$(date +%Y%m%d).tar.gz /data
```

### Restore

```bash
# Restore database
docker-compose exec -T mysql mysql -u root -p ghost_webhook < backup_20231203.sql

# Restore volume
docker run --rm \
  -v ghost-webhook-handler_mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_backup_20231203.tar.gz -C /
```

---

## Updates

### Update application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build app

# Or rebuild without cache
docker-compose build --no-cache app
docker-compose up -d app
```

### Update MySQL version

```bash
# Edit docker-compose.yml, change mysql:8.0 to mysql:8.1

# Stop services
docker-compose down

# Start with new version
docker-compose up -d
```

---

## Security Best Practices

1. **Use strong passwords** in `.env`
2. **Never commit `.env`** to Git
3. **Use Docker secrets** for production
4. **Enable HTTPS** with Nginx + Let's Encrypt
5. **Limit container resources** (CPU, memory)
6. **Regular updates** of base images
7. **Scan images** for vulnerabilities

```bash
# Scan image for vulnerabilities
docker scan ghost-webhook-handler_app
```

---

## Support

Need help? Check:
- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- Logs: `docker-compose logs -f`
- Contact: <duy@xdev.asia>

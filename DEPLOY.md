# StreamAX Deployment Guide

Complete deployment guide for StreamAX on VPS with Docker.

## 🎯 Overview

This guide covers deploying StreamAX to a VPS with the following stack:
- **Frontend**: Next.js 14 application
- **Backend**: Supabase (hosted)
- **Streaming**: Docker containers with FFmpeg
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2+ cores
- **Storage**: 50GB+ SSD
- **Network**: Stable internet with good upload speed

### Required Software
- Docker & Docker Compose
- Node.js 18+
- Nginx
- PM2 (for process management)
- Git

## 🚀 Step 1: VPS Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1.3 Install Node.js
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### 1.4 Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 🔧 Step 2: Application Setup

### 2.1 Clone Repository
```bash
cd /var/www
sudo git clone <your-repository-url> streamax
sudo chown -R $USER:$USER /var/www/streamax
cd streamax
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
VITE_WHATSAPP_ADMIN=6281234567890

# Docker Configuration
DOCKER_NETWORK=streamax_network
VIDEOS_PATH=/var/streamax/videos
```

### 2.4 Build Application
```bash
npm run build
```

## 🐳 Step 3: Docker Setup

### 3.1 Create Docker Network
```bash
./scripts/deploy/setup-network.sh
```

### 3.2 Build Streaming Image
```bash
./scripts/deploy/build-image.sh
```

### 3.3 Create Videos Directory
```bash
sudo mkdir -p /var/streamax/videos
sudo chown -R $USER:$USER /var/streamax
```

## 🌐 Step 4: Nginx Configuration

### 4.1 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/streamax
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (add your SSL certificates)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # File upload size
    client_max_body_size 2G;
}
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/streamax /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Step 5: SSL Certificate

### 5.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🚀 Step 6: Process Management

### 6.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'streamax',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/streamax',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/streamax/error.log',
      out_file: '/var/log/streamax/out.log',
      log_file: '/var/log/streamax/combined.log',
      time: true
    }
  ]
};
```

### 6.2 Create Log Directory
```bash
sudo mkdir -p /var/log/streamax
sudo chown -R $USER:$USER /var/log/streamax
```

### 6.3 Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📊 Step 7: Monitoring Setup

### 7.1 Install Monitoring Tools
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Install Docker stats monitoring
sudo npm install -g ctop
```

### 7.2 Create Monitoring Script
```bash
nano /var/www/streamax/monitor-system.sh
```

```bash
#!/bin/bash
# System monitoring script for StreamAX

echo "=== StreamAX System Status ==="
echo "Date: $(date)"
echo ""

echo "=== System Resources ==="
free -h
echo ""
df -h
echo ""

echo "=== Docker Containers ==="
docker ps --filter "name=streamax-*" --format "table {{.Names}}\t{{.Status}}\t{{.RunningFor}}"
echo ""

echo "=== PM2 Processes ==="
pm2 list
echo ""

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l
echo ""

echo "=== Recent Logs ==="
tail -n 10 /var/log/streamax/error.log
```

```bash
chmod +x /var/www/streamax/monitor-system.sh
```

### 7.3 Setup Cron Jobs
```bash
crontab -e
```

Add these lines:
```bash
# Clean up old containers every hour
0 * * * * /var/www/streamax/scripts/cleanup-containers.sh

# System monitoring every 5 minutes
*/5 * * * * /var/www/streamax/monitor-system.sh >> /var/log/streamax/system-monitor.log

# Backup database daily at 2 AM
0 2 * * * /var/www/streamax/scripts/backup-scheduler.js
```

## 🔄 Step 8: Backup Strategy

### 8.1 Create Backup Script
```bash
nano /var/www/streamax/backup.sh
```

```bash
#!/bin/bash
# Backup script for StreamAX

BACKUP_DIR="/var/backups/streamax"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/streamax_app_$DATE.tar.gz /var/www/streamax --exclude=node_modules --exclude=.next

# Backup videos (if needed)
tar -czf $BACKUP_DIR/streamax_videos_$DATE.tar.gz /var/streamax/videos

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /var/www/streamax/backup.sh
```

## 🔧 Step 9: Maintenance

### 9.1 Update Application
```bash
cd /var/www/streamax
git pull origin main
npm install
npm run build
pm2 restart streamax
```

### 9.2 Monitor Logs
```bash
# Application logs
pm2 logs streamax

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### 9.3 Container Management
```bash
# List all StreamAX containers
docker ps --filter "name=streamax-*"

# Clean up stopped containers
docker container prune -f

# Monitor container resources
docker stats
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Docker permission denied**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Nginx configuration test failed**
   ```bash
   sudo nginx -t
   # Fix configuration errors and retry
   ```

4. **SSL certificate renewal**
   ```bash
   sudo certbot renew --dry-run
   sudo certbot renew
   ```

### Performance Optimization

1. **Increase file upload limits**
   ```bash
   # In nginx.conf
   client_max_body_size 2G;
   
   # In php.ini (if using PHP)
   upload_max_filesize = 2G
   post_max_size = 2G
   ```

2. **Optimize Docker resources**
   ```bash
   # Limit container resources
   docker run --memory="1g" --cpus="1.0" ...
   ```

3. **Enable caching**
   ```nginx
   # In nginx config
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## 📞 Support

If you encounter issues during deployment:
- Check logs: `pm2 logs streamax`
- Monitor system: `./monitor-system.sh`
- Contact support: support@streamax.com

---

**StreamAX Deployment Guide** - Production-ready deployment for VPS
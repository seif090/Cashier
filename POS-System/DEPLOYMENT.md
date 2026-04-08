# Deployment Guide - Architect POS

## دليل النشر الكامل

هذا الدليل يشرح كيفية نشر نظام Architect POS على بيئة الإنتاج (Production).

---

## الجزء الأول: نشر Backend API على VPS

### المتطلبات:
- VPS يعمل بـ Ubuntu 22.04 LTS
- 2GB RAM على الأقل
- 20GB مساحة تخزين
- وصول SSH

### الخطوة 1: الاتصال بالـ VPS

```bash
ssh root@your-vps-ip
```

### الخطوة 2: تثبيت .NET 8.0 Runtime

```bash
# تحديث النظام
apt-get update && apt-get upgrade -y

# تثبيت المتطلبات
apt-get install -y wget apt-transport-https

# إضافة Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# تثبيت .NET 8.0 Runtime
apt-get update && apt-get install -y dotnet-runtime-8.0

# التحقق من التثبيت
dotnet --list-runtimes
```

### الخطوة 3: تثبيت Nginx

```bash
apt-get install -y nginx

# بدء وتشغيل Nginx
systemctl start nginx
systemctl enable nginx

# التحقق من الحالة
systemctl status nginx
```

### الخطوة 4: رفع التطبيق

```bash
# إنشاء مجلد للتطبيق
mkdir -p /var/www/architectpos-api
cd /var/www/architectpos-api

# من جهازك المحلي، انسخ الملفات
# (يمكن استخدام SCP أو FTP)
scp -r Backend/ArchitectPOS.API/publish/* root@your-vps-ip:/var/www/architectpos-api/
```

### الخطوة 5: إعداد التطبيق

```bash
# إنشاء ملف appsettings.Production.json
nano /var/www/architectpos-api/appsettings.Production.json
```

**محتوى appsettings.Production.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ArchitectPOS;User Id=sa;Password=YourStrongPassword@123;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "YourProductionSuperSecretKeyThatIsVeryLongAndSecure!@#$%^&*()",
    "Issuer": "ArchitectPOS",
    "Audience": "ArchitectPOSClient",
    "ExpirationInMinutes": 480
  },
  "Cors": {
    "AllowedOrigins": [
      "https://your-domain.com",
      "https://www.your-domain.com"
    ]
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Warning",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

### الخطوة 6: إنشاء systemd Service

```bash
nano /etc/systemd/system/architectpos.service
```

**محتوى الملف:**
```ini
[Unit]
Description=Architect POS API
After=network.target

[Service]
Type=notify
WorkingDirectory=/var/www/architectpos-api
ExecStart=/usr/bin/dotnet /var/www/architectpos-api/ArchitectPOS.API.dll
Restart=always
RestartSec=10
SyslogIdentifier=architectpos
User=www-data
Group=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

### الخطوة 7: تفعيل وتشغيل الخدمة

```bash
# إعادة تحميل systemd
systemctl daemon-reload

# تفعيل الخدمة
systemctl enable architectpos

# بدء الخدمة
systemctl start architectpos

# التحقق من الحالة
systemctl status architectpos

# عرض السجلات
journalctl -u architectpos -f
```

### الخطوة 8: إعداد Nginx كـ Reverse Proxy

```bash
nano /etc/nginx/sites-available/architectpos
```

**محتوى الملف:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Logging
    access_log /var/log/nginx/architectpos-access.log;
    error_log /var/log/nginx/architectpos-error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Block access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### الخطوة 9: تفعيل الموقع

```bash
# إنشاء symlink
ln -s /etc/nginx/sites-available/architectpos /etc/nginx/sites-enabled/

# إزالة الموقع الافتراضي
rm /etc/nginx/sites-enabled/default

# اختبار تكوين Nginx
nginx -t

# إعادة تشغيل Nginx
systemctl restart nginx
```

### الخطوة 10: إعداد SSL مع Let's Encrypt

```bash
# تثبيت Certbot
apt-get install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
certbot --nginx -d your-domain.com -d www.your-domain.com

# التحقق من التجديد التلقائي
certbot renew --dry-run
```

---

## الجزء الثاني: تثبيت وإعداد SQL Server

### الخطوة 1: تثبيت SQL Server على Ubuntu

```bash
# استيراد GPG key
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | tee /etc/apt/trusted.gpg.d/microsoft.asc

# إضافة repository
add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/22.04/mssql-server-2022.list)"

# تثبيت SQL Server
apt-get update && apt-get install -y mssql-server

# تشغيل الإعداد
/opt/mssql/bin/mssql-conf setup
```

**اختر الخيار 2 (Developer edition) وأدخل كلمة مرور قوية لـ SA.**

### الخطوة 2: تثبيت SQL Server Command-Line Tools

```bash
# إضافة repository
curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list | tee /etc/apt/sources.list.d/msprod.list

# تثبيت الأدوات
apt-get update && apt-get install -y mssql-tools unixodbc-dev

# إضافة المسار
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
source ~/.bashrc
```

### الخطوة 3: إنشاء قاعدة البيانات

```bash
# الاتصال بـ SQL Server
sqlcmd -S localhost -U sa -P 'YourStrongPassword@123'
```

```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE ArchitectPOS;
GO

USE ArchitectPOS;
GO

-- تشغيل سكريبت قاعدة البيانات
-- (يمكنك نسخ ولصق محتوى Database/001_CreateDatabase.sql)
```

### الخطوة 4: إعداد Firewall

```bash
# السماح بـ SQL Server
ufw allow 1433/tcp
ufw enable
```

---

## الجزء الثالث: نشر Frontend (Angular)

### الخيار أ: النشر على Vercel

```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# بناء التطبيق
cd Frontend
npm run build

# النشر
vercel --prod
```

### الخيار ب: النشر على Netlify

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
netlify deploy --prod --dir=dist/architect-pos/browser
```

### الخيار ج: النشر على نفس الـ VPS

```bash
# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# تثبيت Nginx configuration للـ Frontend
nano /etc/nginx/sites-available/architectpos-frontend
```

**محتوى الملف:**
```nginx
server {
    listen 80;
    server_name app.your-domain.com;
    root /var/www/architectpos-frontend;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_vary on;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

```bash
# رفع ملفات الـ Build
mkdir -p /var/www/architectpos-frontend
# من جهازك المحلي:
scp -r Frontend/dist/architect-pos/browser/* root@your-vps-ip:/var/www/architectpos-frontend/

# تفعيل الموقع
ln -s /etc/nginx/sites-available/architectpos-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL
certbot --nginx -d app.your-domain.com
```

---

## الجزء الرابع: التحديث والصيانة

### تحديث Backend

```bash
# من جهازك المحلي
dotnet publish -c Release -o ./publish

# رفع الملفات
scp -r ./publish/* root@your-vps-ip:/var/www/architectpos-api/

# إعادة تشغيل الخدمة
ssh root@your-vps-ip "systemctl restart architectpos"
```

### تحديث Frontend

```bash
# بناء ونشر
cd Frontend
npm run build
scp -r dist/architect-pos/browser/* root@your-vps-ip:/var/www/architectpos-frontend/
```

### Backup قاعدة البيانات

```bash
# إنشاء script للنسخ الاحتياطي
nano /usr/local/bin/backup-architectpos.sh
```

**محتوى script:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/architectpos"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/architectpos_$DATE.bak"

mkdir -p $BACKUP_DIR

sqlcmd -S localhost -U sa -P 'YourStrongPassword@123' -Q "BACKUP DATABASE ArchitectPOS TO DISK = '$BACKUP_FILE' WITH COMPRESSION, STATS = 10"

# حذف النسخ القديمة (أقدم من 30 يوم)
find $BACKUP_DIR -name "architectpos_*.bak" -mtime +30 -delete
```

```bash
# جعل script قابل للتنفيذ
chmod +x /usr/local/bin/backup-architectpos.sh

# إضافة cron job
crontab -e

# إضافة السطر التالي (نسخ احتياطي يومي الساعة 2 صباحاً)
0 2 * * * /usr/local/bin/backup-architectpos.sh
```

### Monitoring

```bash
# عرض حالة الخدمة
systemctl status architectpos
systemctl status nginx
systemctl status mssql-server

# عرض السجلات
journalctl -u architectpos -n 100
tail -f /var/log/nginx/architectpos-access.log
tail -f /var/log/nginx/architectpos-error.log
```

---

## الجزء الخامس: الأمان

### 1. إعداد Firewall

```bash
# السماح بالمرور الضروري فقط
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 1433/tcp   # SQL Server (داخلي فقط)
ufw enable
```

### 2. تعطيل تسجيل دخول Root عبر SSH

```bash
nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
systemctl restart sshd
```

### 3. إعداد Fail2Ban

```bash
apt-get install -y fail2ban

# إنشاء configuration
nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

```bash
systemctl enable fail2ban
systemctl start fail2ban
```

---

## Checklist قبل النشر

- [ ] تغيير جميع كلمات المرور الافتراضية
- [ ] تحديث JWT Secret Key
- [ ] تعطيل Swagger في الإنتاج
- [ ] إعداد HTTPS/SSL
- [ ] إعداد Backup تلقائي
- [ ] اختبار جميع الوظائف
- [ ] مراجعة Security Headers
- [ ] إعداد Monitoring/Logging
- [ ] اختبار Performance
- [ ] إعداد CORS بشكل صحيح
- [ ] تعطيل Debug Mode

---

## Test Production Environment

```bash
# اختبار API
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourNewPassword"}'

# اختبار Frontend
curl -I https://app.your-domain.com

# فحص SSL
openssl s_client -connect your-domain.com:443
```

---

## الدعم والمشاكل الشائعة

### المشكلة: الخدمة لا تعمل

```bash
# التحقق من السجلات
journalctl -u architectpos -n 100

# التحقق من المنفذ
netstat -tlnp | grep 5000

# إعادة التشغيل
systemctl restart architectpos
```

### المشكلة: Nginx لا يعمل

```bash
# اختبار التكوين
nginx -t

# عرض السجلات
tail -f /var/log/nginx/error.log

# إعادة التشغيل
systemctl restart nginx
```

---

**تم بحمد الله! 🎉**

نظام Architect POS الآن جاهز للعمل على بيئة الإنتاج.

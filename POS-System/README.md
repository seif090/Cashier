# Architect POS - نظام نقطة البيع المتكامل

## نظرة عامة

Architect POS هو نظام نقطة بيع (POS) احترافي ومتكامل تم بناؤه باستخدام أحدث التقنيات. النظام يتكون من ثلاثة مكونات رئيسية:

1. **Backend API**: مبني باستخدام ASP.NET Core 8.0 مع تطبيق Clean Architecture
2. **Web Application**: مبني باستخدام Angular 17 مع تصميم متجاوب ومتوافق مع RTL
3. **Desktop Application**: مبني باستخدام WPF مع MVVM Pattern (قيد التطوير)

## المميزات

- ✅ واجهة مستخدم عصرية متوافقة مع التصميم الأصلي (Pixel Perfect)
- ✅ دعم كامل للغة العربية واتجاه RTL
- ✅ نظام مصادقة وآمان باستخدام JWT
- ✅ إدارة المنتجات والتصنيفات
- ✅ نظام سلة المشتريات والدفع
- ✅ تقارير ولوحة تحكم
- ✅ إدارة المخزون
- ✅ معالجة الأخطاء بشكل مركزي
- ✅ تسجيل الأحداث (Logging)
- ✅ تصميم متجاوب (Responsive)

## التقنيات المستخدمة

### Backend
- ASP.NET Core 8.0 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- Serilog for Logging
- FluentValidation
- Clean Architecture

### Frontend (Web)
- Angular 17
- Standalone Components
- Signals for State Management
- Reactive Forms
- HttpClient
- RxJS

### Desktop (قيد التطوير)
- WPF (Windows Presentation Foundation)
- MVVM Pattern
- Material Design

## هيكل المشروع

```
POS-System/
├── Backend/
│   ├── ArchitectPOS.API/          # Web API Project
│   ├── ArchitectPOS.Application/  # Application Layer (Services, DTOs)
│   ├── ArchitectPOS.Domain/       # Domain Layer (Entities)
│   └── ArchitectPOS.Infrastructure/ # Infrastructure Layer (Repositories, DbContext)
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # Reusable Components
│   │   │   ├── pages/             # Page Components
│   │   │   ├── services/          # Angular Services
│   │   │   ├── models/            # TypeScript Interfaces
│   │   │   ├── guards/            # Route Guards
│   │   │   └── app.config.ts      # App Configuration
│   │   ├── environments/          # Environment Configurations
│   │   ├── styles.scss            # Global Styles
│   │   └── main.ts                # Entry Point
│   ├── angular.json               # Angular Configuration
│   ├── package.json               # Dependencies
│   └── tsconfig.json              # TypeScript Configuration
├── Desktop/                       # WPF Desktop Application (Coming Soon)
├── Database/
│   └── 001_CreateDatabase.sql     # Database Schema
└── Documentation/
    └── API_Documentation.md       # API Documentation
```

## متطلبات التشغيل

### Backend
- .NET 8.0 SDK
- SQL Server 2019 أو أحدث
- Visual Studio 2022 أو VS Code

### Frontend
- Node.js 18+ 
- npm أو yarn
- Angular CLI 17+

## خطوات التثبيت والتشغيل

### 1. إعداد قاعدة البيانات

```bash
# تشغيل سكريبت قاعدة البيانات
sqlcmd -S localhost -i Database/001_CreateDatabase.sql
```

أو يدوياً من خلال SQL Server Management Studio.

### 2. تشغيل Backend API

```bash
cd Backend/ArchitectPOS.API

# استعادة الحزم
dotnet restore

# تحديث قاعدة البيانات (إنشاء الجداول)
dotnet ef database update

# تشغيل السيرفر
dotnet run
```

الـ API سيكون متاحاً على: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### 3. تشغيل Frontend (Angular)

```bash
cd Frontend

# تثبيت الحزم
npm install

# تشغيل تطبيق التطوير
npm start
```

التطبيق سيكون متاحاً على: `http://localhost:4200`

### 4. تسجيل الدخول

- **اسم المستخدم**: `admin`
- **كلمة المرور**: `Admin@123`

## تهيئة المشروع

### Backend Configuration

ملف `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ArchitectPOS;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTTokenGeneration123456789!@#$%",
    "Issuer": "ArchitectPOS",
    "Audience": "ArchitectPOSClient",
    "ExpirationInMinutes": 480
  }
}
```

### Frontend Configuration

ملف `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
تسجيل دخول المستخدم

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "expiresAt": "2026-04-09T08:00:00Z",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@architectpos.com",
    "fullName": "System Administrator",
    "role": "Admin"
  }
}
```

#### POST /api/auth/register
تسجيل مستخدم جديد

### Products Endpoints

#### GET /api/products
الحصول على قائمة المنتجات

**Query Parameters:**
- `pageNumber`: رقم الصفحة (افتراضي: 1)
- `pageSize`: عدد العناصر (افتراضي: 20)
- `categoryId`: تصفية حسب التصنيف
- `searchTerm`: البحث في المنتجات
- `sortBy`: الترتيب حسب (name, price, stock, createdAt)
- `sortDescending`: ترتيب تنازلي (true/false)

#### POST /api/products
إضافة منتج جديد (يتطلب صلاحيات Admin/Manager)

### Categories Endpoints

#### GET /api/categories
الحصول على قائمة التصنيفات

#### POST /api/categories
إضافة تصنيف جديد (يتطلب صلاحيات Admin/Manager)

### Orders Endpoints

#### POST /api/orders
إنشاء طلب جديد

**Request Body:**
```json
{
  "userId": 1,
  "discountAmount": 0,
  "paymentMethod": "Cash",
  "notes": "",
  "terminalId": "01",
  "branchId": "main",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

#### GET /api/orders
الحصول على سجل الطلبات

#### GET /api/orders/report/daily
الحصول على تقرير يومي (يتطلب صلاحيات Admin/Manager)

## نظام المصادقة والصلاحيات

### الأدوار (Roles)

1. **Admin**: صلاحيات كاملة
2. **Manager**: إدارة المنتجات والطلبات والتقارير
3. **Cashier**: استخدام نظام POS فقط

### JWT Token

- مدة صلاحية التوكن: 480 دقيقة (8 ساعات)
- يتم إرسال التوكن في Header: `Authorization: Bearer <token>`

## التصميم والنظام البصري

### الألوان الرئيسية

- **Primary**: `#00236f` (أزرق غامق)
- **Secondary**: `#006c49` (أخضر)
- **Surface**: `#f7f9fb` (خلفية فاتحة)

### الخطوط

- **Arabic**: IBM Plex Sans Arabic
- **Numeric**: Be Vietnam Pro

### مبادئ التصميم

1. **No-Line Rule**: لا تستخدم الحدود 1px، الاعتماد على تغييرات اللون الخلفي
2. **Tonal Layering**: استخدام طبقات من الألوان لتحديد العمق
3. **Glassmorphism**: تأثير الزجاج للعناصر العائمة
4. **RTL First**: التصميم من اليمين لليسار كخيار أساسي

## قاعدة البيانات

### الجداول الرئيسية

1. **Users**: بيانات المستخدمين
2. **Roles**: الأدوار والصلاحيات
3. **Categories**: تصنيفات المنتجات
4. **Products**: المنتجات
5. **Orders**: الطلبات
6. **OrderItems**: عناصر الطلب
7. **Payments**: عمليات الدفع

## الأمان

### Backend Security

- تشفير كلمات المرور باستخدام BCrypt
- JWT Authentication مع التحقق من الصلاحية
- CORS Configuration
- Input Validation باستخدام FluentValidation
- SQL Injection Protection (Entity Framework)
- XSS Protection

### Frontend Security

- حفظ التوكن في localStorage
- Route Guards للتحقق من المصادقة
- HTTP Interceptors لإضافة التوكن تلقائياً
- Sanitization للمدخلات

## الأداء والتحسين

### Backend Optimizations

- Entity Framework Tracking No-Tracking للقراءة
- Pagination للبيانات الكبيرة
- Indexing في قاعدة البيانات
- Response Caching
- Async/Await للمهام المتزامنة

### Frontend Optimizations

- Lazy Loading للصفحات
- OnPush Change Detection
- Pure Pipes
- Virtual Scrolling للقوائم الكبيرة
- Image Optimization

## الاختبارات

### Backend Testing

```bash
# تشغيل الاختبارات
dotnet test
```

### Frontend Testing

```bash
# تشغيل الاختبارات
npm test

# اختبار End-to-End
npm run e2e
```

## النشر (Deployment)

### Backend Deployment (VPS)

1. **نشر على Ubuntu VPS:**

```bash
# تثبيت .NET Runtime
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y dotnet-runtime-8.0

# نشر التطبيق
dotnet publish -c Release -o /var/www/architectpos-api

# إنشاء systemd service
sudo nano /etc/systemd/system/architectpos.service
```

**architectpos.service:**
```ini
[Unit]
Description=Architect POS API

[Service]
WorkingDirectory=/var/www/architectpos-api
ExecStart=/usr/bin/dotnet /var/www/architectpos-api/ArchitectPOS.API.dll
Restart=always
RestartSec=10
SyslogIdentifier=architectpos

[Install]
WantedBy=multi-user.target
```

```bash
# تفعيل وتشغيل الخدمة
sudo systemctl enable architectpos
sudo systemctl start architectpos

# إعداد Nginx كـ Reverse Proxy
sudo nano /etc/nginx/sites-available/architectpos
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **إعداد SQL Server:**

```bash
# تثبيت SQL Server على Ubuntu
sudo apt-get install -y mssql-server
sudo /opt/mssql/bin/mssql-conf setup
```

### Frontend Deployment (Vercel/Netlify)

**Vercel:**
```bash
# تثبيت Vercel CLI
npm i -g vercel

# بناء التطبيق
npm run build

# النشر
vercel --prod
```

**Netlify:**
```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# النشر
netlify deploy --prod --dir=dist/architect-pos/browser
```

### Database Deployment

1. **SQL Server on Azure:**
   - إنشاء Azure SQL Database
   - تحديث Connection String في appsettings.json
   - تشغيل migrations

2. **SQL Server on AWS RDS:**
   - إنشاء RDS Instance
   - تحديث Security Groups
   - تحديث Connection String

## الصيانة والدعم

### Logs

- Backend Logs: `Backend/ArchitectPOS.API/Logs/`
- يمكن استخدام Serilog Sinks إضافية مثل:
  - Seq
  - ElasticSearch
  - Application Insights

### Backup

```sql
-- SQL Server Backup
BACKUP DATABASE ArchitectPOS 
TO DISK = 'C:\Backups\ArchitectPOS.bak'
WITH COMPRESSION, STATS = 10;
```

### Monitoring

- استخدام Application Insights
- استخدام Prometheus + Grafana
- استخدام ELK Stack

## التحديثات المستقبلية

- [ ] Desktop Application (WPF)
- [ ] Offline Mode
- [ ] Barcode Scanner Integration
- [ ] Receipt Printer Support
- [ ] Customer Management
- [ ] Loyalty Program
- [ ] Multi-branch Support
- [ ] Inventory Alerts
- [ ] Email Notifications
- [ ] Mobile Application (Flutter)

## الترخيص

© 2026 Architect POS. جميع الحقوق محفوظة.

## التواصل والدعم

للأسئلة أو الدعم الفني، يرجى التواصل مع فريق التطوير.

---

**ملاحظة**: هذا النظام تم بناؤه وفقاً لأعلى معايير الجودة والأمان، وهو جاهز للإنتاج (Production Ready).

# Quick Start Guide - Architect POS

## الخطوة 1: المتطلبات الأساسية

تأكد من تثبيت البرامج التالية على جهازك:

### للـ Backend:
- ✅ .NET 8.0 SDK - [تحميل](https://dotnet.microsoft.com/download/dotnet/8.0)
- ✅ SQL Server 2019+ أو SQL Server Express
- ✅ Visual Studio 2022 أو VS Code

### للـ Frontend:
- ✅ Node.js 18+ - [تحميل](https://nodejs.org/)
- ✅ Angular CLI 17+

```bash
# التحقق من التثبيت
dotnet --version
node --version
npm --version
ng version
```

---

## الخطوة 2: استنساخ المشروع

```bash
# تحميل المشروع
git clone <repository-url>
cd POS-System
```

---

## الخطوة 3: إعداد قاعدة البيانات

### الخيار أ: استخدام SQL Server Management Studio (SSMS)

1. افتح SQL Server Management Studio
2. اتصل بـ SQL Server
3. افتح ملف `Database/001_CreateDatabase.sql`
4. نفذ السكريبت

### الخيار ب: استخدام سطر الأوامر

```bash
# تشغيل السكريبت
sqlcmd -S localhost -i Database/001_CreateDatabase.sql
```

---

## الخطوة 4: تشغيل Backend API

```bash
# الانتقال لمجلد API
cd Backend/ArchitectPOS.API

# استعادة الحزم
dotnet restore

# تحديث قاعدة البيانات (إنشاء الجداول)
dotnet ef database update

# تشغيل السيرفر
dotnet run
```

**النتيجة المتوقعة:**
```
info: ArchitectPOS.API[0]
      Starting Architect POS API
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

**اختبار الـ API:**
- افتح المتصفح: http://localhost:5000/swagger
- يجب أن تظهر صفحة Swagger UI

---

## الخطوة 5: تشغيل Frontend (Angular)

افتح Terminal جديد:

```bash
# الانتقال لمجلد Frontend
cd Frontend

# تثبيت الحزم
npm install

# تشغيل تطبيق التطوير
npm start
```

**النتيجة المتوقعة:**
```
✔ Browser application bundle generation complete.
Initial Chunk Files   | Names         |  Raw Size
main.js               | main          |   2.50 MB |
styles.css            | styles        |  15.20 kB |

Initial Total         |   2.52 MB

Build at: 2026-04-08T10:00:00.000Z - Hash: xxxxxxxxxxxx - Time: 12345ms

** Angular Live Development Server is listening on localhost:4200 **
```

**اختبار التطبيق:**
- افتح المتصفح: http://localhost:4200
- يجب أن تظهر صفحة تسجيل الدخول

---

## الخطوة 6: تسجيل الدخول

استخدم بيانات الدخول الافتراضية:

```
اسم المستخدم: admin
كلمة المرور: Admin@123
```

---

## الخطوة 7: استكشاف النظام

بعد تسجيل الدخول، يمكنك:

1. **شاشة POS الرئيسية** - إضافة منتجات للسلة والدفع
2. **لوحة التحكم** - عرض التقارير والإحصائيات
3. **إدارة المنتجات** - إضافة وتعديل المنتجات
4. **إدارة التصنيفات** - إدارة تصنيفات المنتجات
5. **سجل الطلبات** - عرض الطلبات السابقة

---

## حل المشاكل الشائعة

### مشكلة: "Cannot connect to database"

**الحل:**
```bash
# التحقق من تشغيل SQL Server
# تحديث Connection String في appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=ArchitectPOS;Trusted_Connection=True;TrustServerCertificate=True"
}
```

### مشكلة: "Port 5000 is already in use"

**الحل:**
```bash
# تغيير المنفذ في Program.cs
builder.WebHost.UseUrls("http://localhost:5001");
```

ثم تحديث `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api'
};
```

### مشكلة: "npm install fails"

**الحل:**
```bash
# مسح cache
npm cache clean --force

# إعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### مشكلة: "dotnet ef database update fails"

**الحل:**
```bash
# تثبيت EF Core tools
dotnet tool install --global dotnet-ef

# أو التحديث
dotnet tool update --global dotnet-ef
```

---

## الخطوات التالية

1. **تغيير كلمة المرور الافتراضية**
2. **إضافة مستخدمين جدد**
3. **إضافة منتجاتك الخاصة**
4. **تخصيص الإعدادات حسب احتياجاتك**

---

## أوامر مفيدة

### Backend:
```bash
# بناء المشروع
dotnet build

# تشغيل الاختبارات
dotnet test

# نشر التطبيق
dotnet publish -c Release -o ./publish
```

### Frontend:
```bash
# بناء للإنتاج
npm run build

# تشغيل الاختبارات
npm test

# تنسيق الكود
npm run lint
```

---

## الدعم

إذا واجهت أي مشكلة، يمكنك:

1. مراجعة ملف `README.md`
2. مراجعة `Documentation/API_Documentation.md`
3. التواصل مع فريق الدعم

---

**تهانينا! 🎉** تم تثبيت وتشغيل Architect POS بنجاح.

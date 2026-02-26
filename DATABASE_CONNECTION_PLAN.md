# แผนการเชื่อมต่อฐานข้อมูลบน Server (10.2.0.5)

## 📋 ข้อมูลการเชื่อมต่อ

### ฐานข้อมูล Remote Server
- **Host:** 10.2.0.5
- **Port:** 3306
- **Database:** u486700931_icp
- **Username:** u486700931_root
- **Password:** REDACTED_PASSWORD
- **Charset:** utf8mb4

### ฐานข้อมูล Localhost (สำหรับ Development)
- **Host:** localhost
- **Port:** 3306
- **Database:** u486700931_icp
- **Username:** u486700931_root
- **Password:** REDACTED_PASSWORD

---

## 🔧 การปรับแต่ง Backend API

### 1. แก้ไขไฟล์ PHP API ทั้งหมด

ปรับเปลี่ยนการเชื่อมต่อฐานข้อมูลในไฟล์ PHP ทั้งหมดที่อยู่ใน `c:\xampp\htdocs\icp2022\`

**ไฟล์ที่ต้องแก้ไข:**
- `icp_v1_sub_admin/institute/api-institute.php`
- `icp_v1_sub_admin/faculty/api-individual.php`
- `icp_v1_sub_admin/degree/api-individual.php`
- `icp_v1_sub_admin/department/api-individual.php`
- และไฟล์ API อื่นๆ ทั้งหมด

**การแก้ไข:**

```php
// เดิม (localhost)
$servername = "localhost";
$username = "u486700931_root";
$password = "REDACTED_PASSWORD";
$database = "u486700931_icp";

// แก้เป็น (remote server)
$servername = "10.2.0.5";
$username = "u486700931_root";
$password = "REDACTED_PASSWORD";
$database = "u486700931_icp";
```

### 2. สร้างไฟล์ Config กลาง (แนะนำ)

สร้างไฟล์ `c:\xampp\htdocs\icp2022\config\database.php`:

```php
<?php
// Database Configuration
define('DB_HOST', '10.2.0.5');
define('DB_PORT', '3306');
define('DB_NAME', 'u486700931_icp');
define('DB_USER', 'u486700931_root');
define('DB_PASS', 'REDACTED_PASSWORD');
define('DB_CHARSET', 'utf8mb4');

// Environment (development/production)
define('ENVIRONMENT', 'production'); // เปลี่ยนเป็น 'development' สำหรับ localhost

// Auto-select host based on environment
if (ENVIRONMENT === 'development') {
    define('DB_HOST_ACTIVE', 'localhost');
} else {
    define('DB_HOST_ACTIVE', DB_HOST);
}

// PDO Connection Helper
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST_ACTIVE . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>
```

**จากนั้นในไฟล์ API ต่างๆ ให้ใช้:**

```php
<?php
require_once __DIR__ . '/../../config/database.php';

$connect = getDBConnection();
// ... ส่วนที่เหลือของ code
?>
```

---

## 🔄 การ Sync ข้อมูล

### สคริปต์สำหรับ Sync ข้อมูล

**ไฟล์:** `d:\Project-icp\icp-project-app\sync_db.bat`

```batch
@echo off
echo ========================================
echo Database Synchronization Tool
echo ========================================
echo.
echo Exporting from Localhost...
"c:\xampp\mysql\bin\mysqldump.exe" --host=localhost --user=u486700931_root --password="REDACTED_PASSWORD" --single-transaction --routines --triggers --hex-blob --default-character-set=utf8mb4 u486700931_icp > "d:\Project-icp\icp-project-app\local_database_dump.sql"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Export failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] Export complete!
echo.
echo Importing to Remote Server via PHP...
c:\xampp\php\php.exe "d:\Project-icp\icp-project-app\import_to_remote.php"

echo.
echo ========================================
echo Synchronization Complete!
echo ========================================
pause
```

### สคริปต์ PHP สำหรับ Import

**ไฟล์:** `d:\Project-icp\icp-project-app\import_to_remote.php` (มีอยู่แล้ว)

---

## 📊 การตรวจสอบความถูกต้อง

### สคริปต์เปรียบเทียบฐานข้อมูล

**ไฟล์:** `d:\Project-icp\icp-project-app\compare_databases.php` (มีอยู่แล้ว)

**วิธีใช้:**
```bash
c:\xampp\php\php.exe compare_databases.php
```

---

## 🚀 ขั้นตอนการ Deploy

### 1. Development (ใช้ Localhost)
```
1. เปิด XAMPP → Start Apache & MySQL
2. ตั้งค่า ENVIRONMENT = 'development' ใน config/database.php
3. รัน npm run dev:all
4. เข้าใช้งานที่ http://localhost:9000
```

### 2. Production (ใช้ Remote Server)
```
1. Sync ฐานข้อมูล: รัน sync_db.bat
2. ตั้งค่า ENVIRONMENT = 'production' ใน config/database.php
3. Deploy โค้ด PHP ไปยัง Production Server
4. ตรวจสอบการเชื่อมต่อ: รัน test_connections.php
```

---

## ⚠️ ข้อควรระวัง

### Security
- ❌ **ห้าม** commit password ลง Git
- ✅ ใช้ Environment Variables หรือ .env file
- ✅ ใช้ .gitignore สำหรับไฟล์ config

### Performance
- ✅ ใช้ Connection Pooling
- ✅ ปิด Connection หลังใช้งาน
- ✅ ใช้ Prepared Statements

### Backup
- ✅ Backup ฐานข้อมูลก่อน Sync ทุกครั้ง
- ✅ เก็บ Backup ไว้อย่างน้อย 7 วัน

---

## 📝 Checklist การเปลี่ยนไปใช้ Remote Server

- [ ] Backup ฐานข้อมูล Localhost
- [ ] Sync ข้อมูลไปยัง Remote Server (10.2.0.5)
- [ ] สร้างไฟล์ config/database.php
- [ ] แก้ไขไฟล์ API ทั้งหมดให้ใช้ config กลาง
- [ ] ทดสอบการเชื่อมต่อด้วย test_connections.php
- [ ] ทดสอบ API ทุกตัวว่าทำงานได้ปกติ
- [ ] ตรวจสอบข้อมูลด้วย compare_databases.php
- [ ] อัปเดต apiConfig.js ให้ชี้ไปที่ Server ที่ถูกต้อง
- [ ] ทดสอบ Frontend ว่าเรียก API ได้
- [ ] Deploy ไปยัง Production

---

## 🔗 ไฟล์ที่เกี่ยวข้อง

1. **Backend Configuration:**
   - `c:\xampp\htdocs\icp2022\config\database.php` (ต้องสร้างใหม่)
   - `c:\xampp\htdocs\icp2022\icp_v1_sub_admin\**\*.php` (แก้ไข)

2. **Frontend Configuration:**
   - `d:\Project-icp\icp-project-app\src\utils\apiConfig.js`
   - `d:\Project-icp\icp-project-app\backend\server.js`

3. **Database Tools:**
   - `d:\Project-icp\icp-project-app\sync_db.bat`
   - `d:\Project-icp\icp-project-app\import_to_remote.php`
   - `d:\Project-icp\icp-project-app\compare_databases.php`
   - `d:\Project-icp\icp-project-app\test_connections.php`

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ Connection ด้วย `test_connections.php`
2. ตรวจสอบ Error Log ใน PHP
3. ตรวจสอบ Network connectivity: `Test-NetConnection -ComputerName 10.2.0.5 -Port 3306`
4. ตรวจสอบ Firewall settings

---

**สร้างเมื่อ:** 2026-02-17  
**อัปเดตล่าสุด:** 2026-02-17



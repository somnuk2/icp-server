# แผนการ Deploy ระบบ Backend - ICP Project

**วันที่:** 24 กุมภาพันธ์ 2569
**Server เป้าหมาย:** 10.2.0.6 (Port 22)
**User:** sif-vm1
**Password:** `REDACTED_SSH_PASSWORD`

## 🎯 การยืนยันสถานะระบบ (Migration Complete)
ระบบได้รับทำการ Migrate จาก PHP เป็น Node.js (Express) ครบถ้วน **100%** แล้ว:
- **Frontend:** ไม่มีการเรียกใช้ไฟล์ .php หรือ API เก่า
- **Backend:** ทำงานบน Node.js ทั้งหมด โดยเชื่อมต่อกับ MySQL (MariaDB) โดยตรง
- **Deployment:** จึงต้องการเพียง **Node.js Environment** และ **MySQL Database** เท่านั้น (ไม่ต้องติดตั้ง PHP/Apache/XAMPP)

---

## 🚀 ขั้นตอนการ Deploy (Node.js Only)

### 1. การเตรียมความพร้อมบน Server (SSH)
เชื่อมต่อเข้าสู่ Server เพื่อตั้งค่าเบื้องต้น:
```bash
# เชื่อมต่อผ่าน SSH
ssh sif-vm1@10.2.0.6

# อัปเดตแพ็กเกจระบบ
sudo apt update && sudo apt upgrade -y
```

### 2. ติดตั้ง Environment (Node.js & PM2)
```bash
# ติดตั้ง Node.js (แนะนำ v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ตรวจสอบเวอร์ชัน
node -v
npm -v

# ติดตั้ง PM2 สำหรับจัดการ Process
sudo npm install -g pm2
```

### 3. การเตรียม Code และ Dependencies
```bash
# สร้างโฟลเดอร์สำหรับแอปพลิเคชัน
mkdir -p ~/apps
cd ~/apps

# (ตัวเลือก A) Clone จาก Git
git clone <URL_ของ_REPOSITORY> icp-project
cd icp-project/backend

# (ตัวเลือก B) อัปโหลดไฟล์จากเครื่อง Local (SCP) - ทำจากเครื่องตัวเอง
# scp -r d:\Project-icp\icp-project-app\backend sif-vm1@10.2.0.6:~/apps/icp-project/

# ติดตั้ง Dependencies
npm install
```

### 4. การตั้งค่า Environment Variables (.env)
สร้างไฟล์ `.env` ในโฟลเดอร์ root ของโปรเจกต์ (`~/apps/icp-project/`):
```bash
cat > ~/apps/icp-project/.env << 'EOF'
# Database Configuration
DB_MODE=remote

# Remote Database (เชื่อมต่อไปยัง 10.2.0.5)
DB_REMOTE_HOST=10.2.0.5
DB_REMOTE_PORT=3306
DB_REMOTE_DATABASE=u486700931_icp
DB_REMOTE_USER=u486700931_root
DB_REMOTE_PASSWORD=REDACTED_PASSWORD

# Application Settings
NODE_ENV=production
PORT=3000
EOF
```

### 5. การรันระบบด้วย PM2
```bash
cd ~/apps/icp-project/backend
pm2 start server.js --name "icp-backend"

# ตั้งค่าให้รันอัตโนมัติเมื่อเปิดเครื่อง (Startup)
pm2 startup
# (รันคำสั่งที่ระบบแนะนำหลังจากพิมพ์ pm2 startup)
pm2 save
```

### 6. การตั้งค่า Nginx (Reverse Proxy)
เพื่อให้เข้าถึงผ่าน Port 80 ได้:
```bash
sudo apt install -y nginx

# สร้าง Configuration สำหรับ ICP Backend
sudo tee /etc/nginx/sites-available/icp-backend << 'EOF'
server {
    listen 80;
    server_name 10.2.0.6;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# เปิดใช้งาน Config
sudo ln -s /etc/nginx/sites-available/icp-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🤖 การตั้งค่า LLM Service (Ollama)
เนื่องจาก Server มีการติดตั้ง Ollama และ Model เรียบร้อยแล้ว ให้ทำการตรวจสอบความพร้อมใช้งานดังนี้:

### 1. ตรวจสอบสถานะ Service
ตรวจสอบให้แน่ใจว่า Ollama รันอยู่เบื้องหลัง:
```bash
sudo systemctl status ollama
# หากยังไม่ได้ตั้งค่าให้รันอัตโนมัติ:
# sudo systemctl enable ollama
# sudo systemctl start ollama
```

### 2. ตรวจสอบ Model ที่ติดตั้งแล้ว
ตรวจสอบว่ามี model `openthaigpt` อยู่ในรายการหรือไม่:
```bash
ollama list
# ควรพบรายการ model ที่สอดคล้องกับ MODEL_NAME ใน server.js
```

### 3. ทดสอบความพร้อมของ API
ตรวจสอบว่า API ของ Ollama พร้อมรับการเชื่อมต่อจาก Backend:
```bash
curl http://localhost:11434/api/tags
```

---

## 🧪 การตรวจสอบหลังการ Deploy (Verification)

1. **Check API Health:**
   `curl http://10.2.0.6/health`
   ควรตอบกลับเป็น JSON แสดงสถานะ OK และ `dbMode: remote`

2. **Check Database Connection:**
   `curl http://10.2.0.6/api/db-info`
   ควรแสดงข้อมูลการเชื่อมต่อไปยัง IP 10.2.0.5

3. **Check Logs:**
   `pm2 logs icp-backend`

---

## ⚠️ ข้อควรระวังและการแก้ไขปัญหา
- **Database Connection:** ตรวจสอบให้แน่ใจว่า Server 10.2.0.5 อนุญาตให้ 10.2.0.6 เชื่อมต่อผ่าน Port 3306 ได้ (Firewall/User Grant)
- **Firewall:** หากเข้าไม่ได้ ให้เช็ค UFW บน Server 10.2.0.6:
  `sudo ufw allow 80/tcp`
  `sudo ufw allow 3000/tcp`
- **Password Usage:** เนื่องด้วยรหัสผ่านมีอักขระพิเศษ ควรระมัดระวังเมื่อใช้ในคำสั่ง shell (แนะนำให้ครอบด้วย Single Quotes `'...'`)



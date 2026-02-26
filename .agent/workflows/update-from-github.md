---
description: ขั้นตอนการอัปเดต ICP Application (Frontend + Backend) แบบคำสั่งเต็ม พร้อมใช้งาน
---

# ICP Project Update Workflow (คำสั่งเต็ม พร้อมใช้งาน)

> ⚠️ **ต้องต่อ VPN ก่อนทุกครั้ง** (Server IP: 10.2.0.6 เป็น Private Network)
> ⚠️ **Build บนเครื่อง Local เท่านั้น** ห้าม Build บน Server (พื้นที่ไม่พอ)
> 📁 **รันทุกคำสั่งจาก**: `D:\Project-icp\icp-project-app`

## ข้อมูล Server
| รายการ | ค่า |
|---|---|
| IP | 10.2.0.6 |
| SSH Port | 22 / User: sif-vm1 |
| **Frontend** | `/var/www/icp-project-app/` |
| **Backend** | `/var/www/apps/icp-project-app/backend/server.js` |
| Backend Port | 3005 / PM2 name: icp-backend |
| Domain | https://icp.sif.or.th/icp-project-app/ |

---

## ═══════════════════════════════════════
## กรณีที่ 1: แก้ไข Frontend (Vue.js / Quasar)
## ═══════════════════════════════════════

### ขั้นตอนที่ 1: Build Frontend บนเครื่อง Local
```powershell
cd D:\Project-icp\icp-project-app
npm run build
```

### ขั้นตอนที่ 2: สร้างโฟลเดอร์รับไฟล์บน Server
```powershell
ssh -p 22 sif-vm1@10.2.0.6 "mkdir -p /tmp/frontend_new"
```

### ขั้นตอนที่ 3: ส่งไฟล์ที่ Build แล้วขึ้น Server
```powershell
scp -P 22 -r dist\spa\* sif-vm1@10.2.0.6:/tmp/frontend_new/
```

### ขั้นตอนที่ 4: Deploy ไฟล์ไปยัง /var/www/icp-project-app/
```powershell
ssh -t -p 22 sif-vm1@10.2.0.6 "sudo rm -rf /var/www/icp-project-app/* && sudo cp -r /tmp/frontend_new/. /var/www/icp-project-app/ && sudo chown -R www-data:www-data /var/www/icp-project-app/ && rm -rf /tmp/frontend_new && echo DEPLOY_DONE"
```
*(กรอก Password SSH แล้วตามด้วย Password sudo)*

### ขั้นตอนที่ 5: Push Code ขึ้น GitHub (สำรอง)
```powershell
git add -A
git commit -m "feat: update frontend"
git push origin latest:master
```

### ขั้นตอนที่ 6: ตรวจสอบผล
เปิด Browser แบบ Incognito (`Ctrl+Shift+N`) แล้วเข้า:
```
https://icp.sif.or.th/icp-project-app/
```

---

## ═══════════════════════════════════════
## กรณีที่ 2: แก้ไข Backend (Node.js / Express)
## ═══════════════════════════════════════

### ขั้นตอนที่ 1: Push Code ขึ้น GitHub
```powershell
cd D:\Project-icp\icp-project-app
git add -A
git commit -m "fix: update backend"
git push origin latest:master
```

### ขั้นตอนที่ 2: Pull Code และ Restart Backend บน Server
```powershell
ssh -t -p 22 sif-vm1@10.2.0.6 "source \$HOME/.nvm/nvm.sh && nvm use 20.20.0 && cd /var/www/apps/icp-project-app && git pull origin master && cd backend && npm install --omit=dev && PM2_BIN=\$(find \$HOME/.nvm -name pm2 -type f -executable | head -n 1) && \$PM2_BIN restart icp-backend && \$PM2_BIN status"
```

### ขั้นตอนที่ 3: ตรวจสอบ Log Backend
```powershell
ssh -t -p 22 sif-vm1@10.2.0.6 "source \$HOME/.nvm/nvm.sh && nvm use 20.20.0 && PM2_BIN=\$(find \$HOME/.nvm -name pm2 -type f -executable | head -n 1) && \$PM2_BIN logs icp-backend --lines 20"
```

---

## ═══════════════════════════════════════
## กรณีที่ 3: แก้ไขทั้ง Frontend และ Backend
## ═══════════════════════════════════════

ทำ **กรณีที่ 1 (ขั้นตอน 1-5)** ก่อน แล้วตามด้วย **กรณีที่ 2 (ขั้นตอน 1-3)**

---

## ═══════════════════════════════════════
## คำสั่งฉุกเฉิน (Troubleshooting)
## ═══════════════════════════════════════

### เช็คสถานะ PM2:
```powershell
ssh -t -p 22 sif-vm1@10.2.0.6 "source \$HOME/.nvm/nvm.sh && nvm use 20.20.0 && PM2_BIN=\$(find \$HOME/.nvm -name pm2 -type f -executable | head -n 1) && \$PM2_BIN status"
```

### เช็ค API Health:
```powershell
ssh -p 22 sif-vm1@10.2.0.6 "curl -s http://127.0.0.1:3005/health"
```

### เช็คพื้นที่ Disk:
```powershell
ssh -p 22 sif-vm1@10.2.0.6 "df -h"
```

### ล้าง NPM Cache (ถ้าพื้นที่เต็ม):
```powershell
ssh -t -p 22 sif-vm1@10.2.0.6 "rm -rf ~/.npm/_cacache && rm -rf ~/.npm/_logs && echo CLEANED"
```

### Reload Nginx:
```powershell
ssh -t -p 22 sif-vm1@10.2.0.6 "sudo nginx -t && sudo systemctl reload nginx && echo NGINX_OK"
```

### ดู Nginx Error Log:
```powershell
ssh -p 22 sif-vm1@10.2.0.6 "sudo tail -n 50 /var/log/nginx/error.log"
```



# ICP Deployment Verification Checklist
# ========================================
# **Date:** $(date)
# **Server:** 10.2.0.6:22
# **User:** sif-vm1
# **Status:** Verification in Progress

## Server Information
- Server IP: 10.2.0.6
- SSH Port: 22
- Username: sif-vm1
- Backend Port: 3000
- Database Host: 10.2.0.5
- Database Port: 3306
- Database Name: u486700931_icp
- Database User: u486700931_root
- App URL: https://icp.sif.or.th/icp-project-app/

---

## PART 1: Network & SSH Connection Tests (Run from your local machine)

### Test 1.1: Check if Server IP is Reachable
```powershell
# Test ICMP ping (may be blocked by firewall)
ping 10.2.0.6
```
**Expected:** Reply from 10.2.0.6
**Status:** [ ] PASS  [ ] FAIL  [ ] FIREWALL BLOCKED

### Test 1.2: Check SSH Port Connectivity
```powershell
# Test if port 22 is open
Test-NetConnection -ComputerName 10.2.0.6 -Port 22

# Or using PowerShell
$tcpConnection = New-Object System.Net.Sockets.TcpClient
$tcpConnection.ConnectAsync('10.2.0.6', 22).Wait(1000)
$tcpConnection.Connected
```
**Expected:** TcpSucceeded = True or Connected = True
**Status:** [ ] PASS  [ ] FAIL  [ ] TIMEOUT

### Test 1.3: SSH Connection with Password
```powershell
# Connect to server
ssh -p 22 sif-vm1@10.2.0.6
# Password: REDACTED_SSH_PASSWORD
```
**Status:** [ ] PASS  [ ] FAIL  [ ] TIMEOUT

---

## PART 2: Server-Side Verification (Once SSH Connected)

### RUN ON SERVER via SSH:

### Test 2.1: Check Node.js Installation
```bash
node --version
npm --version
which node
which npm
```
**Expected Output:**
- v16.x.x or higher
- npm 8.x.x or higher
**Status:** [ ] PASS  [ ] FAIL

### Test 2.2: Check PM2 and Processes
```bash
# Global PM2 check
pm2 status

# Specific process info
pm2 info icp-backend

# View logs
pm2 logs icp-backend --lines 50
```
**Expected:** icp-backend should be "online" or "running"
**Status:** [ ] PASS  [ ] FAIL  [ ] OFFLINE

### Test 2.3: Directory Structure
```bash
# Check backend directory
ls -la /home/sif-vm1/apps/icp-project-app/
ls -la /home/sif-vm1/apps/icp-project-app/backend/

# Check critical files
cat /home/sif-vm1/apps/icp-project-app/.env | grep -E '^(DB_|NODE_|PORT)'
```
**Expected:** Backend directory exists with server.js, package.json, .env configured
**Status:** [ ] PASS  [ ] FAIL

### Test 2.4: Environment Variables Check
```bash
# Show database configuration
cat /home/sif-vm1/apps/icp-project-app/.env

# Should contain:
# DB_MODE=remote
# DB_REMOTE_HOST=10.2.0.5
# DB_REMOTE_PORT=3306
# DB_REMOTE_DATABASE=u486700931_icp
# NODE_ENV=production
# PORT=3000
```
**Status:** [ ] PASS  [ ] FAIL

### Test 2.5: Backend Health Check (Local)
```bash
# Check if backend is responding on localhost
curl -v http://localhost:3000/health

# Check if port 3000 is listening
netstat -lntp | grep 3000
ss -lntp | grep 3000
```
**Expected Response:** HTTP 200 or health check message
**Status:** [ ] PASS  [ ] FAIL  [ ] OFFLINE

### Test 2.6: Database Connectivity (On Server)
```bash
# Test connection to database
mysql -h 10.2.0.5 -u u486700931_root -p'<PASSWORD>' -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'u486700931_icp';"

# Or test with nc (netcat)
nc -zv -w 5 10.2.0.5 3306

# Check if MySQL port is open
telnet 10.2.0.5 3306
```
**Expected:** Connection successful, shows table count
**Status:** [ ] PASS  [ ] FAIL  [ ] NEED_PASSWORD

### Test 2.7: Firewall Configuration
```bash
# Check firewall rules
sudo ufw status
sudo ufw status verbose

# Check if port 3000 is open
sudo ufw allow 3000/tcp

# Verify with
netstat -lntp | grep 3000
```
**Status:** [ ] PASS  [ ] FAIL  [ ] NOT_CONFIGURED

### Test 2.8: System Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU
top -bn1 | head -5

# Check services
systemctl status

# Check PM2 resurrect (auto-start)
pm2 startup
pm2 save
```
**Expected:** Sufficient disk space, reasonable memory usage
**Status:** [ ] PASS  [ ] FAIL

### Test 2.9: Ollama Status
```bash
# Check if Ollama is running
ps aux | grep -i ollama

# Check Ollama list
ollama list

# Check Ollama service
sudo systemctl status ollama

# Test Ollama API
curl -s http://localhost:11434/api/tags
```
**Expected:** Ollama process running, models available
**Status:** [ ] PASS  [ ] FAIL  [ ] OFFLINE

### Test 2.10: API Endpoints
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Test member list
curl http://localhost:3000/api/member/list

# Test health
curl http://localhost:3000/health
```
**Status:** [ ] PASS  [ ] FAIL

---

## PART 3: External/Web-Based Tests

### Test 3.1: Web Application via HTTPS
```powershell
# From your local machine
Invoke-WebRequest https://icp.sif.or.th/icp-project-app/ -SkipCertificateCheck

# Or use curl
curl -k https://icp.sif.or.th/icp-project-app/
```
**Expected:** HTTP 200-302 (may redirect)
**Status:** [ ] PASS  [ ] FAIL

### Test 3.2: Backend via HTTP (Direct IP)
```powershell
# Test from local machine
curl http://10.2.0.6:3000/health
curl http://10.2.0.6:3000/api/user/login
```
**Status:** [ ] PASS  [ ] FAIL

### Test 3.3: SSL Certificate Check
```powershell
# Check SSL certificate
(Invoke-WebRequest https://icp.sif.or.th -SkipCertificateCheck).Headers

# Or use openssl (if installed)
openssl s_client -connect icp.sif.or.th:443
```
**Status:** [ ] PASS  [ ] FAIL  [ ] EXPIRED

---

## PART 4: Deployment Component Checklist

### Backend Application
- [ ] Node.js installed (v16+)
- [ ] npm modules installed (`npm install` completed)
- [ ] .env file configured correctly
- [ ] Database credentials valid
- [ ] Server starting without errors
- [ ] Port 3000 listening
- [ ] No authentication errors in logs

### Database
- [ ] MySQL running on 10.2.0.5:3306
- [ ] Database u486700931_icp exists
- [ ] User u486700931_root has access
- [ ] Tables properly structured
- [ ] Character encoding is utf8mb4
- [ ] Network connectivity 10.2.0.6 → 10.2.0.5 working

### Web Application
- [ ] HTTPS accessible at https://icp.sif.or.th/icp-project-app/
- [ ] Frontend assets loading
- [ ] Backend API responding
- [ ] No JavaScript errors in console
- [ ] Database queries working
- [ ] User can log in
- [ ] Forms submitting successfully

### Process Management (PM2)
- [ ] icp-backend process running
- [ ] Auto-restart configured
- [ ] Logs accessible
- [ ] No error states
- [ ] Memory/CPU usage normal
- [ ] Uptime reasonable

### Ollama/AI Integration
- [ ] Ollama service running
- [ ] Models downloaded
- [ ] API accessible on port 11434
- [ ] Responses working
- [ ] Memory sufficient

### Security & Network
- [ ] Firewall configured
- [ ] Ports exposed correctly
- [ ] HTTPS working
- [ ] Database credentials secure
- [ ] No sensitive data in logs
- [ ] SSL certificate valid

---

## PART 5: Troubleshooting Commands

### If Backend Not Responding
```bash
# Check PM2 logs
pm2 logs icp-backend --lines 100

# Restart backend
pm2 restart icp-backend

# Kill and manually start
pm2 stop icp-backend
cd /home/sif-vm1/apps/icp-project-app/backend
node server.js
```

### If Database Connection Failed
```bash
# Test network connectivity
ping 10.2.0.5
nc -zv 10.2.0.5 3306

# Test MySQL directly
mysql -h 10.2.0.5 -u u486700931_root -p

# Check environment variables
cat /home/sif-vm1/apps/icp-project-app/.env | grep DB_
```

### If Web App Not Loading
```bash
# Check proxy/reverse proxy logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Verify backend is running
curl http://localhost:3000/health

# Check if frontend files exist
ls -la /home/sif-vm1/apps/icp-project-app/public/
```

### If Ollama Issues
```bash
# Check Ollama service
sudo systemctl status ollama
sudo systemctl restart ollama

# Check Ollama logs
sudo journalctl -u ollama -f

# Test Ollama API
curl http://localhost:11434/api/tags
```

---

## VERIFICATION SIGN-OFF

**Date Verified:** _______________  
**Verified By:** _______________  
**Overall Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

**Issues Found (if any):**
```
[List any issues here]
```

**Next Steps:**
```
[Document any actions needed]
```

**Notes:**
```
[Any additional notes]
```



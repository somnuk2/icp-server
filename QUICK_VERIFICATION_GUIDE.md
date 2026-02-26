# ============================================================================
# ICP Deployment - Quick Verification Guide
# ============================================================================
# Run this on your local machine to verify the deployment
# ============================================================================

## TARGET SERVERS
Server IP: 10.2.0.6
SSH Port: 22
SSH User: sif-vm1
SSH Password: REDACTED_SSH_PASSWORD

Database IP: 10.2.0.5
Database Port: 3306
Database Name: u486700931_icp
Database User: u486700931_root

## STEP 1: Connect to Server via SSH
=====================================================

# From Windows PowerShell or any terminal:
ssh -p 22 sif-vm1@10.2.0.6

# When prompted, enter password: REDACTED_SSH_PASSWORD


## STEP 2: Server Quick Checks (After SSH Connected)
=====================================================

# Check what's running:
pm2 status
pm2 info icp-backend
pm2 logs icp-backend

# Test backend locally:
curl http://localhost:3000/health

# Check database connection:
mysql -h 10.2.0.5 -u u486700931_root -p

# Check Ollama:
ollama list
ps aux | grep ollama


## STEP 3: Database Verification
=====================================================

# Connected to database, check:
SHOW DATABASES;
USE u486700931_icp;
SHOW TABLES;
SELECT COUNT(*) FROM member;


## STEP 4: Test API Endpoints
=====================================================

# From the server:
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

curl http://localhost:3000/api/member/list


## STEP 5: Test Web Application
=====================================================

# From your local machine:
https://icp.sif.or.th/icp-project-app/

# Should load successfully
# Try logging in


## EXPECTED Results
=====================================================

✅ SSH Connection: Successful
✅ PM2 Status: icp-backend is "online"
✅ Backend Health: HTTP 200 response
✅ Database: Connection successful
✅ Ollama: Process running with models
✅ Web App: Loads and responsive
✅ Login: Works with valid credentials


## QUICK TROUBLESHOOTING  
=====================================================

# If backend offline:
pm2 start /home/sif-vm1/apps/icp-project-app/backend/server.js --name icp-backend

# If database fails:
mysql -h 10.2.0.5 -u u486700931_root -p'PASSWORD'

# If SSL certificate error:
curl -k https://icp.sif.or.th/icp-project-app/

# View complete logs:
pm2 logs icp-backend --lines 200

# Reset PM2:
pm2 delete icp-backend
pm2 start /home/sif-vm1/apps/icp-project-app/backend/server.js --name icp-backend
pm2 save


## DETAILED LOGS
=====================================================

# SSH into server, then:

# View recent logs (last 50 lines):
pm2 logs icp-backend --lines 50

# Watch logs in real-time:
pm2 logs icp-backend

# Find critical errors:
pm2 logs icp-backend | grep -i error

# Check system resources:
free -h
df -h
top -b -n 1 | head -12


## PORT CHECKS
=====================================================

Backend API: 3000
Web Application: 443 (HTTPS)
Database: 3306 (10.2.0.5)
Ollama: 11434

# From server:
sudo ufw status
netstat -lntp | grep -E '3000|11434'


## API ENDPOINT TESTS
=====================================================

# Health check:
curl http://localhost:3000/health

# User login:
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Get members:
curl http://localhost:3000/api/member/list

# Check Ollama:
curl http://localhost:11434/api/tags


## VERIFICATION SUMMARY TEMPLATE
=====================================================

Component Status:
[ ] SSH Access - ✅ PASS / ❌ FAIL
[ ] Node.js Version - ✅ PASS / ❌ FAIL
[ ] PM2 Process - ✅ ONLINE / ❌ OFFLINE
[ ] Backend Health (http://10.2.0.6:3000/health) - ✅ 200 / ❌ FAIL
[ ] Database Connection - ✅ PASS / ❌ FAIL
[ ] Database Tables - ✅ EXIST / ❌ MISSING
[ ] Ollama Service - ✅ RUNNING / ❌ OFFLINE
[ ] Web Application (https://icp.sif.or.th/icp-project-app/) - ✅ LOAD / ❌ FAIL
[ ] API Endpoints - ✅ RESPOND / ❌ FAIL
[ ] Login Functionality - ✅ WORK / ❌ FAIL

Overall Status: [ ] ✅ OPERATIONAL / [ ] ⚠️ PARTIAL / [ ] ❌ FAILED

Issues Identified:
- [List any issues]

Actions Taken:
- [List any fixes applied]

Date Verified: ______________________
Verified By: _______________________



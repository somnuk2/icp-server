# ICP Backend Deployment - Verification and Testing Checklist

## ✅ Post-Deployment Verification Checklist

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Server Version:** _________________

---

## Phase 1: System-Level Verification

### SSH Access
- [ ] Can connect via SSH: `ssh -p 22 sif-vm1@10.2.0.6`
- [ ] SSH key-based auth configured (optional)
- [ ] Git access verified
- [ ] No authentication delays

### Node.js Installation
```bash
node --version    # Should be v16+
npm --version     # Should be v8+
which node
which npm
```
- [ ] Node.js installed correctly
- [ ] npm installed correctly
- [ ] Version meets requirements (v16+)

### Directory Structure
```bash
ls -la /home/sif-vm1/apps/icp-project-app/
ls -la /home/sif-vm1/apps/icp-project-app/backend/
```
- [ ] Backend directory exists
- [ ] Files have correct permissions
- [ ] No permission denied errors

### File Verification
- [ ] `backend/server.js` exists and readable
- [ ] `backend/package.json` exists
- [ ] `backend/config/database.js` exists
- [ ] `.env` file exists in project root
- [ ] `node_modules` directory exists
- [ ] All required files present

---

## Phase 2: Environment Configuration Verification

### .env File Check
```bash
cat /home/sif-vm1/apps/icp-project-app/.env
```
- [ ] DB_MODE is set to "remote"
- [ ] DB_REMOTE_HOST is set to "10.2.0.5"
- [ ] DB_REMOTE_PORT is set to "3306"
- [ ] DB_REMOTE_DATABASE is "u486700931_icp"
- [ ] NODE_ENV is set to "production"
- [ ] PORT is set to "3000"

### Configuration Variables
- [ ] All required environment variables present
- [ ] No sensitive data exposed in logs
- [ ] Correct database credentials set

---

## Phase 3: Database Connectivity

### Database Connection Test
```bash
cd /home/sif-vm1/apps/icp-project-app/backend
node test-db-connection.js
```
- [ ] Connection test passes
- [ ] No timeout errors
- [ ] Member table accessible
- [ ] Correct database name confirmed
- [ ] Character encoding is utf8mb4

### Database Accessibility
```bash
telnet 10.2.0.5 3306
```
- [ ] Port 3306 is reachable
- [ ] MySQL is running on remote host
- [ ] No firewall blocking connection

---

## Phase 4: Node.js Application Startup

### PM2 Process Check
```bash
pm2 status
pm2 info icp-backend
```
- [ ] Process shows as "online" or "running"
- [ ] No "errored" or "stopped" status
- [ ] Restart times show 0 (or low)
- [ ] Memory usage is acceptable (<200MB)
- [ ] CPU usage is normal (<10%)

### Application Logs
```bash
pm2 logs icp-backend --lines 50
```
- [ ] No critical errors in logs
- [ ] Database connection confirmed
- [ ] All routes loaded successfully
- [ ] CORS enabled
- [ ] Middleware initialized

### Manual Start Test
```bash
# In separate terminal - manual start test
cd /home/sif-vm1/apps/icp-project-app/backend
node server.js &

# Check if server started
sleep 2
curl http://localhost:3000/health
```
- [ ] Server starts without errors
- [ ] No port conflicts
- [ ] All modules load correctly

---

## Phase 5: Network and Firewall

### Port Accessibility
```bash
sudo ufw status
sudo netstat -lntp | grep 3000
ss -lntp | grep 3000
```
- [ ] Port 3000 is listening
- [ ] IPv4 and IPv6 if applicable
- [ ] Firewall rule allows port 3000

### From Local Machine
```bash
# From Windows machine
curl http://10.2.0.6:3000/health
telnet 10.2.0.6 3000
```
- [ ] Can reach server from client
- [ ] No firewall blocking connection
- [ ] Port 3000 is accessible externally

---

## Phase 6: API Endpoint Testing

### Health Check Endpoint
```bash
curl http://10.2.0.6:3000/health -v
```
Expected Response:
```json
{"status":"OK","dbMode":"remote","timestamp":"2026-02-23T..."}
```
- [ ] Status code: 200 OK
- [ ] Response body contains "OK"
- [ ] dbMode shows "remote"
- [ ] Timestamp is current

### Database Info Endpoint
```bash
curl http://10.2.0.6:3000/api/db-info -v
```
Expected Response:
```json
{"mode":"remote","host":"10.2.0.5","port":3306,"database":"u486700931_icp"}
```
- [ ] Status code: 200 OK
- [ ] Host shows correct IP (10.2.0.5)
- [ ] Database name is correct
- [ ] Port is 3306

### CORS Testing
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://10.2.0.6:3000/api/institutes -v
```
- [ ] CORS headers present
- [ ] Allows all origins (or as configured)
- [ ] GET, POST methods allowed

### GET Endpoints
```bash
# Institutes
curl http://10.2.0.6:3000/api/institutes

# Members
curl http://10.2.0.6:3000/api/members

# Faculties
curl http://10.2.0.6:3000/api/faculties
```
- [ ] Returns 200 status
- [ ] Returns valid JSON array
- [ ] Data is from correct database

### Data Validation
- [ ] Returned JSON is properly formatted
- [ ] Field names match expected schema
- [ ] Data types are correct
- [ ] No malformed responses

---

## Phase 7: Error Handling

### Test Invalid Endpoint
```bash
curl http://10.2.0.6:3000/api/invalid -v
```
- [ ] Returns 404 error
- [ ] Error message is clear
- [ ] No stack traces exposed

### Test Bad Request
```bash
curl -X POST http://10.2.0.6:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{invalid json}'
```
- [ ] Returns 400 error
- [ ] No server crash
- [ ] Error message is informative

### Check Error Logs
```bash
pm2 logs icp-backend | grep ERROR
pm2 logs icp-backend | grep error
```
- [ ] No unhandled errors
- [ ] Errors are properly logged
- [ ] Error messages are meaningful

---

## Phase 8: Performance Testing

### Response Time Check
```bash
time curl http://10.2.0.6:3000/health
```
- [ ] Response time < 500ms
- [ ] Consistent performance
- [ ] No timeout issues

### Load Testing (Optional)
```bash
# Install ab (Apache Bench) if not present
# sudo apt install apache2-utils

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 http://10.2.0.6:3000/health
```
- [ ] Handles concurrent requests
- [ ] No connection refused errors
- [ ] Error rate < 5%
- [ ] Response time stable

### Memory Stability
```bash
# Monitor for 1 minute
pm2 monit
```
- [ ] Memory usage stable
- [ ] No continuous increase
- [ ] CPU usage acceptable

---

## Phase 9: Logging and Monitoring

### PM2 Logs
```bash
pm2 logs icp-backend --follow
```
- [ ] Logs are being generated
- [ ] No continuous error messages
- [ ] Timestamp format correct
- [ ] Log level appropriate

### Save Logs
```bash
pm2 logs icp-backend > backend-$(date +%Y%m%d-%H%M%S).log
```
- [ ] Log file created successfully
- [ ] Contains relevant information
- [ ] File size reasonable

### Startup Configuration
```bash
pm2 list
cat ~/.pm2/conf.js
pm2 env 0
```
- [ ] App configured for auto-start
- [ ] Environment variables set correctly
- [ ] Node env is "production"

---

## Phase 10: Security Verification

### Credentials Not Exposed
- [ ] .env file not accessible via web
- [ ] Database password not in logs
- [ ] No console.log of sensitive data
- [ ] .env not committed to git

### HTTPS/SSL (If Configured)
```bash
# If using reverse proxy with SSL
curl -k https://10.2.0.6/health
```
- [ ] SSL certificate valid (if used)
- [ ] HTTPS redirect working (if configured)
- [ ] Certificate not expired

### Input Validation
```bash
curl "http://10.2.0.6:3000/api/members?id=<script>alert('xss')</script>"
```
- [ ] No XSS vulnerabilities
- [ ] SQL injection protection in place
- [ ] Input validation working

### Authentication (If Protected)
- [ ] Login endpoints require credentials
- [ ] Invalid credentials rejected
- [ ] Sessions properly managed
- [ ] No hardcoded credentials

---

## Phase 11: PM2 Auto-Start Verification

### Check Startup Configuration
```bash
pm2 startup
pm2 status
sudo systemctl list-timers
```
- [ ] PM2 startup script created
- [ ] Auto-start enabled
- [ ] Cron job scheduled (if applicable)

### Test Auto-Start
```bash
# Simulate: Stop the app
pm2 stop icp-backend
sleep 10

# Check if it restarted
pm2 status

# If not, check startup config
pm2 logs
```
- [ ] App restarts after crash
- [ ] Auto-restart configured
- [ ] Restart count showing activity

---

## Phase 12: Nginx/Reverse Proxy (If Configured)

### Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```
- [ ] Nginx is running
- [ ] Configuration test passes
- [ ] No syntax errors

### Proxy Testing
```bash
curl http://10.2.0.6:80/health     # Via Nginx
curl http://10.2.0.6:3000/health   # Direct to Node
```
- [ ] Both endpoints accessible
- [ ] Same response from both
- [ ] No proxy errors

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```
- [ ] Requests being logged
- [ ] No 502/503 errors
- [ ] Correct status codes

---

## Phase 13: Backup Verification

### Database Backup
```bash
mysqldump -h 10.2.0.5 -u u486700931_root -p u486700931_icp | head -20
```
- [ ] Backup command works
- [ ] Database structure present
- [ ] Can create backups

### Application Backup
```bash
tar -tzf icp-backend-backup.tar.gz | head -20
```
- [ ] Backup archive created
- [ ] Contains all necessary files
- [ ] Can be extracted successfully

---

## Phase 14: Documentation Review

### README and Documentation
- [ ] Deployment plan is clear
- [ ] Quick reference accessible
- [ ] Troubleshooting guide available
- [ ] Contact information provided

### Version Information
- [ ] Backend version documented
- [ ] Deployment date recorded
- [ ] Known issues logged
- [ ] Future improvements noted

---

## 🔴 Critical Issues Found

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
|       |          |        |            |
|       |          |        |            |
|       |          |        |            |

---

## 🟡 Warnings/Observations

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

---

## 📋 Summary

| Item | Result |
|------|--------|
| SSH Access | ✅ Pass / ❌ Fail |
| Node.js Installed | ✅ Pass / ❌ Fail |
| Database Connection | ✅ Pass / ❌ Fail |
| Application Running | ✅ Pass / ❌ Fail |
| Health Endpoint | ✅ Pass / ❌ Fail |
| API Endpoints | ✅ Pass / ❌ Fail |
| Performance | ✅ Pass / ❌ Fail |
| Security | ✅ Pass / ❌ Fail |
| PM2 Auto-Start | ✅ Pass / ❌ Fail |
| Backup Configured | ✅ Pass / ❌ Fail |

---

## ✅ Deployment Complete

- [ ] All checks passed
- [ ] Frontend can connect to backend
- [ ] Team notified of completion
- [ ] Post-deployment support available
- [ ] Monitoring alerts configured

---

## 📝 Notes and Observations

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## 👤 Sign-Off

**Verified By:** _________________________ **Date:** _______

**Approved By:** _________________________ **Date:** _______

**Comments:**

_________________________________________________________________

_________________________________________________________________

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Next Review Date:** _________________



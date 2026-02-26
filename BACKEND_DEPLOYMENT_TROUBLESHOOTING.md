# ICP Backend Deployment - Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Category 1: SSH and Access Issues

#### Issue: Cannot Connect via SSH
```
Error: Connection refused / timed out
```

**Symptoms:**
- SSH connection fails immediately
- "Connection refused" error
- "Host unreachable" error

**Solutions:**
1. Verify server is online
   ```bash
   ping 10.2.0.6
   ```

2. Check SSH port is correct
   ```bash
   ssh -p 22 sif-vm1@10.2.0.6
   ```

3. Verify firewall allows SSH
   ```bash
   # On server
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

4. Check SSH service is running
   ```bash
   # On server
   sudo systemctl status ssh
   sudo systemctl start ssh
   ```

5. Verify SSH key is correct (if using key-based auth)
   ```bash
   # Local machine
   ssh -v -i your-key.pem -p 22 sif-vm1@10.2.0.6
   ```

---

#### Issue: SSH Password Not Working
```
Permission denied (password)
```

**Symptoms:**
- Password entered but access denied
- "Permission denied" after entering password
- "Too many authentication failures"

**Solutions:**
1. Verify password is correct (case-sensitive)
2. Ensure caps lock is off
3. Try resetting password
   ```bash
   # This requires alternative access method
   sudo passwd sif-vm1
   ```

4. Check SSH config
   ```bash
   # On server
   sudo cat /etc/ssh/sshd_config | grep -i password
   ```

5. Restart SSH service
   ```bash
   sudo systemctl restart ssh
   ```

---

### Category 2: Node.js Installation Issues

#### Issue: Node.js Not Found After Installation
```
command not found: node
```

**Symptoms:**
- `node --version` returns command not found
- npm not found either
- Installation seemed successful

**Solutions:**
1. Reinstall Node.js with correct repository
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   node --version
   ```

2. Check PATH variable
   ```bash
   echo $PATH
   which node
   ```

3. Verify installation location
   ```bash
   ls -la /usr/bin/node
   ls -la /usr/bin/npm
   ```

4. Install using nvm (alternative method)
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install node
   node --version
   ```

---

#### Issue: npm install Fails
```
Error: EACCES: permission denied
```

**Symptoms:**
- "permission denied" during npm install
- "ERR! code EACCES"
- Cannot install dependencies

**Solutions:**
1. Run with sudo (not recommended)
   ```bash
   cd /home/sif-vm1/apps/icp-project-app/backend
   sudo npm install
   ```

2. Fix npm permissions (recommended)
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   source ~/.bashrc
   npm install
   ```

3. Fix directory ownership
   ```bash
   sudo chown -R sif-vm1:sif-vm1 /home/sif-vm1/apps/
   npm install
   ```

---

### Category 3: Database Connection Issues

#### Issue: Cannot Connect to Database
```
Error: connect ECONNREFUSED 10.2.0.5:3306
```

**Symptoms:**
- "Connection refused" error
- Database connection test fails
- Backend starts but crashes when accessing API

**Solutions:**
1. Verify database server is reachable
   ```bash
   ping 10.2.0.5
   ```

2. Test MySQL port connectivity
   ```bash
   telnet 10.2.0.5 3306
   # Or
   nc -zv 10.2.0.5 3306
   ```

3. Verify credentials in .env
   ```bash
   cat /home/sif-vm1/apps/icp-project-app/.env
   ```

4. Test connection manually
   ```bash
   mysql -h 10.2.0.5 -u u486700931_root -p u486700931_icp -e "SELECT 1;"
   ```

5. Check firewall on database server
   ```bash
   # On DB server (10.2.0.5)
   sudo ufw status
   sudo ufw allow from 10.2.0.6 to any port 3306
   ```

6. Check MySQL is accepting remote connections
   ```bash
   # On DB server
   mysql -u root -p -e "SELECT @@bind_address;"
   # Should show 0.0.0.0 or specific IP
   ```

---

#### Issue: Database Credentials Wrong
```
Error: ER_ACCESS_DENIED_FOR_USER 'u486700931_root'@'10.2.0.6'
```

**Symptoms:**
- "Access denied for user" error
- Login with credentials fails
- Cannot select database

**Solutions:**
1. Verify credentials
   ```bash
   # On DB server
   mysql -u u486700931_root -p u486700931_icp
   ```

2. Update .env file with correct credentials
   ```bash
   cat > /home/sif-vm1/apps/icp-project-app/.env << EOF
   DB_MODE=remote
   DB_REMOTE_HOST=10.2.0.5
   DB_REMOTE_USER=u486700931_root
   DB_REMOTE_PASSWORD=REDACTED_PASSWORD
   EOF
   ```

3. Reset database user password (requires DB access)
   ```bash
   # On DB server
   mysql -u root -p
   > ALTER USER 'u486700931_root'@'10.2.0.6' IDENTIFIED BY 'REDACTED_PASSWORD';
   > FLUSH PRIVILEGES;
   ```

4. Check user privileges
   ```bash
   # On DB server
   mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user='u486700931_root';"
   ```

---

### Category 4: Port and Network Issues

#### Issue: Port 3000 Already in Use
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

**Symptoms:**
- Backend won't start
- "address already in use" error
- Port 3000 is busy

**Solutions:**
1. Find process using port 3000
   ```bash
   # Method 1
   sudo lsof -i :3000
   
   # Method 2
   sudo netstat -lntp | grep 3000
   
   # Method 3
   sudo ss -lntp | grep 3000
   ```

2. Kill the process
   ```bash
   sudo kill -9 <PID>
   ```

3. Change application port in .env
   ```bash
   PORT=3001  # or any available port
   ```

4. Restart backend
   ```bash
   pm2 restart icp-backend
   ```

---

#### Issue: Cannot Access Backend from External Machine
```
Error: Connection failed / Connection refused
```

**Symptoms:**
- Health check fails from local machine
- Curl to external IP fails
- But localhost:3000 works on server

**Solutions:**
1. Verify port is listening externally
   ```bash
   netstat -lntp | grep 3000
   # Should show 0.0.0.0:3000 not 127.0.0.1:3000
   ```

2. Check firewall allows the port
   ```bash
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```

3. Verify server is accessible
   ```bash
   # From local machine
   telnet 10.2.0.6 3000
   ping 10.2.0.6
   ```

4. Check CORS configuration
   - CORS should be set to allow all origins
   - Check server.js for CORS settings

5. Restart backend to apply changes
   ```bash
   pm2 restart icp-backend
   ```

---

### Category 5: PM2 Process Issues

#### Issue: PM2 Process Shows as "Stopped"
```
icp-backend  0  N/A       0 B       stopped
```

**Symptoms:**
- PM2 status shows "stopped"
- Backend not accessible
- No response from API

**Solutions:**
1. Start the process manually
   ```bash
   cd /home/sif-vm1/apps/icp-project-app/backend
   pm2 start server.js --name "icp-backend"
   ```

2. Check why it stopped
   ```bash
   pm2 logs icp-backend
   ```

3. Restart instead of start
   ```bash
   pm2 restart icp-backend
   ```

4. Delete and recreate PM2 entry
   ```bash
   pm2 delete icp-backend
   pm2 start server.js --name "icp-backend" --env production
   pm2 save
   ```

---

#### Issue: PM2 Process Shows as "Errored"
```
icp-backend  0  N/A   errored   0 B
```

**Symptoms:**
- Process permanently errored
- Won't start automatically
- Repeated crashes

**Solutions:**
1. Check error logs
   ```bash
   pm2 logs icp-backend --lines 100
   ```

2. Fix the underlying issue
   - Check database connection
   - Check environment variables
   - Check all dependencies installed

3. Restart PM2
   ```bash
   pm2 restart icp-backend
   ```

4. Monitor for repeated crashes
   ```bash
   pm2 logs icp-backend --follow
   ```

---

#### Issue: PM2 Not Starting on Reboot
```
Backend not running after server restart
```

**Symptoms:**
- Backend doesn't start automatically
- Manual start works fine
- Needs manual restart after reboot

**Solutions:**
1. Setup PM2 startup script
   ```bash
   pm2 startup
   pm2 save
   ```

2. Verify startup configuration
   ```bash
   crontab -l
   pm2 status
   ```

3. Manual restart to verify
   ```bash
   # Full system reboot test (if possible)
   sudo reboot
   
   # Then check
   pm2 status
   ```

4. Check PM2 logs folder
   ```bash
   ls -la ~/.pm2/logs/
   cat ~/.pm2/logs/icp-backend-error.log
   ```

---

### Category 6: Application Crashes and Errors

#### Issue: Backend Crashes Immediately After Start
```
Error: Cannot find module...
```

**Symptoms:**
- Application crashes within seconds
- Error message appears in logs
- Cannot keep it running

**Solutions:**
1. Check error logs
   ```bash
   pm2 logs icp-backend
   ```

2. Reinstall dependencies
   ```bash
   cd /home/sif-vm1/apps/icp-project-app/backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check for missing files
   ```bash
   ls -la /home/sif-vm1/apps/icp-project-app/backend/
   ```

4. Verify .env file exists
   ```bash
   cat /home/sif-vm1/apps/icp-project-app/.env
   ```

5. Test manually to see full error
   ```bash
   cd /home/sif-vm1/apps/icp-project-app/backend
   node server.js
   ```

---

#### Issue: High Memory Usage / Memory Leak
```
Memory usage keeps increasing
```

**Symptoms:**
- PM2 monit shows memory growing
- Eventually runs out of memory
- Server becomes unresponsive

**Solutions:**
1. Monitor memory usage
   ```bash
   pm2 monit
   ```

2. Identify the leak (check code)
   - Look for unclosed connections
   - Check for event listeners
   - Review recent changes

3. Restart application to clear memory
   ```bash
   pm2 restart icp-backend
   ```

4. Setup auto-restart on memory threshold
   ```bash
   pm2 start server.js --max-memory-restart 200M
   pm2 save
   ```

5. Check application logs for errors
   ```bash
   pm2 logs icp-backend | grep ERROR
   ```

---

#### Issue: High CPU Usage
```
CPU usage constantly high (>50%)
```

**Symptoms:**
- PM2 monit shows high CPU
- Server slows down
- Possible infinite loop

**Solutions:**
1. Check current CPU usage
   ```bash
   ps aux | grep node
   top
   ```

2. Review recent code changes
   - Look for infinite loops
   - Check for sync operations
   - Review query performance

3. Check database query performance
   ```bash
   # On DB server
   mysql -u root -p u486700931_icp -e "SHOW PROCESSLIST;"
   ```

4. Restart and monitor
   ```bash
   pm2 restart icp-backend
   pm2 monit
   ```

5. Consider scaling options
   - Add load balancing
   - Use clustering
   - Optimize database queries

---

### Category 7: API and Response Issues

#### Issue: API Returns 502 Bad Gateway
```
502 Bad Gateway (if using Nginx)
```

**Symptoms:**
- Requests fail with 502
- Backend seems unresponsive
- Nginx showing errors

**Solutions:**
1. Check backend is running
   ```bash
   pm2 status
   curl http://localhost:3000/health
   ```

2. Verify Nginx configuration
   ```bash
   sudo nginx -t
   cat /etc/nginx/sites-available/icp-backend
   ```

3. Check Nginx logs
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. Restart Nginx
   ```bash
   sudo systemctl restart nginx
   ```

5. Check connectivity between Nginx and backend
   ```bash
   telnet localhost 3000
   ```

---

#### Issue: API Returns 504 Timeout
```
504 Gateway Timeout
```

**Symptoms:**
- Requests timeout after 30 seconds
- Large data queries fail
- Occasional timeouts

**Solutions:**
1. Increase Nginx timeout
   ```bash
   # Edit /etc/nginx/sites-available/icp-backend
   proxy_connect_timeout 600s;
   proxy_send_timeout 600s;
   proxy_read_timeout 600s;
   ```

2. Optimize database queries
   - Add indexes
   - Reduce result set size
   - Use pagination

3. Check database server
   ```bash
   # On DB server
   mysqladmin -u root -p status
   ```

4. Monitor backend performance
   ```bash
   pm2 logs icp-backend --follow
   ```

---

#### Issue: API Returns Incorrect Data
```
Wrong or missing fields in response
```

**Symptoms:**
- Response missing expected fields
- Data appears incorrect
- Schema mismatch

**Solutions:**
1. Check database schema
   ```bash
   mysql -h 10.2.0.5 -u u486700931_root -p u486700931_icp
   > DESCRIBE member;
   ```

2. Test API endpoint manually
   ```bash
   curl http://10.2.0.6:3000/api/members | jq .
   ```

3. Check recent code changes
   - Review last commits
   - Check field mapping
   - Verify select statements

4. Check database records
   ```bash
   mysql -h 10.2.0.5 -u u486700931_root -p u486700931_icp -e "SELECT * FROM member LIMIT 1\G"
   ```

---

### Category 8: Deployment and File Issues

#### Issue: Files Not Updated After Deployment
```
Changes not reflected in running application
```

**Symptoms:**
- Code changes not appearing
- Old behavior continues
- API responses unchanged

**Solutions:**
1. Verify files were copied
   ```bash
   cat /home/sif-vm1/apps/icp-project-app/backend/server.js | head -20
   ```

2. Restart application
   ```bash
   pm2 restart icp-backend
   ```

3. Check if PM2 is watching files
   ```bash
   pm2 stop icp-backend
   pm2 delete icp-backend
   pm2 start server.js --name "icp-backend" --watch
   ```

4. Clear Node cache (if applicable)
   ```bash
   rm -rf node_modules/.cache
   ```

---

#### Issue: File Permissions Prevent Access
```
Error: EACCES: permission denied
```

**Symptoms:**
- Cannot read uploaded files
- Cannot write to log directory
- Permission denied errors

**Solutions:**
1. Check current permissions
   ```bash
   ls -la /home/sif-vm1/apps/icp-project-app/
   ```

2. Fix file permissions
   ```bash
   sudo chown -R sif-vm1:sif-vm1 /home/sif-vm1/apps/
   sudo chmod -R 755 /home/sif-vm1/apps/
   ```

3. Check user running PM2
   ```bash
   ps aux | grep node
   ```

---

### Category 9: General Debugging Steps

#### Step 1: Check Service Status
```bash
pm2 status
pm2 info icp-backend
pm2 logs icp-backend
```

#### Step 2: Test Connectivity
```bash
# From server
curl http://localhost:3000/health

# From client
curl http://10.2.0.6:3000/health
telnet 10.2.0.6 3000
```

#### Step 3: Check System Resources
```bash
# Memory
free -h

# Disk
df -h

# CPU
top
mpstat
```

#### Step 4: Check Network
```bash
netstat -lntp | grep 3000
ss -lntp | grep 3000
sudo ufw status
```

#### Step 5: Review Logs
```bash
pm2 logs icp-backend
pm2 logs icp-backend | grep ERROR
pm2 logs icp-backend | grep warn
```

#### Step 6: Manual Test
```bash
cd /home/sif-vm1/apps/icp-project-app/backend
node server.js
# Check for errors in output
```

---

## 📞 Escalation Path

### Level 1: Self-Service Troubleshooting
1. Check health endpoint: `curl http://10.2.0.6:3000/health`
2. Review PM2 logs: `pm2 logs icp-backend`
3. Check basic connectivity: `ping 10.2.0.6`

### Level 2: System Administration
- SSH access issues
- Firewall configuration
- System package updates
- Server hardware checks

### Level 3: Database Administration
- Database connection issues
- Query performance
- Database backups
- Replication issues

### Level 4: Backend Development
- Application logic errors
- Database schema changes
- API endpoint issues
- Code bugs

---

## 🆘 Emergency Procedures

### Quick Restart
```bash
pm2 restart icp-backend
```

### Full Restart
```bash
pm2 stop icp-backend
pm2 delete icp-backend
cd /home/sif-vm1/apps/icp-project-app/backend
npm install
pm2 start server.js --name "icp-backend"
```

### Emergency Rollback
```bash
cd /home/sif-vm1/apps/icp-project-app
git status
git log --oneline | head -5
git checkout <previous-stable-hash>
cd backend
npm install
pm2 restart icp-backend
```

### Complete Reset
```bash
# Stop service
pm2 stop icp-backend
pm2 delete icp-backend

# Remove old installation
rm -rf /home/sif-vm1/apps/icp-project-app/backend/node_modules
rm /home/sif-vm1/apps/icp-project-app/backend/package-lock.json

# Fresh install
cd /home/sif-vm1/apps/icp-project-app/backend
npm install --production

# Start fresh
pm2 start server.js --name "icp-backend"
```

---

## 📋 Useful Diagnostic Commands

```bash
# Full system diagnostic
echo "=== System Info ===" && uname -a
echo "=== Node.js ===" && node --version && npm --version
echo "=== Process ===" && pm2 status
echo "=== Connectivity ===" && netstat -lntp | grep 3000
echo "=== Database ===" && node test-db-connection.js
echo "=== Health ===" && curl -s http://localhost:3000/health
echo "=== Memory ===" && free -h
echo "=== Disk ===" && df -h
```

**Save as diagnostic.sh and run anytime:**
```bash
chmod +x diagnostic.sh
./diagnostic.sh
```

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Status:** Ready for Use



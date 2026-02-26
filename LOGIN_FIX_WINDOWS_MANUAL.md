ICP LOGIN FIX - MANUAL STEPS FOR WINDOWS USER
=============================================

Since SSH from Windows is having authentication issues, here are the steps you can take:

OPTION 1: Execute via PuTTY or MobaXterm (if you have these)
============================================================

Connect to: 10.2.0.6:22
Username: sif-vm1
Password: REDACTED_SSH_PASSWORD

Then paste these commands one by one:

# Step 1: Update .env configuration  
sed -i 's/^DB_MODE=.*/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/'  /home/sif-vm1/apps/icp-project-app/.env

# Step 2: Update test users in database
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'MYSQL_EOF'
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES 
('somnuk@mju.ac.th', '123456', 'Admin User', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'Super User', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'Regular User', 'user', 1);
MYSQL_EOF

# Step 3: Restart backend
pm2 restart icp-backend

# Step 4: Verify
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e "SELECT email, password, status FROM member WHERE email='somnuk@mju.ac.th';"


OPTION 2: Use WSL (Windows Subsystem for Linux) if available
============================================================

If you have WSL installed on Windows:

1. Open PowerShell and run: wsl

2. Then in the WSL terminal, use sshpass:

sudo apt-get install -y sshpass 2>/dev/null || echo "sshpass might already be installed"

sshpass -p 'REDACTED_SSH_PASSWORD' ssh -o StrictHostKeyChecking=no sif-vm1@10.2.0.6 'bash -s' <<'BASH_SCRIPT'
sed -i 's/^DB_MODE=.*/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'MYSQL_EOF'
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES 
('somnuk@mju.ac.th', '123456', 'Admin User', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'Super User', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'Regular User', 'user', 1);
MYSQL_EOF
pm2 restart icp-backend
echo "Done!"
BASH_SCRIPT


OPTION 3: Contact your server administrator
============================================================

If neither option works, contact the server administrator to execute the DIRECT_FIX_LOGIN.sh script:
bash /home/sif-vm1/apps/icp-project-app/DIRECT_FIX_LOGIN.sh


VERIFICATION
============================================================

After executing the fix, the test users should be able to login with:

Account 1 (Admin):
  Email: somnuk@mju.ac.th
  Password: 123456

Account 2 (Super User):
  Email: somnuk.sin1@gmail.com
  Password: 123456

Account 3 (Regular User):
  Email: somnuk.sin@gmail.com
  Password: 123456

Test login at: https://icp.sif.or.th/icp-project-app/

If login still fails, check:
1. Is VPN connected?
2. Can you reach https://icp.sif.or.th/icp-project-app/ (should load the app)?
3. Did you get any error message? (screenshot helps)



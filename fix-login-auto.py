#!/usr/bin/env python3
import subprocess
import sys

# Configuration
SERVER = "10.2.0.6"
USER = "sif-vm1"
PORT = 22
PASSWORD = "REDACTED_SSH_PASSWORD"

# All fixes in one bash script
FIXES = """
#!/bin/bash
set -e

echo "=========================================="
echo "ICP Login Fix - Applying All 3 Fixes"
echo "=========================================="
echo ""

echo "FIX 1: Updating .env..."
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env
echo "✅ Config updated"
echo ""

echo "FIX 2: Updating test users..."
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'EOSQL'
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES 
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1);
SELECT 'USERS UPDATED' as DONE;
EOSQL
echo "✅ Users updated"
echo ""

echo "FIX 3: Restarting backend..."
pm2 restart icp-backend
sleep 3
pm2 status
echo "✅ Backend restarted"
echo ""

echo "=========================================="
echo "✅ ALL FIXES APPLIED!"
echo "=========================================="
"""

print("🚀 ICP Backend - Automated Login Fix\n")

try:
    print("Executing fixes via SSH...")
    print("(Requires sshpass or SSH key configured)\n")
    
    # Try with sshpass first
    proc = subprocess.Popen(
        f'echo "{FIXES}" | sshpass -p "{PASSWORD}" ssh -p {PORT} {USER}@{SERVER} bash -s',
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stdout, stderr = proc.communicate(timeout=60)
    
    if proc.returncode == 0:
        print(stdout)
        print("\n" + "=" * 50)
        print("✅ SUCCESS! All fixes have been applied!")
        print("=" * 50)
        print("\nNext steps:")
        print("  1. curl http://10.2.0.6:3000/health")
        print("  2. https://icp.sif.or.th/icp-project-app/")
        print("  3. Login: somnuk@mju.ac.th / 123456\n")
    else:
        print(f"Error: {stderr}\n")
        print("sshpass may not be installed.")
        print("Install with: choco install sshpass")
        
except Exception as e:
    print(f"Error: {e}\n")
    print("Alternative: Run RUN-FIX-NOW.ps1 and enter password when prompted")



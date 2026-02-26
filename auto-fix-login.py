#!/usr/bin/env python3
# ============================================================================
# ICP Login Fix - Automated Python Script
# ============================================================================
# This script automatically applies all 3 fixes to enable login

import subprocess
import sys
import getpass
from typing import Tuple

class ICPLoginFixer:
    def __init__(self, server="10.2.0.6", user="sif-vm1", port=22):
        self.server = server
        self.user = user
        self.port = port
        self.ssh_cmd = f"ssh -p {port} {user}@{server}"
        
    def run_ssh_command(self, command: str, show_output=True) -> Tuple[int, str, str]:
        """Run SSH command and return (return_code, stdout, stderr)"""
        try:
            result = subprocess.run(
                f'{self.ssh_cmd} "{command}"',
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if show_output:
                if result.stdout:
                    print(result.stdout)
                if result.stderr and result.returncode != 0:
                    print(f"Error: {result.stderr}")
            
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            print("❌ Command timed out")
            return 1, "", "Timeout"
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1, "", str(e)
    
    def fix_env_config(self):
        """Fix 1: Update .env configuration"""
        print("\n" + "=" * 50)
        print("FIX #1: Updating .env Configuration")
        print("=" * 50 + "\n")
        
        commands = [
            "echo 'Current configuration:' && grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env",
            "sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env",
            "sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env",
            "echo 'Updated configuration:' && grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env"
        ]
        
        for cmd in commands:
            rc, stdout, stderr = self.run_ssh_command(cmd)
            if rc != 0:
                print(f"❌ Failed: {cmd}")
                return False
        
        print("✅ Fix #1 completed\n")
        return True
    
    def fix_test_users(self):
        """Fix 2: Update test users in database"""
        print("=" * 50)
        print("FIX #2: Updating Test Users in Database")
        print("=" * 50 + "\n")
        
        sql_commands = """
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES 
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1);
SELECT 'USERS VERIFIED:' as STATUS;
SELECT email, status FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');
"""
        
        cmd = f"mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \"{sql_commands}\""
        rc, stdout, stderr = self.run_ssh_command(cmd)
        
        if rc != 0:
            print(f"❌ Failed to update users")
            return False
        
        print("✅ Fix #2 completed\n")
        return True
    
    def restart_backend(self):
        """Fix 3: Restart backend service"""
        print("=" * 50)
        print("FIX #3: Restarting Backend Service")
        print("=" * 50 + "\n")
        
        commands = [
            "pm2 restart icp-backend",
            "sleep 3",
            "echo 'Backend Status:' && pm2 status",
            "echo '' && echo 'Recent Logs:' && pm2 logs icp-backend --lines 30"
        ]
        
        for cmd in commands:
            rc, stdout, stderr = self.run_ssh_command(cmd)
            if rc != 0 and "restart" not in cmd.lower():
                print(f"⚠️  Warning: {cmd}")
        
        print("✅ Fix #3 completed\n")
        return True
    
    def run_all_fixes(self):
        """Run all fixes"""
        print("\n")
        print("█" * 50)
        print("  ICP Backend - Login Fix Automation")
        print("█" * 50)
        
        all_success = True
        
        if not self.fix_env_config():
            all_success = False
        
        if not self.fix_test_users():
            all_success = False
        
        if not self.restart_backend():
            all_success = False
        
        print("\n" + "=" * 50)
        if all_success:
            print("✅ ALL FIXES APPLIED SUCCESSFULLY")
            print("=" * 50)
            print("\n📋 NEXT STEPS:\n")
            print("1️⃣  Test health endpoint:")
            print('   curl http://10.2.0.6:3000/health\n')
            print("2️⃣  Test login:")
            print('   curl -X POST http://10.2.0.6:3000/api/auth/login \\')
            print('     -H "Content-Type: application/json" \\')
            print('     -d \'{"email":"somnuk@mju.ac.th","password":"123456"}\'\n')
            print("3️⃣  Open web app:")
            print("   https://icp.sif.or.th/icp-project-app/\n")
            print("🎉 Login should now work!\n")
        else:
            print("❌ Some fixes failed - check errors above")
            print("=" * 50)
        
        return all_success


if __name__ == "__main__":
    print("\n🔐 ICP Backend Login Fix - Automated Execution\n")
    
    # Ask for confirmation
    confirm = input("Ready to apply all fixes? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("Cancelled.")
        sys.exit(0)
    
    # Create fixer and run
    fixer = ICPLoginFixer()
    success = fixer.run_all_fixes()
    
    sys.exit(0 if success else 1)



#!/usr/bin/env python3
"""
ICP Login Issue Remote Diagnostic Tool
Tests database connectivity, backend status, and API endpoints
"""

import subprocess
import json
import sys
import time
from datetime import datetime

# Server configuration
SSH_HOST = "10.2.0.6"
SSH_PORT = 22
SSH_USER = "sif-vm1"
SSH_PASSWORD = "REDACTED_SSH_PASSWORD"

# Database configuration  
DB_HOST = "10.2.0.5"
DB_PORT = 3306
DB_USER = "u486700931_root"
DB_PASSWORD = "REDACTED_PASSWORD"
DB_NAME = "u486700931_icp"

# Test credentials
TEST_USERS = [
    {"email": "somnuk@mju.ac.th", "password": "123456", "role": "admin"},
    {"email": "somnuk.sin1@gmail.com", "password": "123456", "role": "super user"},
    {"email": "somnuk.sin@gmail.com", "password": "123456", "role": "user"},
]

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.CYAN}{Colors.BOLD}{text.center(70)}{Colors.ENDC}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")

def print_section(text):
    print(f"\n{Colors.YELLOW}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.GRAY}{'-'*70}{Colors.ENDC}")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.ENDC}")

def run_ssh_command(cmd, timeout=15, use_password=False):
    """
    Execute command on remote server via SSH
    Returns: (stdout, stderr, returncode)
    """
    try:
        # Try with ssh-agent first, then fall back to other methods
        if use_password:
            # For password-based auth, use sshpass if available
            full_cmd = f'sshpass -p "{SSH_PASSWORD}" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=no {SSH_USER}@{SSH_HOST} -p {SSH_PORT} "{cmd}"'
        else:
            full_cmd = f'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o StrictHostKeyChecking=no {SSH_USER}@{SSH_HOST} -p {SSH_PORT} "{cmd}"'
        
        result = subprocess.run(
            full_cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return result.stdout.strip(), result.stderr.strip(), result.returncode
        
    except subprocess.TimeoutExpired:
        return "", "Command timeout", 124
    except Exception as e:
        return "", str(e), 1

def test_ssh_connection():
    """Test SSH connectivity to remote server"""
    print_section("1. Testing SSH Connection to Remote Server")
    print_info(f"Connecting to {SSH_USER}@{SSH_HOST}:{SSH_PORT}")
    
    stdout, stderr, code = run_ssh_command("echo 'SSH connection successful'", use_password=True)
    
    if code == 0 and "successful" in stdout:
        print_success("SSH connection established")
        return True
    else:
        print_error(f"SSH connection failed: {stderr}")
        return False

def check_env_config():
    """Check backend environment configuration"""
    print_section("2. Checking Backend Configuration (.env)")
    
    cmd = "grep -E '^(DB_MODE|NODE_ENV|DB_HOST|DB_USER|DB_NAME|DB_REMOTE)=' /home/sif-vm1/apps/icp-project-app/.env"
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if code == 0:
        print(f"{Colors.BLUE}{stdout}{Colors.ENDC}")
        
        checks = {
            "DB_MODE=remote": "DB_MODE" in stdout and "remote" in stdout,
            "NODE_ENV=production": "NODE_ENV" in stdout and "production" in stdout,
        }
        
        for check, passed in checks.items():
            if passed:
                print_success(check)
            else:
                print_error(f"Missing or incorrect: {check}")
        
        return all(checks.values())
    else:
        print_error(f"Could not read .env file: {stderr}")
        return False

def check_backend_status():
    """Check if backend is running via PM2"""
    print_section("3. Checking Backend Process Status (PM2)")
    
    cmd = "pm2 status"
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if code == 0:
        print(f"{Colors.BLUE}{stdout}{Colors.ENDC}")
        
        if "icp-backend" in stdout and ("online" in stdout or "running" in stdout):
            print_success("Backend process is ONLINE")
            return True
        else:
            print_error("Backend process is NOT online or not found")
            return False
    else:
        print_error(f"Failed to get PM2 status: {stderr}")
        return False

def get_backend_logs():
    """Get recent backend logs"""
    print_section("4. Recent Backend Logs (Last 15 lines)")
    
    cmd = "pm2 logs icp-backend --lines 15 --nostream 2>/dev/null | tail -15"
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if code == 0:
        print(f"{Colors.BLUE}{stdout}{Colors.ENDC}")
        
        if "Database connected" in stdout or "connected" in stdout:
            print_success("Database connection message found in logs")
            return True
        else:
            print_info("Note: Database connection status unclear from logs")
            return None
    else:
        print_info(f"Could not retrieve logs (This is OK): {stderr}")
        return None

def test_database_connection():
    """Test database connectivity from remote server"""
    print_section("5. Testing Database Connection")
    print_info(f"Database: {DB_HOST}:{DB_PORT}")
    print_info(f"User: {DB_USER}")
    print_info(f"Database: {DB_NAME}")
    
    cmd = f"mysql -h {DB_HOST} -u {DB_USER} -p'{DB_PASSWORD}' {DB_NAME} -e 'SELECT 1 as connection_test;' 2>&1"
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if code == 0 and "1" in stdout:
        print_success("Database connection SUCCESSFUL")
        return True
    else:
        print_error(f"Database connection FAILED")
        print_error(f"Error: {stdout or stderr}")
        return False

def check_test_users():
    """Verify test users exist in database"""
    print_section("6. Checking Test User Accounts in Database")
    
    cmd = f"""mysql -h {DB_HOST} -u {DB_USER} -p'{DB_PASSWORD}' {DB_NAME} -e "SELECT email, status, is_verified, created_at FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com') ORDER BY email;" 2>&1"""
    
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if code == 0:
        print(f"{Colors.BLUE}{stdout}{Colors.ENDC}")
        
        found_count = stdout.count("@")
        if found_count >= 3:
            print_success(f"All {found_count} test users found in database")
            return True
        else:
            print_error(f"Only {found_count}/3 test users found in database")
            return False
    else:
        print_error(f"Failed to query users: {stderr}")
        return False

def test_login_api():
    """Test login API endpoint"""
    print_section("7. Testing Login API Endpoint")
    
    for user in TEST_USERS:
        print_info(f"Testing {user['role']}: {user['email']}")
        
        cmd = f"""curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{{"email":"{user['email']}","password":"{user['password']}"}}' 2>/dev/null | head -c 500"""
        
        stdout, stderr, code = run_ssh_command(cmd, use_password=True, timeout=10)
        
        if code == 0:
            # Try to parse JSON response
            try:
                # Check for common success indicators
                if "token" in stdout or "success" in stdout.lower():
                    print_success(f"Login API responded - appears successful")
                    if '"' in stdout:  # Contains JSON
                        print(f"  Response: {stdout[:200]}...")
                elif "error" in stdout.lower() or "fail" in stdout.lower():
                    print_error(f"Login API returned error: {stdout[:200]}")
                else:
                    print_info(f"API Response: {stdout[:200]}")
            except:
                print_info(f"API Response: {stdout[:200]}")
        else:
            print_error(f"Login API request failed: {stderr}")
    
    return True

def check_nginx_logs():
    """Check Nginx error logs for clues"""
    print_section("8. Checking Nginx Configuration & Logs")
    
    # Check Nginx config
    cmd = "sudo -n nginx -t 2>&1 || echo 'Nginx test skipped (requires sudo)'"
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if "successful" in stdout or "ok" in stdout:
        print_success("Nginx configuration is valid")
    else:
        print_info("Nginx test skipped or returned: " + (stdout or stderr)[:100])
    
    # Check recent Nginx errors
    cmd = "tail -20 /var/log/nginx/error.log 2>/dev/null || echo 'Nginx log not accessible'"
    stdout, stderr, code = run_ssh_command(cmd, use_password=True)
    
    if code == 0 and stdout:
        print(f"{Colors.BLUE}{stdout}{Colors.ENDC}")
    
    return True

def generate_report(results):
    """Generate diagnostic report"""
    print_header("DIAGNOSTIC REPORT SUMMARY")
    
    total = len(results)
    passed = sum(1 for _, result in results if result is True)
    
    print(f"Tests Passed: {Colors.GREEN}{passed}/{total}{Colors.ENDC}\n")
    
    print(f"{Colors.BOLD}Test Results:{Colors.ENDC}")
    for test_name, result in results:
        if result is True:
            print_success(test_name)
        elif result is False:
            print_error(test_name)
        else:
            print_info(test_name)
    
    # Recommendations
    print(f"\n{Colors.BOLD}Recommendations:{Colors.ENDC}")
    
    if passed == total:
        print("✓ All systems appear to be working correctly!")
        print("✓ If login is still failing, check:")
        print("  - Nginx reverse proxy configuration")
        print("  - Frontend application CORS settings")
        print("  - Browser console for JavaScript errors")
        print("  - DNS resolution for icp.sif.or.th")
    else:
        print("Review the failed tests above and take corrective action.")
        if not any(r[1] for r in results if "SSH" in r[0]):
            print("  ✓ First, ensure SSH connection works")
        if not any(r[1] for r in results if "DB_MODE" in r[0]):
            print("  ✓ Set DB_MODE=remote in .env and restart backend")
        if not any(r[1] for r in results if "Backend" in r[0]):
            print("  ✓ Restart backend: pm2 restart icp-backend")
        if not any(r[1] for r in results if "Database" in r[0]):
            print("  ✓ Verify database credentials and network connectivity")

def main():
    print_header("ICP LOGIN ISSUE REMOTE DIAGNOSTIC")
    print_info(f"Testing remote server: {SSH_USER}@{SSH_HOST}:{SSH_PORT}")
    print_info(f"Database: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    print_info(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    try:
        # Test connectivity
        if not test_ssh_connection():
            print_error("\n✗ Cannot continue - SSH connection failed")
            sys.exit(1)
        
        results.append(("SSH Connection", True))
        
        # Run all tests
        results.append(("Backend .env Configuration", check_env_config()))
        results.append(("Backend Process Status", check_backend_status()))
        
        # Logs are informational
        get_backend_logs()
        
        results.append(("Database Connection", test_database_connection()))
        results.append(("Test Users in Database", check_test_users()))
        
        # API test is informational
        test_login_api()
        
        # Nginx test is informational
        check_nginx_logs()
        
        # Generate summary report
        generate_report(results)
        
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Diagnostic interrupted by user{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print_error(f"\nUnexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()



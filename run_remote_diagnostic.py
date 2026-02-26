#!/usr/bin/env python3
import subprocess
import json

# Configuration
SSH_HOST = "10.2.0.6"
SSH_USER = "sif-vm1"
SSH_PASSWORD = "REDACTED_SSH_PASSWORD"

def run_remote_command(cmd):
    """Run command on remote server and return output"""
    try:
        # Use SSH with password via stdin
        full_cmd = f'ssh -o StrictHostKeyChecking=no {SSH_USER}@{SSH_HOST} "{cmd}"'
        
        result = subprocess.run(
            full_cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=10,
            input=f"{SSH_PASSWORD}\n"
        )
        
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "", "Timeout", 1
    except Exception as e:
        return "", str(e), 1

# Tests to run
tests = []

print("=" * 70)
print("ICP REMOTE SERVER DIAGNOSTIC TEST")
print("=" * 70)
print(f"Target: {SSH_USER}@{SSH_HOST}")
print("=" * 70)
print()

# Test 1: Check .env configuration
print("1️⃣ Checking .env Configuration")
print("-" * 70)

cmd = "grep -E '^(DB_MODE|NODE_ENV|DB_REMOTE)' /home/sif-vm1/apps/icp-project-app/.env"
stdout, stderr, code = run_remote_command(cmd)

if code == 0 and stdout:
    print(stdout)
    if "DB_MODE=remote" in stdout:
        print("✅ DB_MODE is set to REMOTE")
        tests.append(("DB_MODE", True))
    else:
        print("❌ DB_MODE is NOT set to REMOTE")
        tests.append(("DB_MODE", False))
else:
    print("❌ Could not read .env file")
    tests.append(("DB_MODE", False))

print()

# Test 2: Backend status
print("2️⃣ Checking Backend Status")
print("-" * 70)

cmd = "pm2 status | grep -A5 icp-backend || echo 'Backend not found'"
stdout, stderr, code = run_remote_command(cmd)

print(stdout)
if "icp-backend" in stdout and ("online" in stdout or "running" in stdout):
    print("✅ Backend is ONLINE")
    tests.append(("Backend Status", True))
else:
    print("❌ Backend is NOT online")
    tests.append(("Backend Status", False))

print()

# Test 3: Database connection
print("3️⃣ Testing Database Connection")
print("-" * 70)

cmd = "mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e 'SELECT 1' 2>&1"
stdout, stderr, code = run_remote_command(cmd)

if "1" in stdout:
    print("✅ Database connection SUCCESSFUL")
    tests.append(("Database Connection", True))
else:
    print("❌ Database connection FAILED")
    print(f"Error: {stdout} {stderr}")
    tests.append(("Database Connection", False))

print()

# Test 4: Check test users
print("4️⃣ Checking Test Users in Database")
print("-" * 70)

cmd = "mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \"SELECT email, status, is_verified FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');\" 2>&1"
stdout, stderr, code = run_remote_command(cmd)

print(stdout)
if "somnuk@" in stdout:
    print("✅ Test users FOUND in database")
    tests.append(("Test Users", True))
else:
    print("❌ Test users NOT found in database")
    tests.append(("Test Users", False))

print()

# Test 5: Backend logs
print("5️⃣ Checking Backend Logs")
print("-" * 70)

cmd = "pm2 logs icp-backend --lines 20 --nostream 2>&1 | tail -20"
stdout, stderr, code = run_remote_command(cmd)

print(stdout)
if "Database connected" in stdout:
    print("✅ Backend is connected to database")
    if "REMOTE" in stdout:
        print("✅ Using REMOTE database")
        tests.append(("Database Mode", True))
    else:
        print("❌ Using LOCAL database (should be REMOTE)")
        tests.append(("Database Mode", False))
else:
    print("⚠️ Could not determine database status from logs")
    tests.append(("Database Mode", None))

print()

# Test 6: API test
print("6️⃣ Testing Login API")
print("-" * 70)

cmd = """curl -s -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}' 2>&1"""

stdout, stderr, code = run_remote_command(cmd)

print(f"Response: {stdout[:200]}")
if "token" in stdout:
    print("✅ Login API WORKING - token returned")
    tests.append(("Login API", True))
elif "error" in stdout:
    print("❌ Login API returned error")
    tests.append(("Login API", False))
else:
    print("❌ Login API not responding")
    tests.append(("Login API", False))

print()

# Summary
print("=" * 70)
print("📊 TEST SUMMARY")
print("=" * 70)

passed = 0
failed = 0
unknown = 0

for test_name, result in tests:
    if result is True:
        print(f"✅ {test_name}: PASS")
        passed += 1
    elif result is False:
        print(f"❌ {test_name}: FAIL")
        failed += 1
    else:
        print(f"⚠️  {test_name}: UNKNOWN")
        unknown += 1

print()
print(f"Total: {passed} passed, {failed} failed, {unknown} unknown")

if failed == 0 and unknown == 0:
    print("\n🎉 All tests passed!")
else:
    print("\n⚠️ Some tests failed. See details above.")

print("=" * 70)



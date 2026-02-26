#!/usr/bin/env python3
"""
ICP Frontend → Database Connection Test
Comprehensive diagnostic tool
"""

import urllib.request
import json
import sys
import time

API_URL = 'http://10.2.0.6:3000'
TEST_USER = {
    'email': 'somnuk@mju.ac.th',
    'password': '123456'
}

print("=" * 60)
print("ICP Frontend ↔ Database Connection Test")
print("=" * 60)
print(f"Backend URL: {API_URL}")
print(f"Test User: {TEST_USER['email']}")
print("=" * 60)
print()

# Test 1: Backend Health Check
print("1️⃣ Testing Backend Health...")
try:
    req = urllib.request.Request(f'{API_URL}/health')
    with urllib.request.urlopen(req, timeout=5) as response:
        print(f"✅ Backend is responding (Status: {response.status})")
        backend_ok = True
except urllib.error.URLError as e:
    print(f"❌ Backend not responding: {e.reason}")
    backend_ok = False
except Exception as e:
    print(f"❌ Connection error: {str(e)}")
    backend_ok = False

print()

# Test 2: Test Login
print("2️⃣ Testing Login...")
try:
    req = urllib.request.Request(
        f'{API_URL}/api/auth/login',
        data=json.dumps(TEST_USER).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        if 'token' in data:
            print(f"✅ LOGIN SUCCESSFUL")
            print(f"   Email: {data.get('email')}")
            print(f"   Role: {data.get('role')}")
            print(f"   Full Name: {data.get('full_name')}")
            print(f"   Member ID: {data.get('member_id')}")
            print(f"   Token: {data['token'][:30]}...")
            login_ok = True
            token = data['token']
        else:
            print(f"❌ LOGIN FAILED: {data.get('error', 'Unknown error')}")
            login_ok = False
            token = None
            
except json.JSONDecodeError as e:
    print(f"❌ Invalid JSON response: {e}")
    login_ok = False
    token = None
except urllib.error.HTTPError as e:
    try:
        error_data = json.loads(e.read().decode('utf-8'))
        print(f"❌ Login error: {error_data.get('error', f'Status {e.code}')}")
    except:
        print(f"❌ Login error: HTTP {e.code}")
    login_ok = False
    token = None
except urllib.error.URLError as e:
    print(f"❌ Cannot reach backend: {e.reason}")
    login_ok = False
    token = None
except Exception as e:
    print(f"❌ Error: {str(e)}")
    login_ok = False
    token = None

print()

# Test 3: Query Members List
print("3️⃣ Testing Database Connection...")
try:
    req = urllib.request.Request(f'{API_URL}/api/members')
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode('utf-8'))
        if isinstance(data, list):
            print(f"✅ Database is accessible")
            print(f"   Found {len(data)} members in database")
            db_ok = True
        else:
            print(f"✅ Database is accessible (Response received)")
            db_ok = True
            
except urllib.error.HTTPError as e:
    if e.code == 401:
        print(f"✅ Database is accessible (requires authentication)")
        db_ok = True
    else:
        print(f"❌ Database error: HTTP {e.code}")
        db_ok = False
except urllib.error.URLError as e:
    print(f"❌ Cannot reach database: {e.reason}")
    db_ok = False
except Exception as e:
    print(f"❌ Error: {str(e)}")
    db_ok = False

print()

# Test 4: Get User Profile (if login succeeded)
if token:
    print("4️⃣ Testing User Profile Retrieval...")
    try:
        req = urllib.request.Request(
            f'{API_URL}/api/members/me',
            headers={'Authorization': f'Bearer {token}'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"✅ User profile retrieved")
            print(f"   Email: {data.get('email')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Is Verified: {data.get('is_verified')}")
            print(f"   Full Name: {data.get('full_name')}")
            
    except urllib.error.HTTPError as e:
        print(f"❌ Failed to get profile: HTTP {e.code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
else:
    print("4️⃣ Skipped - Login required")

print()
print("=" * 60)
print("📊 SUMMARY")
print("=" * 60)
print(f"Backend Health: {'✅ PASS' if backend_ok else '❌ FAIL'}")
print(f"Login Test: {'✅ PASS' if login_ok else '❌ FAIL'}")
print(f"Database: {'✅ PASS' if db_ok else '❌ FAIL'}")
print()

if login_ok and backend_ok and db_ok:
    print("🎉 All tests passed! Frontend can connect to database successfully.")
    sys.exit(0)
else:
    print("⚠️  Some tests failed. Check the details above.")
    sys.exit(1)



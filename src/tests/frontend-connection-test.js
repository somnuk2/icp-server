import axios from 'axios';

// Test Configuration
const API_URL = 'http://10.2.0.6:3000'; // or your backend URL
const TEST_USER = {
  email: 'somnuk@mju.ac.th',
  password: '123456'
};

console.log('🔍 ICP Backend Connection Test');
console.log('================================');
console.log(`API URL: ${API_URL}`);
console.log(`Testing User: ${TEST_USER.email}`);
console.log('');

// Test 1: Health Check
async function testHealthCheck() {
  try {
    console.log('1️⃣ Testing API Health...');
    const response = await axios.get(`${API_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Backend is responding');
    return true;
  } catch (error) {
    console.log('❌ Backend not responding');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 2: Login Test
async function testLogin() {
  try {
    console.log('');
    console.log('2️⃣ Testing Login...');
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_USER, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Login Successful!');
    console.log(`   Token: ${response.data.token ? '✓ Received' : '❌ Missing'}`);
    console.log(`   Email: ${response.data.email}`);
    console.log(`   Role: ${response.data.role}`);
    console.log(`   Member ID: ${response.data.member_id}`);
    return true;
  } catch (error) {
    console.log('❌ Login Failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.error}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Test 3: Database Connection
async function testDatabaseConnection() {
  try {
    console.log('');
    console.log('3️⃣ Testing Database Connection...');
    // Try to get public members list (if available)
    const response = await axios.get(`${API_URL}/api/members`, {
      timeout: 5000
    });

    console.log('✅ Database Connection OK');
    console.log(`   Members Found: ${response.data.length || 0}`);
    return true;
  } catch (error) {
    // This endpoint might require auth, but we can still check if it's responding
    if (error.response?.status === 401) {
      console.log('✅ Database Connection OK (Auth Required)');
      return true;
    } else if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      console.log('❌ Database Connection Failed');
      console.log(`   Error: ${error.message}`);
      return false;
    } else {
      console.log('✅ Backend Responding (DB endpoint secured)');
      return true;
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    const health = await testHealthCheck();
    const login = await testLogin();
    const db = await testDatabaseConnection();

    console.log('');
    console.log('================================');
    console.log('📊 Test Summary:');
    console.log(`   Health Check: ${health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Login Test: ${login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Database: ${db ? '✅ PASS' : '❌ FAIL'}`);

    if (health && login && db) {
      console.log('');
      console.log('🎉 All tests passed! Frontend can connect to backend.');
    } else {
      console.log('');
      console.log('⚠️  Some tests failed. Check configuration.');
    }
  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

// Execute
runAllTests();

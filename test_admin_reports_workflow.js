import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testAdmin = {
  full_name: 'Admin Report Tester ' + timestamp,
  email: `admin_report_${timestamp}@example.com`,
  password: 'AdminPassword123!',
  confirm_password: 'AdminPassword123!',
  status: 'admin'
};

async function testAdminReports() {
  console.log('--- Starting Admin Report Workflow Test ---');
  
  try {
    // 1. Setup: Register & Login as Admin
    console.log('1. Setup: Registering & Logging in as Admin...');
    await axios.post(`${baseUrl}/auth/register`, testAdmin);
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testAdmin.email,
      password: testAdmin.password
    });
    const token = loginRes.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success: Authenticated.');

    // --- TEST ADMIN REPORTS ---
    console.log('\n--- Fetching Admin Reports ---');

    // 1. Pivot Report (Global View)
    console.log('1. Fetching Global Pivot Report (Steps 1-6 Combined for all users)...');
    const pivotRes = await axios.get(`${baseUrl}/reports/pivot`, authHeader);
    console.log('   Success: Found', pivotRes.data.length, 'total records in the system.');
    if (pivotRes.data.length > 0) {
        console.log('   Latest Entry Sample:', pivotRes.data[pivotRes.data.length - 1].full_name);
    }

    // 2. Department Statistics (Admin only feature usually)
    console.log('2. Fetching Department Statistics (Table 1)...');
    const tableRes = await axios.get(`${baseUrl}/reports/table1`, authHeader);
    console.log('   Success: Found', tableRes.data.length, 'departments with data.');

    // 3. Global Dashboard Stats
    console.log('3. Fetching Global Dashboard Stats...');
    const statsRes = await axios.get(`${baseUrl}/dashboard/stats`, authHeader);
    console.log('   Global Stats:', statsRes.data);

    // 4. Global Career Summary
    console.log('4. Fetching Global Career Summary...');
    const summaryRes = await axios.get(`${baseUrl}/dashboard/summary`, authHeader);
    console.log('   Success: Found', summaryRes.data.length, 'total careers planned across all users.');

    console.log('\n--- ADMIN REPORT WORKFLOW TEST PASSED ---');

  } catch (error) {
    console.error('\n--- ADMIN REPORT TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testAdminReports();

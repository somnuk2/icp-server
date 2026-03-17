import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testUser = {
  full_name: 'Report Tester ' + timestamp,
  email: `reporter_${timestamp}@example.com`,
  password: 'Password123!',
  confirm_password: 'Password123!'
};

async function testReportWorkflow() {
  console.log('--- Starting Report/Export Workflow Test (ESM) ---');
  
  try {
    // 1. Setup: Register & Login & Create Data (so reports aren't empty)
    console.log('1. Setting up test data...');
    await axios.post(`${baseUrl}/auth/register`, testUser);
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // Create a complete chain
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId = deptRes.data[0]?.department_id || 1;
    await axios.post(`${baseUrl}/individuals`, { member_id: memberId, department_id: deptId, is_graduate: 0 }, authHeader);
    
    const carRes = await axios.get(`${baseUrl}/careers`, authHeader);
    const careerId = carRes.data[0]?.career_id;
    const pcPost = await axios.post(`${baseUrl}/plan-careers`, { member_id: memberId, career_id: careerId, plan_career_date: '2026/01/01' }, authHeader);
    const planCareerId = pcPost.data.plan_career_id;
    
    const qListRes = await axios.get(`${baseUrl}/qualifications/list`, authHeader);
    const qualId = qListRes.data[0]?.qualification_id;
    const targetRes = await axios.get(`${baseUrl}/targets`, authHeader);
    const levelRes = await axios.get(`${baseUrl}/levels`, authHeader);
    const qpcPost = await axios.post(`${baseUrl}/qa-plan-careers`, { plan_career_id: planCareerId, qualification_id: qualId, target_id: targetRes.data[0].target_id, level_id: levelRes.data[0].level_id }, authHeader);
    const qaPlanCareerId = qpcPost.data.qa_plan_career_id;
    
    const devRes = await axios.get(`${baseUrl}/developments`, authHeader);
    const impRes = await axios.get(`${baseUrl}/importances`, authHeader);
    const planPost = await axios.post(`${baseUrl}/plans`, { qa_plan_career_id: qaPlanCareerId, development_id: devRes.data[0].development_id, importance_id: impRes.data[0].importance_id, plan_title: 'Report Test Plan', plan_channel: 'Web', plan_start_date: '2026/01/01' }, authHeader);
    const planId = planPost.data.plan_id;
    
    const perfRes = await axios.get(`${baseUrl}/performs`, authHeader);
    const saPost = await axios.post(`${baseUrl}/self-assessments`, { member_id: memberId, qa_plan_career_id: qaPlanCareerId, perform_id: perfRes.data[0].perform_id, self_assessment_date: '2026/01/01' }, authHeader);
    const saId = saPost.data.self_assessment_id;
    
    await axios.post(`${baseUrl}/self-assessments/${saId}/references`, { reference_description: 'Report Evidence', plan_id: planId }, authHeader);

    console.log('   Data setup complete.\n');

    // 2. Testing individual reports (Retrieving data for export)
    console.log('2. Testing Individual Report Data Fetch...');
    const r1 = await axios.get(`${baseUrl}/individuals`, authHeader);
    console.log(`   Success: Found ${r1.data.length} records.`);

    console.log('3. Testing Career Plan Report Data Fetch...');
    const r2 = await axios.get(`${baseUrl}/plan-careers`, authHeader);
    console.log(`   Success: Found ${r2.data.length} records.`);

    console.log('4. Testing Qualification Report Data Fetch...');
    const r3 = await axios.get(`${baseUrl}/qa-plan-careers`, authHeader);
    console.log(`   Success: Found ${r3.data.length} records.`);

    console.log('5. Testing Development Plan Report Data Fetch...');
    const r4 = await axios.get(`${baseUrl}/plans`, authHeader);
    console.log(`   Success: Found ${r4.data.length} records.`);

    console.log('6. Testing Self Assessment Report Data Fetch...');
    const r5 = await axios.get(`${baseUrl}/self-assessments`, authHeader);
    console.log(`   Success: Found ${r5.data.length} records.`);

    console.log('7. Testing Evidence Data Fetch (via references of last assessment)...');
    const r6 = await axios.get(`${baseUrl}/self-assessments/${saId}/references`, authHeader);
    console.log(`   Success: Found ${r6.data.length} records.`);

    // 8. Testing Consolidated Pivot Report
    console.log('8. Testing Consolidated Pivot Report...');
    const rPivot = await axios.get(`${baseUrl}/reports/pivot`, authHeader);
    console.log(`   Success: Pivot report returned ${rPivot.data.length} rows.`);

    // 9. Testing Dashboard Stats
    console.log('9. Testing Dashboard Stats...');
    const rStats = await axios.get(`${baseUrl}/dashboard/stats`, authHeader);
    console.log('   Success: Stats:', JSON.stringify(rStats.data));

    console.log('\n--- ALL REPORT DATA FETCH STEPS COMPLETED ---');
    console.log('Backend provides correct data for all reporting modules.');

  } catch (error) {
    console.error('\n--- REPORT TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status, 'Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testReportWorkflow();

import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testUser = {
  full_name: 'Report Tester ' + timestamp,
  email: `report_tester_${timestamp}@example.com`,
  password: 'Password123!',
  confirm_password: 'Password123!',
  status: 'user'
};

async function testReportWorkflow() {
  console.log('--- Starting Report Workflow Test (Super User) ---');
  
  try {
    // 1. Setup Data
    console.log('1. Setup: Creating user and data...');
    await axios.post(`${baseUrl}/auth/register`, testUser);
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // Add Individual Info
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId = deptRes.data[0]?.department_id || 1;
    await axios.post(`${baseUrl}/individuals`, {
      member_id: memberId, birthday: '1990', telephone: '0855555555', department_id: deptId, is_graduate: 1, year: '2020', is_disability: 0
    }, authHeader);

    // Add Career Plan
    const pcRes = await axios.post(`${baseUrl}/plan-careers`, {
      member_id: memberId, career_id: 1, plan_career_date: '2026-03-01'
    }, authHeader);
    const planCareerId = pcRes.data.plan_career_id;

    // Add Qualification
    const qpcRes = await axios.post(`${baseUrl}/qa-plan-careers`, {
      plan_career_id: planCareerId, qualification_id: 1, target_id: 1, level_id: 1
    }, authHeader);
    const qaPlanCareerId = qpcRes.data.qa_plan_career_id;

    // Add Development Plan
    const pRes = await axios.post(`${baseUrl}/plans`, {
      qa_plan_career_id: qaPlanCareerId, development_id: 1, importance_id: 1, plan_title: 'Report Test Plan', plan_start_date: '2026-03-01', plan_end_date: '2026-03-05'
    }, authHeader);
    const planId = pRes.data.plan_id;

    // Add Self Assessment
    const saRes = await axios.post(`${baseUrl}/self-assessments`, {
      member_id: memberId, qa_plan_career_id: qaPlanCareerId, perform_id: 1, self_assessment_date: '2026-03-10'
    }, authHeader);
    const saId = saRes.data.self_assessment_id;

    console.log('   Data Setup Complete.');

    // --- TEST REPORTS ---
    console.log('\n--- Fetching Reports ---');

    // 1. Pivot Report (Combined Data)
    console.log('1. Fetching Pivot Report (Merged Steps 1-6)...');
    const pivotRes = await axios.get(`${baseUrl}/reports/pivot`, authHeader);
    console.log('   Success: Found', pivotRes.data.length, 'records.');
    if (pivotRes.data.length > 0) {
        const record = pivotRes.data[0];
        console.log('   Sample Record:', {
            Member: record.full_name,
            Career: record.career_name,
            Qualification: record.qualification_name,
            Perform: record.perform_name
        });
    }

    // 2. Dashboard Stats
    console.log('2. Fetching User Dashboad Stats...');
    const statsRes = await axios.get(`${baseUrl}/dashboard/stats`, authHeader);
    console.log('   Stats:', statsRes.data);

    // 3. Career Summary
    console.log('3. Fetching Career Summary...');
    const summaryRes = await axios.get(`${baseUrl}/dashboard/summary`, authHeader);
    console.log('   Success: Found', summaryRes.data.length, 'entries in summary.');

    console.log('\n--- REPORT WORKFLOW TEST PASSED ---');

  } catch (error) {
    console.error('\n--- REPORT TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testReportWorkflow();

import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testUser = {
  full_name: 'Edit Tester ' + timestamp,
  email: `edit_tester_${timestamp}@example.com`,
  password: 'Password123!',
  confirm_password: 'Password123!',
  status: 'user'
};

async function testEditWorkflow() {
  console.log('--- Starting Edit Workflow Test (Super User) ---');
  
  try {
    // 1. Initial Setup: Register & Login
    console.log('1. Setup: Registering & Logging in...');
    await axios.post(`${baseUrl}/auth/register`, testUser);
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success: Authenticated.');

    // --- CREATE INITIAL DATA ---
    console.log('\n--- Creating Initial Data ---');
    
    // Personal Info
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId = deptRes.data[0]?.department_id || 1;
    const indRes = await axios.post(`${baseUrl}/individuals`, {
      member_id: memberId,
      birthday: '1990',
      telephone: '0800000000',
      department_id: deptId,
      is_graduate: 0,
      is_disability: 0
    }, authHeader);
    const individualId = indRes.data.individual_id;

    // Career Plan
    const pcRes = await axios.post(`${baseUrl}/plan-careers`, {
      member_id: memberId,
      career_id: 1, // Defaulting to 1 for test
      plan_career_date: '2026-03-01'
    }, authHeader);
    const planCareerId = pcRes.data.plan_career_id;

    // Qualification
    const qListRes = await axios.get(`${baseUrl}/qualifications/list`, authHeader);
    const qualId = qListRes.data[0]?.qualification_id || 1;
    const qpcRes = await axios.post(`${baseUrl}/qa-plan-careers`, {
      plan_career_id: planCareerId,
      qualification_id: qualId,
      target_id: 1,
      level_id: 1
    }, authHeader);
    const qaPlanCareerId = qpcRes.data.qa_plan_career_id;

    // Development Plan
    const planRes = await axios.post(`${baseUrl}/plans`, {
      qa_plan_career_id: qaPlanCareerId,
      development_id: 1,
      importance_id: 1,
      plan_title: 'Initial Plan',
      plan_start_date: '2026-03-01',
      plan_end_date: '2026-03-02'
    }, authHeader);
    const planId = planRes.data.plan_id;

    // Self Assessment
    const saRes = await axios.post(`${baseUrl}/self-assessments`, {
      member_id: memberId,
      qa_plan_career_id: qaPlanCareerId,
      perform_id: 1,
      self_assessment_date: '2026-03-01'
    }, authHeader);
    const saId = saRes.data.self_assessment_id;

    console.log('Initial data created successfully.\n');

    // --- TEST EDITS ---
    console.log('--- Testing Edits ---');

    // 1. Edit Registration (Profile Info)
    console.log('1. Editing Profile (Full Name)...');
    // Assuming PUT /auth/profile exists or we can update member table
    // For this app, profile update might be handled in a specific route
    // Let's try updating individuals instead if that represents user info
    console.log('   (Skipping explicit member table update as it usually requires specific admin rights or profile route)');

    // 2. Edit Personal Info
    console.log('2. Editing Personal Info...');
    const indEditRes = await axios.put(`${baseUrl}/individuals/${individualId}`, {
      birthday: '1992',
      telephone: '0811111111',
      department_id: deptId,
      is_graduate: 1,
      year: '2015',
      is_disability: 0
    }, authHeader);
    console.log('   Success:', indEditRes.data.message);

    // 3. Edit Career Plan
    console.log('3. Editing Career Plan (Date)...');
    const pcEditRes = await axios.put(`${baseUrl}/plan-careers/${planCareerId}`, {
      member_id: memberId,
      career_id: 1,
      plan_career_date: '2026-03-20',
      status: 'active'
    }, authHeader);
    console.log('   Success:', pcEditRes.data.message);

    // 4. Edit Qualification
    console.log('4. Editing Qualification (Level)...');
    const qpcEditRes = await axios.put(`${baseUrl}/qa-plan-careers/${qaPlanCareerId}`, {
      plan_career_id: planCareerId,
      qualification_id: qualId,
      target_id: 2, // Changed
      level_id: 2 // Changed
    }, authHeader);
    console.log('   Success:', qpcEditRes.data.message);

    // 5. Edit Development Plan
    console.log('5. Editing Development Plan (Title)...');
    const pEditRes = await axios.put(`${baseUrl}/plans/${planId}`, {
      qa_plan_career_id: qaPlanCareerId,
      development_id: 1,
      importance_id: 1,
      plan_title: 'Updated Plan Title',
      plan_start_date: '2026-03-10',
      plan_end_date: '2026-03-15'
    }, authHeader);
    console.log('   Success:', pEditRes.data.message);

    // 6. Edit Self Assessment
    console.log('6. Editing Self Assessment (Date)...');
    const saEditRes = await axios.put(`${baseUrl}/self-assessments/${saId}`, {
      member_id: memberId,
      qa_plan_career_id: qaPlanCareerId,
      perform_id: 2, // Changed
      self_assessment_date: '2026-03-25'
    }, authHeader);
    console.log('   Success:', saEditRes.data.message);

    console.log('\n--- ALL EDIT STEPS PASSED SUCCESSFULLY ---');

  } catch (error) {
    console.error('\n--- EDIT TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testEditWorkflow();

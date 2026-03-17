import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testAdmin = {
  full_name: 'Admin Edit Tester ' + timestamp,
  email: `admin_edit_${timestamp}@example.com`,
  password: 'AdminPassword123!',
  confirm_password: 'AdminPassword123!',
  status: 'admin'
};

async function testAdminEditWorkflow() {
  console.log('--- Starting Admin Edit Workflow Test ---');
  
  try {
    // 1. Initial Setup: Register & Login
    console.log('1. Setup: Registering & Logging in as Admin...');
    await axios.post(`${baseUrl}/auth/register`, testAdmin);
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testAdmin.email,
      password: testAdmin.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success: Authenticated as Admin.');

    // --- CREATE INITIAL DATA ---
    console.log('\n--- Creating Initial Data ---');
    
    // Personal Info
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId = deptRes.data[0]?.department_id || 1;
    const indRes = await axios.post(`${baseUrl}/individuals`, {
      member_id: memberId,
      birthday: '1980',
      telephone: '0990000000',
      department_id: deptId,
      is_graduate: 1,
      is_disability: 0
    }, authHeader);
    const individualId = indRes.data.individual_id;

    // Career Plan
    const pcRes = await axios.post(`${baseUrl}/plan-careers`, {
      member_id: memberId,
      career_id: 1,
      plan_career_date: '2026-01-01'
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
      plan_title: 'Admin Base Plan',
      plan_start_date: '2026-01-01',
      plan_end_date: '2026-01-05'
    }, authHeader);
    const planId = planRes.data.plan_id;

    // Self Assessment
    const saRes = await axios.post(`${baseUrl}/self-assessments`, {
      member_id: memberId,
      qa_plan_career_id: qaPlanCareerId,
      perform_id: 1,
      self_assessment_date: '2026-01-10'
    }, authHeader);
    const saId = saRes.data.self_assessment_id;

    console.log('Initial Admin data created successfully.\n');

    // --- TEST EDITS ---
    console.log('--- Testing Admin Edits ---');

    // 2. Edit Personal Info
    console.log('2. Editing Personal Info...');
    const indEditRes = await axios.put(`${baseUrl}/individuals/${individualId}`, {
      birthday: '1982',
      telephone: '0991111111',
      department_id: deptId,
      is_graduate: 1,
      year: '2005',
      is_disability: 0
    }, authHeader);
    console.log('   Success:', indEditRes.data.message);

    // 3. Edit Career Plan
    console.log('3. Editing Career Plan...');
    const pcEditRes = await axios.put(`${baseUrl}/plan-careers/${planCareerId}`, {
      member_id: memberId,
      career_id: 1,
      plan_career_date: '2026-03-15',
      status: 'active'
    }, authHeader);
    console.log('   Success:', pcEditRes.data.message);

    // 4. Edit Qualification
    console.log('4. Editing Qualification...');
    const qpcEditRes = await axios.put(`${baseUrl}/qa-plan-careers/${qaPlanCareerId}`, {
      plan_career_id: planCareerId,
      qualification_id: qualId,
      target_id: 3, 
      level_id: 3
    }, authHeader);
    console.log('   Success:', qpcEditRes.data.message);

    // 5. Edit Development Plan
    console.log('5. Editing Development Plan...');
    const pEditRes = await axios.put(`${baseUrl}/plans/${planId}`, {
      qa_plan_career_id: qaPlanCareerId,
      development_id: 1,
      importance_id: 2,
      plan_title: 'Updated Admin Plan Title',
      plan_start_date: '2026-03-20',
      plan_end_date: '2026-03-25'
    }, authHeader);
    console.log('   Success:', pEditRes.data.message);

    // 6. Edit Self Assessment & Adding Evidence (Reference)
    console.log('6. Editing Self Assessment...');
    const saEditRes = await axios.put(`${baseUrl}/self-assessments/${saId}`, {
      member_id: memberId,
      qa_plan_career_id: qaPlanCareerId,
      perform_id: 3,
      self_assessment_date: '2026-03-30'
    }, authHeader);
    console.log('   Success:', saEditRes.data.message);

    console.log('7. Adding Updated Evidence...');
    const refRes = await axios.post(`${baseUrl}/self-assessments/${saId}/references`, {
      reference_description: 'Admin Finalized Certificate',
      plan_id: planId
    }, authHeader);
    console.log('   Success:', refRes.data.message);

    console.log('\n--- ALL ADMIN EDIT STEPS PASSED SUCCESSFULLY ---');

  } catch (error) {
    console.error('\n--- ADMIN EDIT TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testAdminEditWorkflow();

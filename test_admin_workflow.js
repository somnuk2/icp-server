import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testAdmin = {
  full_name: 'Admin Tester ' + timestamp,
  email: `admin_${timestamp}@example.com`,
  password: 'AdminPassword123!',
  confirm_password: 'AdminPassword123!',
  status: 'admin' // Explicitly set to admin
};

async function testAdminWorkflow() {
  console.log('--- Starting Admin Workflow Test ---');
  
  try {
    // 1. Registration
    console.log('1. Registering admin...');
    const regRes = await axios.post(`${baseUrl}/auth/register`, testAdmin);
    console.log('   Success:', regRes.data.message);

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testAdmin.email,
      password: testAdmin.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    console.log('   Success: Token received, MemberID:', memberId, 'Role:', loginRes.data.role);

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Personal Info
    console.log('3. Fetching master data for Personal Info...');
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId = deptRes.data[0]?.department_id || 1;
    
    console.log('   Updating Personal Info...');
    const indRes = await axios.post(`${baseUrl}/individuals`, {
      member_id: memberId,
      birthday: '1985',
      telephone: '0987654321',
      department_id: deptId,
      is_graduate: 1,
      year: '2010',
      is_disability: 0
    }, authHeader);
    console.log('   Success:', indRes.data.message);

    // 4. Career Plan
    console.log('4. Adding Career Plan...');
    const carRes = await axios.get(`${baseUrl}/careers`, authHeader);
    let careerId = carRes.data[0]?.career_id;
    if (!careerId) {
        careerId = 1; // Fallback
    }

    const pcRes = await axios.post(`${baseUrl}/plan-careers`, {
      member_id: memberId,
      career_id: careerId,
      plan_career_date: new Date().toISOString().split('T')[0]
    }, authHeader);
    const planCareerId = pcRes.data.plan_career_id;
    console.log('   Success: PlanCareerID:', planCareerId);

    // 5. Qualification
    console.log('5. Adding Qualification...');
    const qlRes = await axios.get(`${baseUrl}/qualifications/list`, authHeader);
    const qualId = qlRes.data[0]?.qualification_id || 1;
    
    const targetRes = await axios.get(`${baseUrl}/references/targets`, authHeader);
    const targetId = targetRes.data[0]?.target_id || 1;
    
    const levelRes = await axios.get(`${baseUrl}/references/levels`, authHeader);
    const levelId = levelRes.data[0]?.level_id || 1;

    const qpcRes = await axios.post(`${baseUrl}/qa-plan-careers`, {
      plan_career_id: planCareerId,
      qualification_id: qualId,
      target_id: targetId,
      level_id: levelId
    }, authHeader);
    const qaPlanCareerId = qpcRes.data.qa_plan_career_id;
    console.log('   Success: QAPlanCareerID:', qaPlanCareerId);

    // 6. Development Plan
    console.log('6. Adding Development Plan...');
    const devRes = await axios.get(`${baseUrl}/references/developments`, authHeader);
    const devId = devRes.data[0]?.development_id || 1;
    
    const impRes = await axios.get(`${baseUrl}/references/importances`, authHeader);
    const impId = impRes.data[0]?.importance_id || 1;

    const planRes = await axios.post(`${baseUrl}/plans`, {
      qa_plan_career_id: qaPlanCareerId,
      development_id: devId,
      importance_id: impId,
      plan_title: 'Admin Master Plan',
      plan_channel: 'Internal Training',
      plan_start_date: '2026/04/01',
      plan_end_date: '2026/04/05'
    }, authHeader);
    const planId = planRes.data.plan_id;
    console.log('   Success: PlanID:', planId);

    // 7. Self Assessment & Evidence
    console.log('7. Performing Self Assessment...');
    const perfRes = await axios.get(`${baseUrl}/performs`, authHeader);
    const performId = perfRes.data[0]?.perform_id || 1;

    const saRes = await axios.post(`${baseUrl}/self-assessments`, {
      member_id: memberId,
      qa_plan_career_id: qaPlanCareerId,
      perform_id: performId,
      self_assessment_date: new Date().toISOString().split('T')[0]
    }, authHeader);
    const saId = saRes.data.self_assessment_id;
    console.log('   Success: SelfAssessmentID:', saId);

    console.log('8. Adding Evidence...');
    const refRes = await axios.post(`${baseUrl}/self-assessments/${saId}/references`, {
      reference_description: 'Admin Certified Document',
      plan_id: planId
    }, authHeader);
    console.log('   Success:', refRes.data.message);

    console.log('\n--- ADMIN WORKFLOW TEST PASSED ---');

  } catch (error) {
    console.error('\n--- ADMIN TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testAdminWorkflow();

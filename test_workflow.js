const axios = require('axios');

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testUser = {
  full_name: 'API Tester ' + timestamp,
  email: `tester_${timestamp}@example.com`,
  password: 'Password123!',
  confirm_password: 'Password123!'
};

async function testWorkflow() {
  console.log('--- Starting Workflow Test ---');
  
  try {
    // 1. Registration
    console.log('1. Registering user...');
    const regRes = await axios.post(`${baseUrl}/auth/register`, testUser);
    console.log('   Success:', regRes.data.message);

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    console.log('   Success: Token received, MemberID:', memberId);

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Personal Info
    console.log('3. Fetching master data for Personal Info...');
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId = deptRes.data[0]?.department_id || 1;
    
    console.log('   Updating Personal Info...');
    const indRes = await axios.post(`${baseUrl}/individuals`, {
      member_id: memberId,
      birthday: '1995',
      telephone: '0812345678',
      department_id: deptId,
      is_graduate: 1,
      year: '2020',
      is_disability: 0
    }, authHeader);
    console.log('   Success:', indRes.data.message);

    // 4. Career Plan
    console.log('4. Adding Career Plan...');
    const carRes = await axios.get(`${baseUrl}/careers`, authHeader);
    let careerId = carRes.data[0]?.career_id;
    if (!careerId) {
       const grpRes = await axios.get(`${baseUrl}/careers/groups`, authHeader);
       const grpId = grpRes.data[0]?.career_group_id || 1;
       const newCar = await axios.post(`${baseUrl}/careers`, { career_name: 'Test Career', career_group_id: grpId }, authHeader);
       careerId = newCar.data.career_id;
    }

    const pcRes = await axios.post(`${baseUrl}/plan-careers`, {
      member_id: memberId,
      career_id: careerId,
      plan_career_date: '2026/03/17'
    }, authHeader);
    const planCareerId = pcRes.data.plan_career_id;
    console.log('   Success: PlanCareerID:', planCareerId);

    // 5. Qualification
    console.log('5. Adding Qualification...');
    let qualId;
    try {
        const qListRes = await axios.get(`${baseUrl}/qualifications/list`, authHeader);
        qualId = qListRes.data[0]?.qualification_id;
    } catch(e) { console.log('   (Qual list fetch error, trying to create new)'); }

    if (!qualId) {
        const qgRes = await axios.get(`${baseUrl}/references/qualification-groups`, authHeader);
        const qgId = qgRes.data[0]?.qualification_group_id || 1;
        const newQual = await axios.post(`${baseUrl}/qualifications`, { qualification_name: 'Test Skill ' + timestamp, qualification_group_id: qgId }, authHeader);
        qualId = newQual.data.qualification_id;
    }
    
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
      plan_title: 'Test Plan Topic',
      plan_channel: 'Online',
      plan_start_date: '2026/03/17',
      plan_end_date: '2026/03/18'
    }, authHeader);
    const planId = planRes.data.plan_id;
    console.log('   Success: PlanID:', planId);

    // 7. Self Assessment
    console.log('7. Performing Self Assessment...');
    const perfRes = await axios.get(`${baseUrl}/references/performs`, authHeader);
    const performId = perfRes.data[0]?.perform_id || 1;

    const saRes = await axios.post(`${baseUrl}/self-assessments`, {
      member_id: memberId,
      qa_plan_career_id: qaPlanCareerId,
      perform_id: performId,
      self_assessment_date: '2026/03/17'
    }, authHeader);
    const saId = saRes.data.self_assessment_id;
    console.log('   Success: SelfAssessmentID:', saId);

    // 8. Evidence (Reference)
    console.log('8. Adding Evidence...');
    const refRes = await axios.post(`${baseUrl}/self-assessments/${saId}/references`, {
      reference_description: 'Test Evidence Link/Desc',
      plan_id: planId
    }, authHeader);
    console.log('   Success:', refRes.data.message);

    console.log('\n--- ALL STEPS PASSED SUCCESSFULLY ---');
    console.log('System is fully functional.');

  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testWorkflow();

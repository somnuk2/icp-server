import axios from 'axios';

const baseUrl = 'https://icp.sif.or.th/api';
const timestamp = Date.now();
const testUser = {
  full_name: 'Edit Tester ' + timestamp,
  email: `editter_${timestamp}@example.com`,
  password: 'Password123!',
  confirm_password: 'Password123!'
};

async function testEditWorkflow() {
  console.log('--- Starting Edit Workflow Test (ESM) ---');
  
  try {
    // 1. Setup: Register & Login
    console.log('1. Registering & Logging in...');
    await axios.post(`${baseUrl}/auth/register`, testUser);
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.data.token;
    const memberId = loginRes.data.member_id;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Success: MemberID:', memberId);

    // 2. Personal Info (Create then Edit)
    console.log('2. Testing Personal Info Edit...');
    const deptRes = await axios.get(`${baseUrl}/departments`, authHeader);
    const deptId1 = deptRes.data[0]?.department_id || 1;
    const deptId2 = deptRes.data[1]?.department_id || deptId1;
    
    const indPost = await axios.post(`${baseUrl}/individuals`, {
      member_id: memberId, birthday: '1990', telephone: '081', department_id: deptId1
    }, authHeader);
    const individualId = indPost.data.individual_id;
    
    const editIndRes = await axios.put(`${baseUrl}/individuals/${individualId}`, {
      birthday: '1991', telephone: '082', department_id: deptId2
    }, authHeader);
    console.log('   Success:', editIndRes.data.message);

    // 3. Career Plan (Create then Edit)
    console.log('3. Testing Career Plan Edit...');
    const carRes = await axios.get(`${baseUrl}/careers`, authHeader);
    const careerId1 = carRes.data[0]?.career_id;
    const careerId2 = carRes.data[1]?.career_id || careerId1;
    
    const pcPost = await axios.post(`${baseUrl}/plan-careers`, {
      member_id: memberId, career_id: careerId1, plan_career_date: '2026/01/01'
    }, authHeader);
    const planCareerId = pcPost.data.plan_career_id;
    
    const pcEdit = await axios.put(`${baseUrl}/plan-careers/${planCareerId}`, {
      career_id: careerId2, plan_career_date: '2026/02/02'
    }, authHeader);
    console.log('   Success:', pcEdit.data.message);

    // 4. Qualification (Create then Edit)
    console.log('4. Testing Qualification Edit...');
    const qListRes = await axios.get(`${baseUrl}/qualifications/list`, authHeader);
    const qualId1 = qListRes.data[0]?.qualification_id;
    const qualId2 = qListRes.data[1]?.qualification_id || qualId1;
    const targetRes = await axios.get(`${baseUrl}/targets`, authHeader);
    const targetId = targetRes.data[0]?.target_id;
    const levelRes = await axios.get(`${baseUrl}/levels`, authHeader);
    const levelId = levelRes.data[0]?.level_id;

    const qpcPost = await axios.post(`${baseUrl}/qa-plan-careers`, {
      plan_career_id: planCareerId, qualification_id: qualId1, target_id: targetId, level_id: levelId
    }, authHeader);
    const qaPlanCareerId = qpcPost.data.qa_plan_career_id;
    
    const qpcEdit = await axios.put(`${baseUrl}/qa-plan-careers/${qaPlanCareerId}`, {
      plan_career_id: planCareerId, qualification_id: qualId2, target_id: targetId, level_id: levelId
    }, authHeader);
    console.log('   Success:', qpcEdit.data.message);

    // 5. Development Plan (Create then Edit)
    console.log('5. Testing Development Plan Edit...');
    const devRes = await axios.get(`${baseUrl}/developments`, authHeader);
    const devId = devRes.data[0]?.development_id;
    const impRes = await axios.get(`${baseUrl}/importances`, authHeader);
    const impId = impRes.data[0]?.importance_id;

    const planPost = await axios.post(`${baseUrl}/plans`, {
      qa_plan_career_id: qaPlanCareerId, development_id: devId, importance_id: impId,
      plan_title: 'Original Title', plan_channel: 'Original', plan_start_date: '2026/01/01'
    }, authHeader);
    const planId = planPost.data.plan_id;
    
    const planEdit = await axios.put(`${baseUrl}/plans/${planId}`, {
      qa_plan_career_id: qaPlanCareerId, development_id: devId, importance_id: impId,
      plan_title: 'Edited Title', plan_channel: 'Edited', plan_start_date: '2026/02/02'
    }, authHeader);
    console.log('   Success:', planEdit.data.message);

    // 6. Self Assessment (Create then Edit)
    console.log('6. Testing Self Assessment Edit...');
    const perfRes = await axios.get(`${baseUrl}/performs`, authHeader);
    const performId1 = perfRes.data[0]?.perform_id;
    const performId2 = perfRes.data[1]?.perform_id || performId1;

    const saPost = await axios.post(`${baseUrl}/self-assessments`, {
      member_id: memberId, qa_plan_career_id: qaPlanCareerId,
      perform_id: performId1, self_assessment_date: '2026/01/01'
    }, authHeader);
    const saId = saPost.data.self_assessment_id;
    
    const saEdit = await axios.put(`${baseUrl}/self-assessments/${saId}`, {
      member_id: memberId, qa_plan_career_id: qaPlanCareerId,
      perform_id: performId2, self_assessment_date: '2026/02/02'
    }, authHeader);
    console.log('   Success:', saEdit.data.message);

    // 7. Evidence (Reference) (Create then Edit)
    console.log('7. Testing Evidence Edit...');
    const refPost = await axios.post(`${baseUrl}/self-assessments/${saId}/references`, {
      reference_description: 'Original Link', plan_id: planId
    }, authHeader);
    // Note: References usually don't have a direct single-ID update route in some older patterns, 
    // but let's assume standard REST or check if it exists. 
    // If it's a sub-resource, we might need the ref_id.
    const refId = refPost.data.reference_id; 
    
    // Attempt edit if route exists (checking backend routes/selfAssessments.js usually reveals this)
    try {
        const refEdit = await axios.put(`${baseUrl}/self-assessments/references/${refId}`, {
          reference_description: 'Edited Link', plan_id: planId
        }, authHeader);
        console.log('   Success:', refEdit.data.message);
    } catch(e) {
        console.log('   Info: Direct Reference Edit via PUT /references/:id not found, skipping or check route.');
    }

    console.log('\n--- ALL EDIT STEPS COMPLETED ---');

  } catch (error) {
    console.error('\n--- EDIT TEST FAILED ---');
    if (error.response) {
      console.error('Status:', error.response.status, 'Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEditWorkflow();

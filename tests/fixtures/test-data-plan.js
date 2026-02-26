
export const mockPlanCareers = [
    {
        plan_career_id: '101',
        career_name: 'Software Engineer',
        ca_group_name: 'Technology',
        start_date: '2026-01-01'
    }
];

export const mockQaPlanCareers = [
    {
        qa_plan_career_id: '301',
        plan_career_id: '101',
        career_name: 'Software Engineer',
        qualification_id: '201',
        qualification_name: 'JavaScript',
        level_id: '1',
        level_description: 'High',
        target_id: '1',
        target_name: 'Level 1'
    }
];

export const mockDevelopments = [
    { development_id: '1', development_name: 'อบรม/สัมมนา' },
    { development_id: '2', development_name: 'ศึกษาด้วยตนเอง' },
    { development_id: '3', development_name: 'ลงมือปฏิบัติ' }
];

export const mockImportances = [
    { importance_id: '1', importance_name: 'สูงมาก' },
    { importance_id: '2', importance_name: 'สูง' },
    { importance_id: '3', importance_name: 'ปานกลาง' }
];

export const mockFrequencies = [
    { frequency_id: '1', frequency_name: 'ครั้งเดียว' },
    { frequency_id: '2', frequency_name: 'รายสัปดาห์' }
];

export const mockExistingPlans = [
    {
        plan_id: '501',
        plan_career_id: '101',
        career_name: 'Software Engineer',
        qa_plan_career_id: '301',
        qualification_name: 'JavaScript',
        development_id: '1',
        development_name: 'อบรม/สัมมนา',
        plan_title: 'เรียนรู้ JavaScript ขั้นสูง',
        plan_channel: 'Udemy',
        importance_id: '1',
        importance_name: 'สูงมาก',
        plan_start_date: '2026-02-01',
        plan_end_date: '2026-05-01'
    }
];

export const mockAiRecommendations = {
    "reply": JSON.stringify([
        {
            "qa_plan_career_id": "301",
            "qualification_name": "JavaScript",
            "qualification_group_name": "Technical Skills",
            "related_career_name": "Software Engineer",
            "plan_title": "เรียนรู้ React Hooks (Study)",
            "plan_channel": "Official Documentation",
            "development_id": "2",
            "importance_id": "1",
            "reason": "React is widely used with JavaScript"
        },
        {
            "qa_plan_career_id": "301",
            "qualification_name": "JavaScript",
            "qualification_group_name": "Technical Skills",
            "related_career_name": "Software Engineer",
            "plan_title": "สร้าง Mini Project ด้วย React (Practice)",
            "plan_channel": "Github",
            "development_id": "3",
            "importance_id": "1",
            "reason": "Hands-on experience is key"
        }
    ])
};

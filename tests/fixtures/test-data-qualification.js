
export const mockPlanCareers = [
    {
        plan_career_id: '101',
        career_name: 'Software Engineer',
        ca_group_name: 'Technology',
        start_date: '2026-01-01'
    },
    {
        plan_career_id: '102',
        career_name: 'Data Scientist',
        ca_group_name: 'Data',
        start_date: '2026-06-01'
    }
];

export const mockQualifications = [
    {
        qualification_id: '201',
        qualification_name: 'JavaScript',
        qualification_group_name: 'Programming Language'
    },
    {
        qualification_id: '202',
        qualification_name: 'Python',
        qualification_group_name: 'Programming Language'
    }
];

export const mockTargets = [
    { target_id: '1', target_name: 'Level 1' },
    { target_id: '2', target_name: 'Level 2' }
];

export const mockLevels = [
    { level_id: '1', level_description: 'High' },
    { level_id: '2', level_description: 'Medium' }
];

export const mockAiRecommendations = {
    "reply": JSON.stringify([
        {
            "related_career_name": "Software Engineer",
            "qualification_group_name": "Technical Skills",
            "qualification_name": "React.js",
            "reason": "Popular frontend library",
            "target_id": "1",
            "target_reason": "Basic requirement",
            "level_id": "1",
            "level_reason": "High priority"
        },
        {
            "related_career_name": "Software Engineer",
            "qualification_group_name": "Soft Skills",
            "qualification_name": "Communication",
            "reason": "Essential for teamwork",
            "target_id": "2",
            "target_reason": "Standard",
            "level_id": "1",
            "level_reason": "High priority"
        }
    ])
};

export const mockExistingQualifications = [
    {
        qa_plan_career_id: '301',
        plan_career_id: '101',
        career_name: 'Software Engineer',
        qualification_id: '201',
        qualification_name: 'JavaScript',
        level_id: '1',
        level_description: 'High',
        target_id: '1',
        target_name: 'Level 1',
        target_value: 'Basic'
    }
];

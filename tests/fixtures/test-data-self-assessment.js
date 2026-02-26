
export const mockPlanCareers = [
    { label: 'Software Engineer', value: '101' },
    { label: 'Data Scientist', value: '102' }
];

export const mockQualifications = [
    { label: 'JavaScript', value: '201', qa_plan_career_id: '301' },
    { label: 'Python', value: '202', qa_plan_career_id: '302' }
];

export const mockPerformances = [
    { label: 'Good', value: '1' },
    { label: 'Excellent', value: '2' }
];

export const mockPlans = [
    {
        plan_id: '401',
        qa_plan_career_id: '301',
        plan_title: 'Learn Vue 3',
        plan_channel: 'Online Course',
        development_name: 'Training',
        plan_start_date: '01/01/2026',
        plan_end_date: '31/01/2026',
        importance_name: 'High'
    }
];

export const mockExistingAssessments = [
    {
        self_assessment_id: '501',
        qa_plan_career_id: '301',
        self_assessment_date: '2026/01/01',
        perform_id: '1',
        perform_value: 'Good',
        career_name: 'Software Engineer',
        qualification_name: 'JavaScript',
        target_value: 'Basic'
    }
];

export const mockReferences = [
    {
        reference_id: '601',
        self_assessment_id: '501',
        reference_description: 'Certificate from Coursera'
    }
];

export const mockAiRecommendations = {
    reply: JSON.stringify([
        {
            plan_id: "401",
            perform_id: "2",
            reason: "Completed all modules with high scores",
            suggested_evidences: ["Certificate", "Project Repo"]
        }
    ])
};

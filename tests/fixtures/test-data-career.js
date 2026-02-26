export const mockCareerOptions = [
    { career_id: 1, career_name: 'Software Engineer', ca_group_name: 'IT & Technology' },
    { career_id: 2, career_name: 'Data Scientist', ca_group_name: 'IT & Technology' },
    { career_id: 3, career_name: 'Doctor', ca_group_name: 'Medical' },
    { career_id: 4, career_name: 'Teacher', ca_group_name: 'Education' }
];

export const mockAiRecommendations = [
    {
        career_name: 'System Analyst',
        ca_group_name: 'IT & Technology',
        score: 95,
        reason: 'Matching skills: Analysis, Programming',
        status: 'New'
    },
    {
        career_name: 'UX Designer',
        ca_group_name: 'Design',
        score: 88,
        reason: 'Matching skills: Creativity',
        status: 'Existing'
    }
];

export const mockPlanCareers = [
    {
        plan_career_id: 101,
        career_name: 'Software Engineer',
        ca_group_name: 'IT & Technology',
        start_date: '2025/01/01', // DB format YYYY/MM/DD
        career_id: 1
    }
];

export const mockIndividualData = {
    member_id: 1,
    individual_id: 1,
    birthday: '2000-01-01',
    telephone: '0812345678'
};

/**
 * Test Data Fixtures สำหรับการทดสอบ FormComponent.vue
 */

export const testIndividual = {
    // ข้อมูลส่วนตัว
    birthday: '1995',
    telephone: '08-1234-5678',

    // ข้อมูลการศึกษา
    institute: { label: 'มหาวิทยาลัยแม่โจ้', value: 1 },
    faculty: { label: 'คณะวิทยาศาสตร์', value: 1 },
    degree: { label: 'ปริญญาตรี', value: 1 },
    department: { label: 'วิทยาการคอมพิวเตอร์', value: 1 },

    // สถานะการศึกษา
    is_graduate: false,
    year: '4',
    date: '', // จะใช้เมื่อ is_graduate = true

    // ข้อมูลความพิการ
    is_disability: false,
    disability: { label: '', value: '' },
    dis_description: '',

    // โครงการและผู้ดูแล
    project: { label: 'โครงการทดสอบ', value: 1 },
    advisor: { label: 'อาจารย์ทดสอบ', value: 1 },

    // ข้อมูลพื้นฐานเพิ่มเติม
    province: 'เชียงใหม่',
    preferredRegion: 'เชียงใหม่',
    favoriteSubject: 'คณิตศาสตร์',
    unfavoriteSubject: 'ภาษาอังกฤษ',
    favoriteActivity: 'เขียนโปรแกรม',
    dreamCareer: 'นักพัฒนาซอฟต์แวร์',
    skill: 'การเขียนโปรแกรม, การแก้ปัญหา, การทำงานเป็นทีม',
    additionalInfo: 'มีประสบการณ์ในการพัฒนาเว็บแอปพลิเคชัน'
};

export const testIndividualGraduated = {
    ...testIndividual,
    is_graduate: true,
    year: '',
    date: '2023'
};

export const testIndividualWithDisability = {
    ...testIndividual,
    is_disability: true,
    disability: { label: 'ความพิการทางการเคลื่อนไหว', value: 1 },
    dis_description: 'ใช้รถเข็น'
};

export const mockInstitutes = [
    { label: 'มหาวิทยาลัยแม่โจ้', value: 1 },
    { label: 'มหาวิทยาลัยเชียงใหม่', value: 2 },
    { label: 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา', value: 3 },
];

export const mockFaculties = [
    { label: 'คณะวิทยาศาสตร์', value: 1 },
    { label: 'คณะเกษตรศาสตร์', value: 2 },
    { label: 'คณะวิศวกรรมศาสตร์', value: 3 },
];

export const mockDegrees = [
    { label: 'ปริญญาตรี', value: 1 },
    { label: 'ปริญญาโท', value: 2 },
    { label: 'ปริญญาเอก', value: 3 },
];

export const mockDepartments = [
    { label: 'วิทยาการคอมพิวเตอร์', value: 1 },
    { label: 'เทคโนโลยีสารสนเทศ', value: 2 },
    { label: 'วิทยาศาสตร์ข้อมูล', value: 3 },
];

export const mockDisabilities = [
    { label: 'ความพิการทางการเคลื่อนไหว', value: 1 },
    { label: 'ความพิการทางการมองเห็น', value: 2 },
    { label: 'ความพิการทางการได้ยิน', value: 3 },
    { label: 'ความพิการทางสติปัญญา', value: 4 },
];

export const mockProjects = [
    { label: 'โครงการทดสอบ 1', value: 1 },
    { label: 'โครงการทดสอบ 2', value: 2 },
    { label: 'โครงการพัฒนาทักษะ', value: 3 },
];

export const mockAdvisors = [
    { label: 'อาจารย์สมชาย ใจดี', value: 1 },
    { label: 'อาจารย์สมหญิง รักเรียน', value: 2 },
    { label: 'อาจารย์ประเสริฐ มีความรู้', value: 3 },
];

export const mockTableData = [
    {
        individual_id: 1,
        member_id: 1,
        full_name: 'ทดสอบ ระบบ',
        birthday: '1995',
        telephone: '08-1234-5678',
        institute_name: 'มหาวิทยาลัยแม่โจ้',
        faculty_name: 'คณะวิทยาศาสตร์',
        degree_name: 'ปริญญาตรี',
        department_name: 'วิทยาการคอมพิวเตอร์',
        is_graduate: '0',
        year: '4',
        date: '',
        is_disability: '0',
        disability_name: '',
        dis_description: '',
        project_name: 'โครงการทดสอบ',
        advisor_name: 'อาจารย์ทดสอบ',
        province: 'เชียงใหม่',
        favoriteSubject: 'คณิตศาสตร์',
        unfavoriteSubject: 'ภาษาอังกฤษ',
        favoriteActivity: 'เขียนโปรแกรม',
        skill: 'การเขียนโปรแกรม',
        dreamCareer: 'นักพัฒนา',
        preferredRegion: 'เชียงใหม่',
        additionalInfo: 'ข้อมูลเพิ่มเติม'
    }
];

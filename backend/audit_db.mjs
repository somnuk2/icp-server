import mysql from 'mysql2/promise';

async function check() {
    console.log('--- Database Relationship Audit ---\n');
    try {
        const conn = await mysql.createConnection({
            host: '10.2.0.5',
            user: 'u486700931_root',
            password: process.env.DB_REMOTE_PASSWORD,
            database: 'u486700931_icp'
        });

        // 1. Members and Individuals (Profile completeness)
        const [mToI] = await conn.query(`
            SELECT count(*) as cnt 
            FROM member m 
            LEFT JOIN individual i ON m.member_id = i.member_id 
            WHERE i.individual_id IS NULL AND m.status='user'
        `);
        console.log(`1. User Members without Individual Profiles: ${mToI[0].cnt}`);

        // 2. Members and Plan Careers (Career path assignment)
        const [mToPC] = await conn.query(`
            SELECT count(*) as cnt 
            FROM member m 
            LEFT JOIN plan_career pc ON m.member_id = pc.member_id 
            WHERE pc.plan_career_id IS NULL AND m.status='user'
        `);
        console.log(`2. User Members without any Career Plans: ${mToPC[0].cnt}`);

        // 3. Plan Career and QA Linkage
        const [pcToQA] = await conn.query(`
            SELECT count(*) as cnt 
            FROM plan_career pc 
            LEFT JOIN qa_plan_career qpc ON pc.plan_career_id = qpc.plan_career_id 
            WHERE qpc.qa_plan_career_id IS NULL
        `);
        console.log(`3. Career Plans without any Skill Assessment (QA): ${pcToQA[0].cnt}`);

        // 4. QA and Action Plans
        const [qaToP] = await conn.query(`
            SELECT count(*) as cnt 
            FROM qa_plan_career qpc 
            LEFT JOIN plan p ON qpc.qa_plan_career_id = p.qa_plan_career_id 
            WHERE p.plan_id IS NULL
        `);
        console.log(`4. Skill Assessments without any Action Plans (plan): ${qaToP[0].cnt}`);

        // 5. Careers and Groups
        const [cToG] = await conn.query(`
            SELECT count(*) as cnt 
            FROM career c 
            LEFT JOIN career_group g ON c.career_group_id = g.career_group_id 
            WHERE g.career_group_id IS NULL AND c.career_group_id != 0
        `);
        console.log(`5. Careers with Invalid Group IDs: ${cToG[0].cnt}`);

        // 6. Self-Assessments (Member check)
        const [saToM] = await conn.query(`
            SELECT count(*) as cnt 
            FROM self_assessment sa 
            LEFT JOIN member m ON sa.member_id = m.member_id 
            WHERE m.member_id IS NULL
        `);
        console.log(`6. Self-Assessments with missing Member ID: ${saToM[0].cnt}`);

        await conn.end();
    } catch (e) {
        console.error('Audit Error:', e.message);
    }
}

check();

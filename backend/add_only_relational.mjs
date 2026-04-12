import fs from 'fs';
import mysql from 'mysql2/promise';

async function addOnly() {
    console.log('🚀 Starting Relational Add-Only Synchronization...');
    console.log('--------------------------------------------------');

    try {
        const content = fs.readFileSync('../u486700931_icp-v2.sql', 'utf8');
        const conn = await mysql.createConnection({
            host: '10.2.0.5',
            user: 'u486700931_root',
            password: process.env.DB_REMOTE_PASSWORD,
            database: 'u486700931_icp'
        });

        // Table order based on dependencies (Parent -> Child)
        const tableOrder = [
            'institute', 'faculty', 'degree', 'department', 'disability', 
            'career_group', 'qualification_group', 'career', 'qualification', 
            'member', 'individual', 'plan_career', 'qa_plan_career', 'plan', 
            'self_assessment', 'notification', 'advisor', 'project'
        ];

        let totalAdded = 0;

        for (const table of tableOrder) {
            // Regex to match the INSERT statement for this specific table
            const regex = new RegExp(`INSERT INTO [\x60]${table}[\x60] \\((.*?)\\) VALUES\\s*([\\s\\S]*?);`, 'g');
            let match = regex.exec(content);

            if (match) {
                const columns = match[1];
                const valuesPart = match[2];
                const rows = valuesPart.split(/,(?=\s*\()/).map(r => r.trim());

                console.log(`📡 Checking [${table}] (${rows.length} rows in file)...`);

                let added = 0;
                for (let row of rows) {
                    try {
                        const cleanRow = row.endsWith(',') ? row.slice(0, -1) : row;
                        // INSERT IGNORE will skip existing Primary Keys, maintaining current data integrity
                        const [res] = await conn.query(`INSERT IGNORE INTO \`${table}\` (${columns}) VALUES ${cleanRow}`);
                        if (res.affectedRows > 0) added++;
                    } catch (e) {
                        // Skip any malformed rows
                    }
                }
                if (added > 0) {
                    console.log(`   ✅ Added ${added} new records.`);
                    totalAdded += added;
                } else {
                    console.log(`   🔸 No new records to add.`);
                }
            }
        }

        await conn.end();
        console.log('--------------------------------------------------');
        console.log(`🏁 FINISHED! Total new records added: ${totalAdded}`);
        console.log('✅ Update complete. Existing data on server was NOT modified.');
    } catch (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    }
}

addOnly();

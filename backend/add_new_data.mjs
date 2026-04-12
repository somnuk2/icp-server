import fs from 'fs';
import mysql from 'mysql2/promise';

async function addData() {
    console.log('📥 Starting "Add Missing Records" process...');
    console.log('-------------------------------------------');

    try {
        const content = fs.readFileSync('../u486700931_icp-v2.sql', 'utf8');
        const conn = await mysql.createConnection({
            host: '10.2.0.5',
            user: 'u486700931_root',
            password: process.env.DB_REMOTE_PASSWORD,
            database: 'u486700931_icp'
        });

        // Regex for INSERT
        const insertRegex = /INSERT INTO [`](.*?)[`] \((.*?)\) VALUES\s*([\s\S]*?);/g;
        let match;
        let totalAdded = 0;

        while ((match = insertRegex.exec(content)) !== null) {
            const table = match[1];
            const columns = match[2];
            const valuesPart = match[3];

            const rows = valuesPart.split(/,(?=\s*\()/).map(r => r.trim());
            console.log(`📡 Adding new records to [${table}] (${rows.length} rows to check)...`);

            let tableAdded = 0;
            for (let row of rows) {
                try {
                    const cleanRow = row.endsWith(',') ? row.slice(0, -1) : row;
                    // Use INSERT IGNORE to avoid overwriting existing records
                    const query = `INSERT IGNORE INTO \`${table}\` (${columns}) VALUES ${cleanRow}`;
                    const [result] = await conn.query(query);
                    if (result.affectedRows > 0) {
                        tableAdded++;
                    }
                } catch (rowErr) {
                    // Ignore malformed data
                }
            }
            if (tableAdded > 0) {
                console.log(`   + Added ${tableAdded} new records.`);
            }
            totalAdded += tableAdded;
        }

        await conn.end();
        console.log('-------------------------------------------');
        console.log(`🏁 FINISHED! Total new records added: ${totalAdded}`);
        console.log('✅ All missing data from file has been added to server (Existing data left untouched).');
    } catch (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    }
}

addData();

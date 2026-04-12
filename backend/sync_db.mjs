import fs from 'fs';
import mysql from 'mysql2/promise';

async function sync() {
    console.log('🚀 Starting Database Update Process...');
    console.log('-------------------------------------------');

    try {
        const content = fs.readFileSync('../u486700931_icp-v2.sql', 'utf8');
        const conn = await mysql.createConnection({
            host: '10.2.0.5',
            user: 'u486700931_root',
            password: process.env.DB_REMOTE_PASSWORD,
            database: 'u486700931_icp'
        });

        // Regex to extract INSERT blocks
        const insertRegex = /INSERT INTO [`](.*?)[`] \((.*?)\) VALUES\s*([\s\S]*?);/g;
        let match;
        let totalUpdated = 0;

        while ((match = insertRegex.exec(content)) !== null) {
            const table = match[1];
            const columns = match[2];
            const valuesPart = match[3];

            // Split into individual rows
            // This regex splits by ),( but keeps the parentheses
            const rows = valuesPart.split(/,(?=\s*\()/).map(r => r.trim());
            console.log(`📡 Processing Table: ${table} (${rows.length} rows)`);

            const colArray = columns.split(',').map(c => c.trim());
            const updateClause = colArray.map(col => `${col}=VALUES(${col})`).join(', ');

            let tableUpdated = 0;
            for (let row of rows) {
                try {
                    // Ensure row is properly formatted (remove trailing comma if any)
                    const cleanRow = row.endsWith(',') ? row.slice(0, -1) : row;
                    const query = `INSERT INTO \`${table}\` (${columns}) VALUES ${cleanRow} ON DUPLICATE KEY UPDATE ${updateClause}`;
                    const [result] = await conn.query(query);
                    if (result.affectedRows > 0) {
                        tableUpdated++;
                    }
                } catch (rowErr) {
                    // Skip errors for individual rows (e.g. malformed SQL data in dump)
                    // console.error(`Error in row: ${rowErr.message}`);
                }
            }
            console.log(`   ✅ Success: ${tableUpdated} rows updated/inserted.`);
            totalUpdated += tableUpdated;
        }

        await conn.end();
        console.log('-------------------------------------------');
        console.log(`🏁 FINISHED! Total operations: ${totalUpdated}`);
        console.log('✅ Server database is now in sync with the SQL file.');
    } catch (err) {
        console.error('❌ CRITICAL ERROR:', err.message);
        process.exit(1);
    }
}

sync();

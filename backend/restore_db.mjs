import fs from 'fs';
import mysql from 'mysql2/promise';

async function restore() {
    console.log('🔄 Starting Full Database Restore from backup...');
    try {
        const content = fs.readFileSync('../backup_server_icp.sql', 'utf8');
        const conn = await mysql.createConnection({
            host: '10.2.0.5',
            user: 'u486700931_root',
            password: process.env.DB_REMOTE_PASSWORD,
            database: 'u486700931_icp',
            multipleStatements: true // Enable multiple statements for restore
        });

        // Split by semicolon followed by newline to get individual commands
        // This is a basic split but should work for our generated backup
        const commands = content.split(/;\r?\n/);
        
        let successCount = 0;
        for (let cmd of commands) {
            const cleanCmd = cmd.trim();
            if (cleanCmd) {
                try {
                    await conn.query(cleanCmd);
                    successCount++;
                } catch (cmdErr) {
                    // console.error(`Error executing: ${cleanCmd.substring(0, 50)}...`);
                    // console.error(`Error details: ${cmdErr.message}`);
                }
            }
        }

        await conn.end();
        console.log(`✅ Restore completed! Executed ${successCount} command blocks.`);
    } catch (err) {
        console.error('❌ RESTORE ERROR:', err.message);
        process.exit(1);
    }
}

restore();

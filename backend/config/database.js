import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const DB_MODE = process.env.DB_MODE || 'local'

// Select config based on DB_MODE
const dbConfig = DB_MODE === 'remote'
    ? {
        host: process.env.DB_REMOTE_HOST || '10.2.0.5',
        port: parseInt(process.env.DB_REMOTE_PORT) || 3306,
        database: process.env.DB_REMOTE_DATABASE || 'u486700931_icp',
        user: process.env.DB_REMOTE_USER || 'u486700931_root',
        password: process.env.DB_REMOTE_PASSWORD,
    }
    : {
        host: process.env.DB_LOCAL_HOST || 'localhost',
        port: parseInt(process.env.DB_LOCAL_PORT) || 3306,
        database: process.env.DB_LOCAL_DATABASE || 'u486700931_icp',
        user: process.env.DB_LOCAL_USER || 'u486700931_root',
        password: process.env.DB_LOCAL_PASSWORD,
    }

// Create connection pool (reuses connections, more efficient)
const pool = mysql.createPool({
    ...dbConfig,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

// Test connection on startup
export async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM member')
        console.log(`✅ Database connected [${DB_MODE.toUpperCase()}] → ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (members: ${rows[0].cnt})`)
        return true
    } catch (err) {
        console.error(`❌ Database connection failed [${DB_MODE.toUpperCase()}]:`, err.message)
        return false
    }
}

export default pool



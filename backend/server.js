import express from 'express' // Trigger restart
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env from project root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { testConnection } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.js'
import institutesRoutes from './routes/institutes.js'
import facultiesRoutes from './routes/faculties.js'
import degreesRoutes from './routes/degrees.js'
import departmentsRoutes from './routes/departments.js'
import membersRoutes from './routes/members.js'
import disabilitiesRoutes from './routes/disabilities.js'
import individualsRoutes from './routes/individuals.js'
import plansRoutes from './routes/plans.js'
import planCareersRoutes from './routes/planCareers.js'
import qaPlanCareersRoutes from './routes/qaPlanCareers.js'
import selfAssessmentsRoutes from './routes/selfAssessments.js'
import qualificationGroupsRoutes from './routes/qualificationGroups.js'
import qualificationsRoutes from './routes/qualifications.js'
import careersRoutes from './routes/careers.js'
import notificationsRoutes from './routes/notifications.js'
import projectRoutes from './routes/projects.js'
import referencesRoutes from './routes/references.js'
import dashboardRoutes from './routes/dashboard.js'
import reportsRoutes from './routes/reports.js'
import constantsRoutes from './routes/constants.js'

const app = express()
const DB_MODE = process.env.DB_MODE || 'local'
const PORT = process.env.PORT || 3000

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

// ─── Startup Log ──────────────────────────────────────────────────────────────
console.log('='.repeat(50))
console.log('🚀 ICP Backend Server Starting...')
console.log('='.repeat(50))
console.log(`📊 Database Mode : ${DB_MODE.toUpperCase()}`)
console.log(`🌐 Port          : ${PORT}`)
console.log('='.repeat(50))

// ─── Health & Info ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', dbMode: DB_MODE, timestamp: new Date().toISOString() })
})

app.get('/api/db-info', (req, res) => {
  const isRemote = DB_MODE === 'remote'
  res.json({
    mode: DB_MODE,
    host: isRemote ? process.env.DB_REMOTE_HOST : process.env.DB_LOCAL_HOST,
    port: isRemote ? process.env.DB_REMOTE_PORT : process.env.DB_LOCAL_PORT,
    database: isRemote ? process.env.DB_REMOTE_DATABASE : process.env.DB_LOCAL_DATABASE,
  })
})

// ─── API Routes ───────────────────────────────────────────────────────────────
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/institutes', institutesRoutes)
app.use('/api/faculties', facultiesRoutes)
app.use('/api/degrees', degreesRoutes)
app.use('/api/departments', departmentsRoutes)
app.use('/api/members', membersRoutes)
app.use('/api/individuals', individualsRoutes)
app.use('/api/plans', plansRoutes)
app.use('/api/plan-careers', planCareersRoutes)
app.use('/api/plan-careers-super', planCareersRoutes)
app.use('/api/qa-plan-careers', qaPlanCareersRoutes)
app.use('/api/self-assessments', selfAssessmentsRoutes)
app.use('/api/qualification-groups', qualificationGroupsRoutes)
app.use('/api/qualifications', qualificationsRoutes)
app.use('/api/careers', careersRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/disabilities', disabilitiesRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/references', referencesRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api', constantsRoutes)

// ─── AI Chat Service (Ollama) ────────────────────────────────────────────────
const MODEL_NAME = process.env.AI_MODEL_NAME || 'promptnow/openthaigpt1.5-7b-instruct-q4_k_m:latest'

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    console.log(`🤖 AI Request: ${messages[messages.length - 1]?.content?.substring(0, 50)}...`)

    const ollamaRes = await axios.post('http://localhost:11434/api/chat', {
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'คุณคือผู้ช่วย AI ภาษาไทย ช่วยตอบให้เข้าใจง่าย กระชับ และไม่ต้องถามย้ำคำถามซ้ำ'
        },
        ...messages
      ],
      stream: false
    }, { timeout: 300000 }) // เพิ่ม timeout เป็น 5 นาที สำหรับ CPU ประมวลผล

    const reply = ollamaRes.data?.message?.content || ''
    res.json({ reply })
  } catch (err) {
    console.error('❌ AI Error:', err.message)
    res.status(500).json({ error: 'LLM service error', details: err.message })
  }
})

// ─── PHP Proxy Fallback (ระหว่าง Migration ยังไม่เสร็จ) ──────────────────────
const XAMPP_PORT = 85

app.all(/^\/icp2022\/.*/, async (req, res) => {
  try {
    const phpUrl = `http://localhost:${XAMPP_PORT}${req.originalUrl}`
    console.log(`📤 [PHP Proxy] → ${phpUrl}`)
    const response = await axios({ method: req.method, url: phpUrl, data: req.body, responseType: 'text' })
    let data = response.data.trim()
    const start = Math.min(
      data.indexOf('[') >= 0 ? data.indexOf('[') : Infinity,
      data.indexOf('{') >= 0 ? data.indexOf('{') : Infinity
    )
    if (start !== Infinity) {
      try { return res.json(JSON.parse(data.substring(start))) } catch { }
    }
    res.send(data)
  } catch (err) {
    res.status(500).json({ error: 'PHP proxy error', message: err.message })
  }
})

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  const displayHost = DB_MODE === 'remote' ? '10.2.0.6' : 'localhost'

  console.log(`\n✅ Server running on http://${displayHost}:${PORT}`)
  console.log(`📍 Health   : http://${displayHost}:${PORT}/health`)
  console.log(`📍 DB Info  : http://${displayHost}:${PORT}/api/db-info`)
  console.log(`📍 API Base : http://${displayHost}:${PORT}/api/\n`)
  await testConnection()
})



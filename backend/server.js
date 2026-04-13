import express from 'express' // Trigger restart
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

app.get('/api/health', (req, res) => {
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

// ─── AI Chat Service (Gemini) ─────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, gemini_api_key: userApiKey } = req.body
    const userPrompt = messages[messages.length - 1]?.content || ''

    // Force use of Gemini with active API key
    const activeApiKey = userApiKey || GEMINI_API_KEY

    if (!activeApiKey) {
      console.error('❌ NO KEY: GEMINI_API_KEY is not configured in .env')
      return res.status(500).json({ error: 'AI Error: Gemini API Key is missing.' })
    }

    console.log(`🤖 AI Request [GEMINI]: ${userPrompt.substring(0, 50)}...`)

    try {
      const genAI = new GoogleGenerativeAI(activeApiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

      const systemPrompt = "คุณคือผู้ช่วย AI ภาษาไทย ตอบคำถามให้สั้น กระชับ ตรงประเด็นที่สุด ยาวไม่เกิน 2-3 ประโยค"
      const prompt = `${systemPrompt}\n\nUser: ${userPrompt}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const reply = response.text()

      console.log('✅ Gemini Response Success!')
      return res.json({ reply, provider: 'gemini' })

    } catch (geminiErr) {
      console.error('❌ Gemini Critical Error:', geminiErr.message)
      return res.status(500).json({ 
        error: `Gemini API Error: ${geminiErr.message}`,
        provider: 'none'
      })
    }
  } catch (err) {
    console.error('❌ AI System Error:', err.message)
    res.status(500).json({ error: 'System Error', details: err.message })
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



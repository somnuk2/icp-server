import express from 'express' // Trigger restart
import cors from 'cors'
import axios from 'axios'
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

// ─── AI Chat Service (Gemini & Ollama Fallback) ─────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const AI_MODE = process.env.AI_MODE || 'ollama' // 'gemini' or 'ollama'
const MODEL_NAME = process.env.AI_MODEL_NAME || 'qwen2:1.5b'

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, gemini_api_key: userApiKey } = req.body
    const userPrompt = messages[messages.length - 1]?.content || ''

    // Check which key to use: 1. User specified key 2. Env default key
    const activeApiKey = userApiKey || GEMINI_API_KEY

    console.log(`🤖 AI Request [${AI_MODE.toUpperCase()}]: ${userPrompt.substring(0, 50)}...`)
    if (userApiKey) console.log('🔑 Using User-provided Gemini API Key')

    // Mode 1: Google Gemini (Primary if configured)
    if (AI_MODE === 'gemini' && activeApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(activeApiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Convert messages to Gemini format (System prompt + History + Current User Prompt)
        const systemPrompt = "คุณคือผู้ช่วย AI ภาษาไทย ตอบคำถามให้สั้น กระชับ ตรงประเด็นที่สุด ยาวไม่เกิน 2-3 ประโยค"
        const prompt = `${systemPrompt}\n\nUser: ${userPrompt}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const reply = response.text()

        return res.json({ reply, provider: 'gemini' })
      } catch (geminiErr) {
        console.error('⚠️ Gemini API Error, falling back to Ollama:', geminiErr.message)
        // Continue to Ollama fallback
      }
    }

    // Mode 2: Ollama (Local Fallback)
    const ollamaRes = await axios.post('http://localhost:11434/api/chat', {
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'คุณคือผู้ช่วย AI ภาษาไทย ตอบคำถามให้สั้น กระชับ ตรงประเด็นที่สุด ยาวไม่เกิน 2-3 ประโยค'
        },
        ...messages
      ],
      stream: false,
      options: {
        num_predict: 150,
        num_ctx: 512,
        temperature: 0.3
      }
    }, { timeout: 600000 })

    const reply = ollamaRes.data?.message?.content || ''
    res.json({ reply, provider: 'ollama' })
  } catch (err) {
    console.error('❌ AI System Error:', err.message)
    res.status(500).json({ error: 'AI service unavailable', details: err.message })
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



const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

const MODEL_NAME =
  'hf.co/openthaigpt/openthaigpt1.5-7b-instruct:openthaigpt1.5-7B-instruct-Q4KM.gguf'

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body

    const ollamaRes = await axios.post('http://localhost:11434/api/chat', {
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content:
            'คุณคือผู้ช่วย AI ภาษาไทย ช่วยตอบให้เข้าใจง่าย กระชับ และไม่ต้องถามย้ำคำถามซ้ำ'
        },
        ...messages
      ],
      stream: false
    })

    const reply = ollamaRes.data?.message?.content || ''
    res.json({ reply })
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).json({ error: 'LLM error' })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})



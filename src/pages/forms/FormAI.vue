<script setup>
import { ref, computed, nextTick } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

import { useStore } from 'vuex'
import { getChatUrl } from "../../utils/apiConfig.js"

const $q = useQuasar()
const store = useStore()

/** -----------------------
 * Helpers
 * ---------------------- */
const genKey = (prefix = 'node') => {
  const id =
    (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${id}`
}

const cleanCareerName = (text) => text ? text.split(/[:\-\(]/)[0].trim() : ''

const safeTrim = (v) => (v ?? '').toString().trim()
const getThaiBEYear = () => new Date().getFullYear() + 543

const parseList = (text) => {
  const src = (text || '').replace(/\r/g, '')
  const lines = src.split('\n').map(l => l.trim()).filter(Boolean)
  const items = []

  for (const line of lines) {
    const numbered = line.match(/^(\d+)[\.\)\-\:]\s*(.+)$/)
    if (numbered) {
      items.push(numbered[2].trim())
      continue
    }
    const bullet = line.match(/^[\-\•\*]\s*(.+)$/)
    if (bullet) items.push(bullet[1].trim())
  }

  if (items.length === 0 && src.trim()) items.push(src.trim())
  return items
}

const notifyError = (message) => $q.notify({ type: 'negative', message })
const notifyOk = (message) => $q.notify({ type: 'positive', message })

/** -----------------------
 * API
 * ---------------------- */
const CHAT_URL = getChatUrl(store)

const callChat = async (payloadMessages, timeout = 120000) => {
  const userApiKey = localStorage.getItem("gemini_api_key")
  const res = await axios.post(CHAT_URL, {
    messages: payloadMessages,
    gemini_api_key: userApiKey
  }, { timeout })
  return res?.data?.reply ?? ''
}

/** -----------------------
 * 1) ICP Scorecard – โปรไฟล์นักเรียน
 * ---------------------- */
const icpForm = ref({
  name: 'น้องเอ',
  province: 'กรุงเทพมหานคร',
  disability: 'ไม่มี',
  studyProgram: 'วิทย์-คณิต',
  favoriteSubject: 'คณิตศาสตร์, วิทยาศาสตร์',
  unfavoriteSubject: 'สังคมศึกษา',
  favoriteActivity: 'เล่นเกม, อ่านหนังสือ, วาดรูป',
  skill: 'แก้ปัญหาเชิงตรรกะดี, มีความคิดสร้างสรรค์, ชอบทำงานคนเดียวมากกว่าทำงานกลุ่ม',
  dreamCareer: 'ยังไม่แน่ใจ',
  preferredRegion: 'กรุงเทพฯ และปริมณฑล',
  additionalInfo: 'นักเรียนเป็นคนเงียบ ๆ แต่ตั้งใจเรียน ชอบคิดวิเคราะห์ปัญหา ไม่ชอบพูดในที่สาธารณะมากนัก'
})

const icpProfileText = computed(() => {
  const f = icpForm.value
  return `
โปรไฟล์นักเรียน (ICP Scorecard):

- ชื่อ: ${f.name || '-'}
- มาจากจังหวัด: ${f.province || '-'}
- ภาวะความพิการ: ${f.disability || 'ไม่ระบุ'}
- เรียนสาย: ${f.studyProgram || '-'}
- วิชาที่ชอบ: ${f.favoriteSubject || '-'}
- อุปกรณ์ที่จำเป็น: ${f.unfavoriteSubject || '-'}
- กิจกรรมที่ชอบทำ: ${f.favoriteActivity || '-'}
- ความถนัด / ความชำนาญ: ${f.skill || '-'}
- อาชีพที่ใฝ่ฝัน: ${f.dreamCareer || '-'}
- ภาค/จังหวัดที่อยากอยู่ระหว่างเรียน: ${f.preferredRegion || '-'}
- ข้อมูลเพิ่มเติม: ${f.additionalInfo || '-'}
`.trim()
})

/** -----------------------
 * 2) Chat & Tree
 * ---------------------- */
const messages = ref([
  {
    role: 'assistant',
    content:
      'สวัสดีครับ 👋 ผมคือผู้ช่วยแนะแนวอาชีพด้วย OpenThaiGPT\n\nกรอกรายละเอียดนักเรียนด้านบน (มีโปรไฟล์ตัวอย่าง "น้องเอ" ไว้ให้แล้ว)\nจากนั้นระบุจำนวนอาชีพ แล้วกดปุ่มด้านล่างเพื่อเริ่มต้นได้เลยครับ!'
  }
])

const loading = ref(false)
const userInput = ref(5)

const treeData = ref([])
const loadingNodes = ref(new Set())

const pushMsg = (role, content) => messages.value.push({ role, content })

/** Prompt builders */
const buildCareerPrompt = (count) => `
${icpProfileText.value}

คำขอจากครู:
ช่วยเสนอแนะอาชีพจำนวน ${count} อาชีพ

เงื่อนไขการตอบ:
1) แนะนำอาชีพ ${count} อาชีพ ที่เหมาะสมกับนักเรียนคนนี้มากที่สุด
2) ตอบเป็นภาษาไทยเท่านั้น
3) ตอบเป็นรายการลำดับเลข 1., 2., 3., ...
4) แต่ละข้อระบุชื่ออาชีพ และอธิบายสั้น ๆ ว่าทำไมเหมาะ
`.trim()

const buildSkillNamesPrompt = (careerLabel) => `
${icpProfileText.value}

อาชีพ: ${careerLabel}

กรุณาระบุทักษะสำคัญ 4 ข้อที่จำเป็นสำหรับอาชีพนี้ โดยตอบเฉพาะชื่อทักษะเท่านั้น

รูปแบบ:
1. ทักษะการเขียนโปรแกรม
2. การสื่อสาร
3. การทำงานเป็นทีม
4. การแก้ปัญหาเชิงวิเคราะห์

ตอบเป็นภาษาไทยและใช้ลำดับเลขเท่านั้น
`.trim()

const buildTargetAssessmentPrompt = (careerLabel, skillLabel) => `
${icpProfileText.value}

อาชีพ: ${careerLabel}
ทักษะ: ${skillLabel}

กรุณาให้ข้อมูลดังนี้:
1) ระดับเป้าหมายที่ควรมีสำหรับอาชีพนี้ (เช่น ระดับเป้าหมาย: 4/5)
2) ระดับปัจจุบันของนักเรียนตามโปรไฟล์ (เช่น ระดับปัจจุบัน: 2/5)
3) เหตุผลสั้น ๆ อธิบายการประเมินระดับปัจจุบัน
4) ระดับความสำคัญของทักษะนี้สำหรับอาชีพ: ต้องมี / มีแล้วเป็นประโยชน์ / มีไม่มีก็ได้ (เลือกเพียงอย่างเดียว)

ตอบเป็นภาษาไทยเท่านั้น และแยกแต่ละส่วนชัดเจน
`.trim()

const buildDevelopmentPrompt = (skillLabel) => `
${icpProfileText.value}

ช่วยเสนอวิธีพัฒนาทักษะต่อไปนี้ให้กับนักเรียน:
${skillLabel}

เงื่อนไข:
- เสนอ 3 วิธีที่ทำได้จริงในชีวิตประจำวันของนักเรียนมัธยม
- ตอบเป็นภาษาไทย
- ใช้ bullet หรือลำดับเลข
`.trim()

const buildCompaniesPrompt = (careerLabel, skillsText) => `
${icpProfileText.value}

อาชีพ: ${careerLabel}
${skillsText ? `ทักษะที่เกี่ยวข้อง: ${skillsText}` : ''}

ช่วยแนะนำบริษัท/องค์กรชั้นนำในไทยหรือต่างประเทศที่มีสาขาในไทย จำนวน 3 แห่ง ที่เหมาะกับอาชีพนี้

เงื่อนไข:
- รูปแบบ: 1. ชื่อบริษัท (Matching Score: xx%) - เหตุผลสั้น ๆ
- ตอบเป็นภาษาไทย
`.trim()

/** -----------------------
 * Actions: Careers
 * ---------------------- */
const sendMessage = async () => {
  let count = Number(userInput.value || 5)
  if (!count || count < 1) count = 5
  userInput.value = count

  const userPrompt = `ช่วยเสนอแนะอาชีพจำนวน ${count} อาชีพ`
  pushMsg('user', userPrompt)
  loading.value = true

  try {
    const payloadMessages = [
      {
        role: 'system',
        content:
          'คุณเป็นที่ปรึกษาด้านการแนะแนวอาชีพสำหรับนักเรียนไทย ให้คำแนะนำอย่างสร้างสรรค์ เข้าใจง่าย และเหมาะสมกับบริบทของนักเรียน'
      },
      { role: 'user', content: buildCareerPrompt(count) }
    ]

    const replyText = await callChat(payloadMessages)
    pushMsg('assistant', replyText || '(ไม่มีคำตอบจากโมเดล)')

    const careers = parseList(replyText)
    treeData.value = careers.map((career) => ({
      label: career,
      key: genKey('career'),
      type: 'career',
      children: [],
      expanded: true
    }))
  } catch (err) {
    console.error(err)
    const errMsg =
      'เกิดข้อผิดพลาดในการเชื่อมต่อกับ OpenThaiGPT\nกรุณาตรวจสอบว่า backend (localhost:3000) ทำงานอยู่'
    pushMsg('assistant', errMsg)
    notifyError(errMsg)
  } finally {
    loading.value = false
  }
}

/** -----------------------
 * Actions: Skills
 * ---------------------- */
const fetchSkills = async (careerNode) => {
  if (!careerNode) return

  const key = careerNode.key
  loadingNodes.value.add(key)

  pushMsg('user', `ช่วยระบุทักษะสำคัญสำหรับอาชีพ "${careerNode.label}" พร้อมระดับเป้าหมายและการประเมินนักเรียน`)

  try {
    const payloadMessages = [
      { role: 'system', content: 'คุณเป็นที่ปรึกษาอาชีพ ช่วยระบุเฉพาะชื่อทักษะสำคัญ 4 ข้อสำหรับอาชีพที่ระบุ' },
      { role: 'user', content: buildSkillNamesPrompt(careerNode.label) }
    ]

    const replyText = await callChat(payloadMessages)
    pushMsg('assistant', replyText || '')

    const skillNames = parseList(replyText).slice(0, 4)

    const skillNodes = skillNames.map((name) => ({
      label: name,
      key: genKey('skill'),
      type: 'skill',
      importance: null,
      children: []
    }))

    // replace old skills
    careerNode.children = [
      ...careerNode.children.filter((c) => c.type !== 'skill'),
      ...skillNodes
    ]

    for (const s of skillNodes) {
      await fetchTargetAndAssessment(careerNode, s)
    }

    notifyOk('ดึงข้อมูลทักษะสำเร็จ')
  } catch (err) {
    console.error(err)
    notifyError('ไม่สามารถดึงรายชื่อทักษะได้')
  } finally {
    loadingNodes.value.delete(key)
  }
}

/** -----------------------
 * Target + Assessment + Importance
 * ---------------------- */
const MONTHS = ['มค.', 'กพ.', 'มีค.', 'เมย.', 'พค.', 'มิย.', 'กค.', 'สค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const parseScoreFromLine = (line) => {
  const m = (line || '').match(/([\d\.]+)\s*\/\s*5/)
  if (m) return m[1]
  const n = (line || '').match(/(\d+)/)
  return n ? n[1] : ''
}

const fetchTargetAndAssessment = async (careerNode, skillNode) => {
  if (!careerNode || !skillNode) return

  const key = skillNode.key
  loadingNodes.value.add(key)

  try {
    const payloadMessages = [
      { role: 'system', content: 'คุณเป็นผู้เชี่ยวชาญการประเมินทักษะ วิเคราะห์ระดับเป้าหมาย ระดับปัจจุบัน และระดับความสำคัญอย่างสมเหตุสมผล' },
      { role: 'user', content: buildTargetAssessmentPrompt(careerNode.label, skillNode.label) }
    ]

    const replyText = await callChat(payloadMessages)
    const lines = (replyText || '').split('\n').map(l => l.trim()).filter(Boolean)

    const targetLine = lines.find(l => l.includes('เป้าหมาย')) || 'ระดับเป้าหมาย: ไม่พบข้อมูล'
    const currentLine = lines.find(l => l.includes('ปัจจุบัน')) || 'ระดับปัจจุบัน: ไม่พบข้อมูล'
    const reasonText =
      lines.find(l => l.includes('เหตุผล'))?.replace(/เหตุผล[:：]?\s*/i, '').trim() || 'ไม่พบข้อมูล'

    const targetScore = parseScoreFromLine(targetLine) || '0'
    const currentScore = parseScoreFromLine(currentLine) || ''

    // importance
    const importanceLine = lines.find(l => l.includes('ความสำคัญ'))
    let importanceValue = null
    let importanceDisplay = 'ยังไม่ได้ระบุ'
    if (importanceLine) {
      const t = importanceLine.replace(/ระดับความสำคัญ[:：]?\s*/i, '').trim()
      if (t.includes('ต้องมี')) { importanceValue = 'must'; importanceDisplay = 'ต้องมี' }
      else if (t.includes('เป็นประโยชน์')) { importanceValue = 'nice'; importanceDisplay = 'เป็นประโยชน์' }
      else if (t.includes('ไม่มีก็ได้')) { importanceValue = 'optional'; importanceDisplay = 'มีไม่มีก็ได้' }
    }
    skillNode.importance = importanceValue

    const importanceNode = {
      label: `ความสำคัญ${importanceValue ? ` (ปัจจุบัน: ${importanceDisplay})` : ''}`,
      key: genKey('importance'),
      type: 'importance',
      icon: 'priority_high',
      children: [
        { label: 'ต้องมี', key: genKey('imp-must'), type: 'importance_option', val: 'must', skillRef: skillNode, icon: 'check_box', children: [] },
        { label: 'เป็นประโยชน์', key: genKey('imp-nice'), type: 'importance_option', val: 'nice', skillRef: skillNode, icon: 'check_box', children: [] },
        { label: 'มีไม่มีก็ได้', key: genKey('imp-opt'), type: 'importance_option', val: 'optional', skillRef: skillNode, icon: 'check_box', children: [] }
      ]
    }

    const targetNode = {
      label: 'ระดับเป้าหมาย',
      score: targetScore,
      key: genKey('target'),
      type: 'target',
      icon: 'target',
      children: []
    }

    const beYear = getThaiBEYear()
    const reasonShort = safeTrim(reasonText)

    const monthNodes = MONTHS.map((m) => ({
      label: m,
      monthName: m,
      score: currentScore,
      key: genKey(`month-${m}`),
      type: 'assessment_month',
      icon: 'date_range',
      children: [
        { label: `เหตุผล: ${reasonShort}`, key: genKey(`reason-${m}`), type: 'reason', icon: 'comment', children: [] }
      ]
    }))

    const assessmentNode = {
      label: 'ผลการประเมิน',
      key: genKey('assessment'),
      type: 'assessment',
      icon: 'assignment_turned_in',
      children: [
        {
          label: `ปี พ.ศ. ${beYear}`,
          key: genKey('assessment_year'),
          type: 'assessment_year',
          icon: 'calendar_month',
          children: monthNodes
        }
      ]
    }

    targetNode.children = [assessmentNode]

    // order: importance -> target -> (others)
    skillNode.children = [
      importanceNode,
      targetNode,
      ...skillNode.children.filter(c => !['importance', 'target'].includes(c.type))
    ]
  } catch (err) {
    console.error(err)
    notifyError(`ไม่สามารถดึงข้อมูลสำหรับทักษะ "${skillNode.label}"`)
  } finally {
    loadingNodes.value.delete(key)
  }
}

/** -----------------------
 * Developments
 * ---------------------- */
const fetchDevelopments = async (skillNode) => {
  if (!skillNode) return

  const key = skillNode.key
  loadingNodes.value.add(key)
  pushMsg('user', `ช่วยเสนอวิธีพัฒนาทักษะ "${skillNode.label}"`)

  try {
    const payloadMessages = [
      { role: 'system', content: 'คุณเป็นที่ปรึกษาอาชีพ ช่วยแนะนำวิธีพัฒนาทักษะที่ปฏิบัติได้ง่ายและเหมาะกับนักเรียน' },
      { role: 'user', content: buildDevelopmentPrompt(skillNode.label) }
    ]

    const replyText = await callChat(payloadMessages)
    pushMsg('assistant', replyText || '')

    const developments = parseList(replyText).slice(0, 3)
    const devNodes = developments.map((dev, i) => ({
      label: `แผนลำดับที่ ${i + 1}: ${dev}`,
      key: genKey('dev'),
      type: 'development',
      icon: 'build_circle',
      children: [
        {
          label: 'หลักฐานหรือร่องรอยแห่งความสำเร็จ',
          key: genKey('evidence'),
          type: 'evidence',
          val: '',
          icon: 'emoji_events',
          children: []
        }
      ]
    }))

    const devGroupNode = {
      label: 'แผนการพัฒนา',
      key: genKey('dev_group'),
      type: 'development_group',
      icon: 'build_circle',
      children: devNodes
    }

    skillNode.children = skillNode.children.filter(c => c.type !== 'development_group' && c.type !== 'development')
    skillNode.children.push(devGroupNode)

    notifyOk('ดึงแผนการพัฒนาสำเร็จ')
  } catch (err) {
    console.error(err)
    notifyError('ไม่สามารถดึงวิธีพัฒนาได้')
  } finally {
    loadingNodes.value.delete(key)
  }
}

/** -----------------------
 * Companies
 * ---------------------- */
const fetchCompanies = async (careerNode) => {
  if (!careerNode) return

  const key = careerNode.key
  loadingNodes.value.add(key)
  pushMsg('user', `ช่วยแนะนำบริษัทที่เหมาะกับอาชีพ "${careerNode.label}"`)

  try {
    const skillNodes = (careerNode.children || []).filter(c => c.type === 'skill')
    const skillsText = skillNodes.length ? skillNodes.map(s => s.label).join(', ') : ''

    const payloadMessages = [
      { role: 'system', content: 'คุณเป็นผู้เชี่ยวชาญด้านตลาดแรงงานไทย ช่วยแนะนำบริษัทที่เหมาะสมตามทักษะและโปรไฟล์นักเรียน' },
      { role: 'user', content: buildCompaniesPrompt(careerNode.label, skillsText) }
    ]

    const replyText = await callChat(payloadMessages)
    pushMsg('assistant', replyText || '')

    const companies = parseList(replyText).slice(0, 3)
    const companyNodes = companies.map((company) => ({
      label: company,
      key: genKey('company'),
      type: 'company',
      icon: 'business',
      children: []
    }))

    const companyGroupNode = {
      label: 'บริษัทที่แนะนำ',
      key: genKey('company_group'),
      type: 'company_group',
      icon: 'domain',
      children: companyNodes
    }

    careerNode.children = careerNode.children.filter(c => c.type !== 'company_group')
    careerNode.children.push(companyGroupNode)

    notifyOk('ดึงบริษัทแนะนำสำเร็จ')
  } catch (err) {
    console.error(err)
    notifyError('ไม่สามารถดึงบริษัทได้')
  } finally {
    loadingNodes.value.delete(key)
  }
}

/** -----------------------
 * Excel Export
 * ---------------------- */
const exportToExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('ICP Scorecard')

    worksheet.mergeCells('A1:M1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'OpenThaiGPT – ผู้ช่วยแนะแนวอาชีพสำหรับนักเรียน'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center' }

    let currentRow = 3

    worksheet.mergeCells(`A${currentRow}:M${currentRow}`)
    const profileHeader = worksheet.getCell(`A${currentRow}`)
    profileHeader.value = 'ข้อมูลโปรไฟล์นักเรียน'
    profileHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    profileHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    profileHeader.alignment = { horizontal: 'left', indent: 1 }
    currentRow++

    const labelStyle = { font: { bold: true }, alignment: { horizontal: 'right', vertical: 'top' } }
    const valueStyle = { alignment: { horizontal: 'left', vertical: 'top', wrapText: true } }
    const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

    const addProfileRow = (label, value) => {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`)
      worksheet.mergeCells(`C${currentRow}:M${currentRow}`)

      const c1 = worksheet.getCell(`A${currentRow}`)
      c1.value = label
      c1.font = labelStyle.font
      c1.alignment = labelStyle.alignment
      c1.border = border

      const c2 = worksheet.getCell(`C${currentRow}`)
      c2.value = value || '-'
      c2.alignment = valueStyle.alignment
      c2.border = border

      currentRow++
    }

    const f = icpForm.value
    addProfileRow('ชื่อ:', f.name)
    addProfileRow('จังหวัด:', f.province)
    addProfileRow('ภาวะความพิการ:', f.disability)
    addProfileRow('สายการเรียน:', f.studyProgram)
    addProfileRow('วิชาที่ชอบ:', f.favoriteSubject)
    addProfileRow('อุปกรณ์ที่จำเป็น:', f.unfavoriteSubject)
    addProfileRow('กิจกรรมที่ชอบทำ:', f.favoriteActivity)
    addProfileRow('ความถนัด / ทักษะเด่น:', f.skill)
    addProfileRow('อาชีพในฝัน:', f.dreamCareer)
    addProfileRow('ภาค/จังหวัดที่อยากอยู่:', f.preferredRegion)
    addProfileRow('ข้อมูลเพิ่มเติม:', f.additionalInfo)

    currentRow += 2

    worksheet.mergeCells(`A${currentRow}:M${currentRow}`)
    const careerRow = worksheet.getCell(`A${currentRow}`)
    const careerText = treeData.value.length
      ? treeData.value.map(c => c.label.split('(')[0].trim()).join(', ')
      : (f.dreamCareer || '-')

    careerRow.value = {
      richText: [
        { font: { bold: true, size: 12 }, text: 'ข้อมูลด้านทักษะอาชีพที่แนะนำ:  ' },
        { font: { color: { argb: 'FF0000FF' }, underline: true, size: 12 }, text: `  ${careerText}  ` }
      ]
    }
    careerRow.alignment = { wrapText: true, vertical: 'middle' }
    currentRow += 2

    // Column widths
    worksheet.getColumn('A').width = 30
    worksheet.getColumn('B').width = 25
    worksheet.getColumn('C').width = 12
    worksheet.getColumn('D').width = 8
    worksheet.getColumn('E').width = 8
    worksheet.getColumn('F').width = 8
    worksheet.getColumn('G').width = 8
    worksheet.getColumn('H').width = 25
    worksheet.getColumn('I').width = 25
    worksheet.getColumn('J').width = 25
    worksheet.getColumn('K').width = 25
    worksheet.getColumn('L').width = 25
    worksheet.getColumn('M').width = 25

    // Header
    const headerRowStart = currentRow
    worksheet.getCell(`A${currentRow}`).value = 'คุณสมบัติหรือทักษะที่ต้องการ'
    worksheet.mergeCells(`A${currentRow}:A${currentRow + 1}`)

    worksheet.getCell(`B${currentRow}`).value = 'ความสำคัญ'
    worksheet.mergeCells(`B${currentRow}:B${currentRow + 1}`)

    worksheet.getCell(`C${currentRow}`).value = 'ระดับ\nเป้าหมาย'
    worksheet.mergeCells(`C${currentRow}:C${currentRow + 1}`)

    worksheet.getCell(`D${currentRow}`).value = 'ผลการประเมินตนเอง'
    worksheet.mergeCells(`D${currentRow}:G${currentRow}`)

    worksheet.getCell(`H${currentRow}`).value = 'แผนพัฒนาทักษะ (แผนที่ 1)'
    worksheet.mergeCells(`H${currentRow}:H${currentRow + 1}`)
    worksheet.getCell(`I${currentRow}`).value = 'หลักฐาน/ร่องรอย'
    worksheet.mergeCells(`I${currentRow}:I${currentRow + 1}`)

    worksheet.getCell(`J${currentRow}`).value = 'แผนพัฒนาทักษะ (แผนที่ 2)'
    worksheet.mergeCells(`J${currentRow}:J${currentRow + 1}`)
    worksheet.getCell(`K${currentRow}`).value = 'หลักฐาน/ร่องรอย'
    worksheet.mergeCells(`K${currentRow}:K${currentRow + 1}`)

    worksheet.getCell(`L${currentRow}`).value = 'แผนพัฒนาทักษะ (แผนที่ 3)'
    worksheet.mergeCells(`L${currentRow}:L${currentRow + 1}`)
    worksheet.getCell(`M${currentRow}`).value = 'หลักฐาน/ร่องรอย'
    worksheet.mergeCells(`M${currentRow}:M${currentRow + 1}`)

    const subHeaderRow = currentRow + 1
    worksheet.getCell(`D${subHeaderRow}`).value = 'ก.ย.'
    worksheet.getCell(`E${subHeaderRow}`).value = 'ต.ค.'
    worksheet.getCell(`F${subHeaderRow}`).value = 'พ.ย.'
    worksheet.getCell(`G${subHeaderRow}`).value = 'ธ.ค.'

    const center = { vertical: 'middle', horizontal: 'center', wrapText: true }
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } }

    const headerCols = ['A', 'B', 'C', 'D', 'H', 'I', 'J', 'K', 'L', 'M']
    const subCols = ['D', 'E', 'F', 'G']
    for (const col of headerCols) {
      const c = worksheet.getCell(`${col}${headerRowStart}`)
      c.alignment = center
      c.font = { bold: true }
      c.border = border
      c.fill = headerFill
    }
    for (const col of subCols) {
      const c = worksheet.getCell(`${col}${subHeaderRow}`)
      c.alignment = center
      c.font = { bold: true }
      c.border = border
      c.fill = headerFill
    }

    currentRow += 2

    // Data rows
    const getEvidenceVal = (devNode) => {
      const ev = devNode?.children?.find(c => c.type === 'evidence')
      return ev?.val ? ev.val : '-'
    }

    const findMonthNode = (skillNode, monthLabel) => {
      const targetNode = skillNode.children?.find(c => c.type === 'target')
      const assessmentNode = targetNode?.children?.find(c => c.type === 'assessment')
      const yearNode = assessmentNode?.children?.find(c => c.type === 'assessment_year')
      return yearNode?.children?.find(m => m.monthName === monthLabel)
    }

    for (const careerNode of treeData.value) {
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`)
      const c = worksheet.getCell(`A${currentRow}`)
      c.value = `อาชีพ: ${careerNode.label}`
      c.font = { bold: true, italic: true, size: 11 }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } }
      c.border = border
      currentRow++

      const skills = (careerNode.children || []).filter(x => x.type === 'skill')
      if (!skills.length) {
        worksheet.mergeCells(`A${currentRow}:M${currentRow}`)
        worksheet.getCell(`A${currentRow}`).value = '(ยังไม่ได้ดึงข้อมูลทักษะ)'
        worksheet.getCell(`A${currentRow}`).border = border
        currentRow++
        continue
      }

      let idx = 1
      for (const s of skills) {
        const row = currentRow

        worksheet.getCell(`A${row}`).value = `${idx}) ${s.label}`
        worksheet.getCell(`A${row}`).alignment = { vertical: 'top', wrapText: true }

        const imp = s.importance
        worksheet.getCell(`B${row}`).value =
          (imp === 'must' ? '☑' : '☐') + ' ต้องมี\n' +
          (imp === 'nice' ? '☑' : '☐') + ' มีแล้วเป็นประโยชน์\n' +
          (imp === 'optional' ? '☑' : '☐') + ' มีหรือไม่มีก็ได้'
        worksheet.getCell(`B${row}`).alignment = { vertical: 'top', wrapText: true }

        const targetNode = s.children?.find(c => c.type === 'target')
        worksheet.getCell(`C${row}`).value = targetNode?.score ? `${targetNode.score}/5` : '-'
        worksheet.getCell(`C${row}`).alignment = { vertical: 'top', horizontal: 'center' }

        const sep = findMonthNode(s, 'ก.ย.')
        const oct = findMonthNode(s, 'ต.ค.')
        const nov = findMonthNode(s, 'พ.ย.')
        const dec = findMonthNode(s, 'ธ.ค.')

        const score = (m) => (m?.score ? `${m.score}/5` : '')
        worksheet.getCell(`D${row}`).value = score(sep)
        worksheet.getCell(`E${row}`).value = score(oct)
        worksheet.getCell(`F${row}`).value = score(nov)
        worksheet.getCell(`G${row}`).value = score(dec)
        ;['D', 'E', 'F', 'G'].forEach(col => {
          worksheet.getCell(`${col}${row}`).alignment = { vertical: 'top', horizontal: 'center' }
        })

        const devGroup = s.children?.find(c => c.type === 'development_group')
        const devNodes = devGroup?.children || []
        const d1 = devNodes[0]
        const d2 = devNodes[1]
        const d3 = devNodes[2]

        worksheet.getCell(`H${row}`).value = d1?.label || '-'
        worksheet.getCell(`I${row}`).value = d1 ? getEvidenceVal(d1) : '-'
        worksheet.getCell(`J${row}`).value = d2?.label || '-'
        worksheet.getCell(`K${row}`).value = d2 ? getEvidenceVal(d2) : '-'
        worksheet.getCell(`L${row}`).value = d3?.label || '-'
        worksheet.getCell(`M${row}`).value = d3 ? getEvidenceVal(d3) : '-'

        ;['H','I','J','K','L','M'].forEach(col => {
          worksheet.getCell(`${col}${row}`).alignment = { vertical: 'top', wrapText: true }
        })

        // borders A-M
        ;['A','B','C','D','E','F','G','H','I','J','K','L','M'].forEach(col => {
          worksheet.getCell(`${col}${row}`).border = border
        })

        idx++
        currentRow++
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `ICP_Scorecard_${icpForm.value.name}.xlsx`)
  } catch (error) {
    console.error('Export Error:', error)
    notifyError('เกิดข้อผิดพลาดในการส่งออก Excel')
  }
}

/** -----------------------
 * Portfolio PDF
 * ---------------------- */
const showPortfolio = ref(false)
const portfolioLoading = ref(false)

// ใช้ <img> เพื่อให้ html2canvas จับภาพง่ายขึ้น
const portfolioPhoto = ref('https://cdn.quasar.dev/img/avatar2.jpg')

const waitImagesLoaded = async (rootEl) => {
  const imgs = Array.from(rootEl.querySelectorAll('img'))
  await Promise.all(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(res => {
            img.onload = res
            img.onerror = res
          })
    )
  )
}

const exportToPdf = async () => {
  portfolioLoading.value = true
  try {
    await nextTick()

    const element = document.getElementById('portfolio-content')
    if (!element) return

    // ✅ Clone ออกนอก dialog เพื่อเลี่ยง scroll/transform ของ Quasar
    const clone = element.cloneNode(true)
    clone.id = 'portfolio-content-clone'
    clone.style.position = 'fixed'
    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.zIndex = '99999'
    clone.style.transform = 'none'
    clone.style.background = '#fff'
    clone.style.overflow = 'hidden'
    document.body.appendChild(clone)

    await waitImagesLoaded(clone)

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    document.body.removeChild(clone)

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()

    // ✅ รักษาอัตราส่วน (ไม่ยืด)
    const imgH = (canvas.height * pageW) / canvas.width
    const y = imgH < pageH ? (pageH - imgH) / 2 : 0

    pdf.addImage(imgData, 'PNG', 0, y, pageW, imgH)
    pdf.save(`Portfolio_${icpForm.value.name}.pdf`)
  } catch (err) {
    console.error(err)
    notifyError('เกิดข้อผิดพลาดในการสร้าง PDF')
  } finally {
    portfolioLoading.value = false
  }
}

/** -----------------------
 * Portfolio Preview Data
 * ---------------------- */
const getWorkPlans = (career) => {
  if (!career?.children) return []
  const skillNodes = career.children.filter(c => c.type === 'skill')
  const plans = []

  for (const s of skillNodes) {
    const grp = s.children?.find(x => x.type === 'development_group')
    if (grp?.children?.length) plans.push(...grp.children)
  }
  return plans
}

const previewTreeData = computed(() => {
  return treeData.value
})
</script>

<template>
  <q-page class="q-pa-md relative-position">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5 text-bold text-teal-9">
        <q-icon name="psychology" size="md" class="q-mr-sm" />
        OpenThaiGPT – ผู้ช่วยแนะแนวอาชีพสำหรับนักเรียน
      </div>
    </div>

    <!-- 1) ICP Form -->
    <q-card class="q-pa-md">
      <div class="text-subtitle1 text-primary q-mb-sm">โปรไฟล์นักเรียน (ICP Scorecard)</div>
      <div class="text-caption text-grey-7 q-mb-md">แก้ไขข้อมูลตามนักเรียนจริงได้เลย (มีตัวอย่าง "น้องเอ" ไว้ให้)</div>

      <q-form class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6"><q-input v-model="icpForm.name" label="ชื่อ" outlined dense /></div>
          <div class="col-12 col-md-6"><q-input v-model="icpForm.province" label="จังหวัด" outlined dense /></div>
        </div>

        <q-input v-model="icpForm.disability" label="ภาวะความพิการ" hint="เช่น ไม่มี, บกพร่องทางการเห็น ฯลฯ" outlined dense />
        <q-input v-model="icpForm.studyProgram" label="สายการเรียน" outlined dense />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6"><q-input v-model="icpForm.favoriteSubject" label="วิชาที่ชอบ" outlined dense /></div>
          <div class="col-12 col-md-6"><q-input v-model="icpForm.unfavoriteSubject" label="อุปกรณ์ที่จำเป็น" outlined dense /></div>
        </div>

        <q-input v-model="icpForm.favoriteActivity" label="กิจกรรมที่ชอบทำ" outlined dense />
        <q-input v-model="icpForm.skill" type="textarea" autogrow label="ความถนัด / ทักษะเด่น" outlined />
        <q-input v-model="icpForm.dreamCareer" label="อาชีพในฝัน" outlined dense />
        <q-input v-model="icpForm.preferredRegion" label="ภาค/จังหวัดที่อยากอยู่ตอนเรียน" outlined dense />
        <q-input v-model="icpForm.additionalInfo" type="textarea" autogrow label="ข้อมูลเพิ่มเติม" outlined />
      </q-form>
    </q-card>

    <!-- 2) Chat History -->
    <q-card class="q-pa-md q-mt-md" style="max-height: 40vh; overflow-y: auto">
      <div v-for="(m, i) in messages" :key="i" class="q-mb-md">
        <div
          class="q-pa-sm rounded-borders"
          :class="m.role === 'user' ? 'bg-primary text-white text-right' : 'bg-grey-3'"
        >
          <div class="text-caption q-mb-xs">{{ m.role === 'user' ? 'คุณ' : 'OpenThaiGPT' }}</div>
          <div style="white-space: pre-wrap">{{ m.content }}</div>
        </div>
      </div>
      <div v-if="loading" class="text-center text-grey q-py-md">กำลังประมวลผล...</div>
    </q-card>

    <!-- 3) Tree Structure -->
    <q-card v-if="treeData.length" class="q-pa-md q-mt-md">
      <div class="text-subtitle1 text-primary q-mb-md">
        อาชีพ → ทักษะ → ความสำคัญ → ระดับเป้าหมาย → ผลการประเมิน → วิธีพัฒนา / บริษัท
      </div>

      <q-tree
        :nodes="treeData"
        node-key="key"
        label-key="label"
        children-key="children"
        default-expand-all
      >
        <template v-slot:default-header="prop">
          <div class="row items-center q-gutter-xs full-width">
            <q-checkbox
              v-if="prop.node.type === 'importance_option'"
              dense
              size="xs"
              :model-value="prop.node.skillRef?.importance === prop.node.val"
              @update:model-value="(checked) => {
                if (!prop.node.skillRef) return
                if (checked) prop.node.skillRef.importance = prop.node.val
                else if (prop.node.skillRef.importance === prop.node.val) prop.node.skillRef.importance = null
              }"
            />

            <q-icon
              v-if="prop.node.type !== 'importance_option'"
              :name="prop.node.icon || (prop.node.children?.length ? 'folder_open' : 'description')"
              :color="
                prop.node.type === 'skill' ? 'orange' :
                prop.node.type === 'importance' ? 'pink' :
                prop.node.type === 'target' ? 'red' :
                prop.node.type === 'assessment' ? 'indigo' :
                prop.node.type === 'assessment_year' ? 'deep-purple' :
                prop.node.type === 'assessment_month' ? 'blue' :
                prop.node.type === 'development' || prop.node.type === 'development_group' ? 'green' :
                prop.node.type === 'company' || prop.node.type === 'company_group' ? 'teal' :
                'grey-7'
              "
            />

            <span class="text-body1">
              <template v-if="prop.node.type === 'target'">
                <span>ระดับเป้าหมาย: </span>
                <q-input
                  v-model="prop.node.score"
                  dense
                  borderless
                  class="q-px-xs inline-block"
                  style="width: 40px; text-align: center;"
                  input-class="text-center text-red text-bold"
                />
                <span> / 5</span>
              </template>

              <template v-else-if="prop.node.type === 'assessment_month'">
                <span>{{ prop.node.monthName }} ผลประเมิน </span>
                <q-input
                  v-model="prop.node.score"
                  dense
                  borderless
                  class="q-px-xs inline-block"
                  style="width: 40px; text-align: center;"
                  input-class="text-center text-blue text-bold"
                />
                <span> / 5</span>
              </template>

              <template v-else-if="prop.node.type === 'evidence'">
                <span>{{ prop.node.label }}: </span>
                <q-input
                  v-model="prop.node.val"
                  dense
                  borderless
                  placeholder="ระบุ..."
                  class="q-px-xs inline-block"
                  style="min-width: 150px;"
                  input-class="text-green-9 text-bold"
                />
              </template>

              <template v-else>
                {{ prop.node.label }}
              </template>
            </span>

            <q-space />

            <q-btn
              v-if="prop.node.type === 'career'"
              flat round dense size="sm"
              icon="assessment"
              color="orange"
              :loading="loadingNodes.has(prop.node.key)"
              @click.stop="fetchSkills(prop.node)"
            >
              <q-tooltip>ดึงทักษะ + การประเมิน</q-tooltip>
            </q-btn>

            <q-btn
              v-if="prop.node.type === 'skill'"
              flat round dense size="sm"
              icon="build"
              color="green"
              :loading="loadingNodes.has(prop.node.key)"
              @click.stop="fetchDevelopments(prop.node)"
            >
              <q-tooltip>วิธีพัฒนาทักษะ</q-tooltip>
            </q-btn>

            <q-btn
              v-if="prop.node.type === 'career'"
              flat round dense size="sm"
              icon="business"
              color="teal"
              :loading="loadingNodes.has(prop.node.key)"
              @click.stop="fetchCompanies(prop.node)"
            >
              <q-tooltip>แนะนำบริษัท</q-tooltip>
            </q-btn>
          </div>
        </template>
      </q-tree>
    </q-card>

    <!-- Controls -->
    <div class="row items-end q-gutter-md q-mt-md">
      <div class="col">
        <q-input
          v-model.number="userInput"
          type="number"
          min="1"
          max="15"
          outlined
          dense
          label="จำนวนอาชีพที่ต้องการ"
          hint="แนะนำ 5-10 อาชีพ"
        />
      </div>

      <q-btn
        color="primary"
        label="ช่วยเสนอแนะอาชีพ"
        icon="psychology"
        :loading="loading"
        :disable="loading"
        @click="sendMessage"
      />

      <q-space />

      <q-btn
        color="purple"
        label="Portfolio"
        icon="assignment_ind"
        :disable="treeData.length === 0"
        @click="showPortfolio = true"
      />
      <q-btn
        color="green"
        label="Export Excel"
        icon="file_download"
        :disable="treeData.length === 0"
        @click="exportToExcel"
      />
    </div>

    <!-- Portfolio Dialog -->
    <q-dialog v-model="showPortfolio" full-width full-height maximized>
      <q-card class="bg-grey-3">
        <q-toolbar class="bg-white text-primary shadow-1">
          <q-toolbar-title>Portfolio Preview</q-toolbar-title>
          <q-space />
          <q-btn flat label="Export PDF" color="primary" icon="picture_as_pdf" :loading="portfolioLoading" @click="exportToPdf" />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="row justify-center q-pa-md scroll" style="height: calc(100vh - 50px)">
          <div id="portfolio-content" class="portfolio-a4">
            <!-- Left Column -->
            <div class="portfolio-left">
              <div class="decor-circle decor-circle--green"></div>
              <div class="decor-circle decor-circle--pink"></div>

              <div class="portfolio-left-content">
                <div class="name-block">
                  <div class="name">{{ icpForm.name }}</div>
                  <div class="title">{{ icpForm.dreamCareer || 'GRAPHIC DESIGNER' }}</div>

                  <div class="q-mt-md" v-if="previewTreeData.length > 0">
                    <div style="font-weight: 700; color: #4e342e; font-size: 0.9rem; margin-bottom: 4px;">อาชีพที่แนะนำ:</div>
                    <div class="text-body2 text-grey-8" style="font-size: 0.85rem; line-height: 1.4;">
                      {{ previewTreeData.map(c => cleanCareerName(c.label)).join(', ') }}
                    </div>
                  </div>

                  <div class="divider"></div>
                </div>

                <div class="section">
                  <div class="section-title">About Me</div>
                  <p class="section-text">
                    {{ icpForm.additionalInfo || 'นักเรียนที่มีความมุ่งมั่นและตั้งใจในการพัฒนาตนเอง...' }}
                  </p>
                </div>

                <div class="section">
                  <div class="section-title">Skills</div>
                  <div v-if="previewTreeData.length > 0">
                    <div v-for="(career, cIdx) in previewTreeData" :key="cIdx" class="q-mb-md">
                      <div class="text-subtitle2 text-brown q-mb-xs" style="font-weight: 700;">
                        อาชีพที่แนะนำ: {{ cleanCareerName(career.label) }}
                      </div>
                      <div
                        v-for="(skill, sIdx) in (career.children || []).filter(c => c.type === 'skill')"
                        :key="sIdx"
                        class="skill-row"
                      >
                        <div class="skill-label">{{ skill.label }}</div>
                        <div class="skill-bar">
                          <div class="skill-bar-fill" :style="{ width: `${60 + (sIdx * 5)}%` }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-caption text-grey">ยังไม่ได้ระบุทักษะ</div>
                </div>

                <div class="section contact">
                  <div class="section-title">Contact</div>
                  <div class="contact-row">
                    <div class="contact-icon"><q-icon name="person" color="white" size="14px" /></div>
                    <span>{{ icpForm.name }}</span>
                  </div>
                  <div class="contact-row">
                    <div class="contact-icon"><q-icon name="phone" color="white" size="14px" /></div>
                    <span>{{ icpForm.province }} (Tel: -)</span>
                  </div>
                  <div class="contact-row">
                    <div class="contact-icon"><q-icon name="email" color="white" size="14px" /></div>
                    <span>student@example.com</span>
                  </div>
                </div>

                <div class="decor-circle decor-circle--aqua-bottom"></div>
                <div class="decor-circle decor-circle--pink-bottom"></div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="portfolio-right">
              <div class="right-content">
                <div class="header-box">
                  <img
                    class="portfolio-photo cursor-pointer"
                    :src="portfolioPhoto"
                    crossorigin="anonymous"
                    @dblclick="triggerUpload"
                    title="ดับเบิ้ลคลิกเพื่อเปลี่ยนรูป"
                  />
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    style="display: none"
                    @change="onFileChange"
                  />
                  <div class="decor-top-right">
                    <svg width="150" height="150" viewBox="0 0 100 100">
                      <path d="M50 50 Q80 20 90 0 M50 50 Q90 60 100 40 M50 50 Q60 90 40 100"
                            stroke="#795548" stroke-width="12" fill="none" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>

                <div class="content-area">
                  <div class="right-section">
                    <div class="right-title">Education</div>

                    <div class="edu-row">
                      <div class="edu-key">Study Major</div>
                      <div class="edu-val">{{ icpForm.studyProgram || '-' }}</div>
                    </div>
                    <div class="edu-row">
                      <div class="edu-key">Liked Subjects</div>
                      <div class="edu-val">{{ icpForm.favoriteSubject || '-' }}</div>
                    </div>
                    <div class="edu-row">
                      <div class="edu-key">Disliked Subjects</div>
                      <div class="edu-val">{{ icpForm.unfavoriteSubject || '-' }}</div>
                    </div>
                    <div class="edu-row">
                      <div class="edu-key">Liked Activities</div>
                      <div class="edu-val">{{ icpForm.favoriteActivity || '-' }}</div>
                    </div>
                  </div>

                  <div class="right-section">
                    <div class="right-title">Experience Work</div>

                    <div v-if="previewTreeData.length > 0">
                      <div v-for="(career, cIdx) in previewTreeData.slice(0, 1)" :key="cIdx">
                        <div class="career-title">{{ career.label }}</div>

                        <div class="plan" v-for="i in 3" :key="i">
                          <div class="plan-head">
                            <q-icon name="check_circle" size="xs" class="q-mr-xs" color="teal" />
                            แผนพัฒนาทักษะ (แผนที่ {{ i }})
                          </div>

                          <div class="plan-body">
                            <div class="plan-text">
                              {{ getWorkPlans(career)[i-1] ? getWorkPlans(career)[i-1].label : '-' }}
                            </div>
                            <div class="plan-evidence">
                              <q-icon name="emoji_events" size="xs" class="q-mr-xs" />
                              {{
                                (getWorkPlans(career)[i-1] &&
                                  getWorkPlans(career)[i-1].children &&
                                  getWorkPlans(career)[i-1].children.find(c => c.type === 'evidence'))
                                  ? (getWorkPlans(career)[i-1].children.find(c => c.type === 'evidence').val || 'ยังไม่มีหลักฐาน')
                                  : ''
                              }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else class="text-body2 text-grey">ยังไม่มีข้อมูลแผนการพัฒนา</div>
                  </div>
                </div>
              </div>

              <!-- ✅ decorative behind content -->
              <div class="decor-bottom-right" aria-hidden="true">
                <svg width="300" height="300" viewBox="0 0 200 200">
                  <path fill="none" stroke="#8d6e63" stroke-width="4" d="M10,150 Q80,50 150,100 T250,150" />
                </svg>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.rounded-borders { border-radius: 12px; }

/* -------- Portfolio A4 -------- */
.portfolio-a4{
  width: 210mm;
  height: 297mm;
  background: #fff;
  display: flex;
  font-family: 'Lato', sans-serif;
  position: relative;
  overflow: hidden;
}

/* Left */
.portfolio-left{
  width: 35%;
  background: #fdfdfd;
  padding: 100px 20px 20px 30px;
  position: relative;
}
.portfolio-left-content{ position: relative; z-index: 2; }
.name-block{ margin: 24px 0 48px; }
.name{
  font-family: 'Playfair Display', serif;
  color: #3e2723;
  font-size: 2.8rem;
  line-height: 1.1;
  font-weight: 700;
}
.title{
  color: #00695c;
  letter-spacing: 3px;
  margin-top: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
}
.divider{ width: 60px; height: 4px; background: #00695c; margin-top: 20px; }

.section{ margin-bottom: 36px; }
.section-title{
  font-family: 'Playfair Display', serif;
  color: #4e342e;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
}
.section-text{
  font-size: 0.85rem;
  line-height: 1.6;
  color: #616161;
  margin: 0;
}

.skill-row{ margin-bottom: 14px; }
.skill-label{ color: #6d4c41; font-size: 0.75rem; margin-bottom: 4px; }
.skill-bar{ width: 100%; height: 8px; background: #eee; position: relative; }
.skill-bar-fill{ height: 100%; background: #f48fb1; position: absolute; left: 0; top: 0; }
.skill-bar-tip{ width: 15px; height: 100%; background: #004d40; position: absolute; top: 0; transform: translateX(-50%); }

.contact-row{ display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: #212121; font-size: 0.9rem; }
.contact-icon{
  width: 24px; height: 24px;
  background: #4e342e;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Decorative circles */
.decor-circle{ position: absolute; border-radius: 50%; pointer-events: none; }
.decor-circle--green{ top: -30px; left: -30px; width: 180px; height: 180px; background:#8da399; opacity:.9; z-index: 1; }
.decor-circle--pink{ top: 120px; left: -50px; width: 100px; height: 100px; background:#fce4ec; opacity:.7; z-index: 1; }
.decor-circle--aqua-bottom{ bottom: -80px; left: -60px; width: 160px; height: 160px; background:#a7ffeb; opacity:.3; z-index: 1; }
.decor-circle--pink-bottom{ bottom: 10px; left: -80px; width: 100px; height: 100px; background:#f8bbd0; opacity:.6; z-index: 1; }

/* Right */
.portfolio-right{
  width: 65%;
  position: relative; /* สำคัญ */
}
.right-content{
  position: relative;
  z-index: 2; /* ✅ ยกเนื้อหาให้เหนือของตกแต่ง */
}
.header-box{
  height: 220px;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.portfolio-photo{
  width: 160px;
  height: 160px;
  object-fit: cover;
  object-position: top center;
  z-index: 2;
}
.decor-top-right{
  position: absolute;
  top: -20px;
  right: -20px;
  z-index: 1;
  pointer-events: none;
}

.content-area{ padding: 10px 40px 40px 40px; margin-top: 10px; }
.right-section{ margin-bottom: 30px; }
.right-title{
  font-family: 'Playfair Display', serif;
  color: #4e342e;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.edu-row{ display: flex; align-items: center; margin-bottom: 12px; }
.edu-key{
  width: 35%;
  font-weight: 700;
  color: #212121;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
.edu-val{ width: 65%; color: #616161; font-size: 1rem; }

.career-title{ font-weight: 700; color: #5d4037; margin-bottom: 10px; }
.plan{ margin-bottom: 14px; }
.plan-head{ font-weight: 700; color: #00695c; font-size: 0.95rem; margin-bottom: 6px; }
.plan-body{
  background: #e0f2f1;
  padding: 8px 12px;
  border-radius: 8px;
}
.plan-text{ color: #424242; }
.plan-evidence{ margin-top: 6px; color: #00695c; font-size: 0.75rem; font-style: italic; }

/* ✅ Decorative bottom right behind content */
.decor-bottom-right{
  position: absolute;
  bottom: -50px;
  right: -50px;
  opacity: .6;
  z-index: 1;
  pointer-events: none;
}
</style>

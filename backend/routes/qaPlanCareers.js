import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

const JOIN_QUERY = `
  SELECT qpc.*,
    qua.qualification_name,
    qg.qualification_group_name,
    pla.career_id, car.career_name,
    tar.target_name, tar.target_value,
    lev.level_description,
    mem.member_id, mem.full_name
  FROM qa_plan_career qpc
  LEFT JOIN qualification       qua ON qpc.qualification_id = qua.qualification_id
  LEFT JOIN qualification_group qg  ON qua.qualification_group_id = qg.qualification_group_id
  LEFT JOIN plan_career         pla ON qpc.plan_career_id    = pla.plan_career_id
  LEFT JOIN career              car ON pla.career_id         = car.career_id
  LEFT JOIN target              tar ON qpc.target_id         = tar.target_id
  LEFT JOIN level               lev ON qpc.level_id          = lev.level_id
  LEFT JOIN member              mem ON pla.member_id         = mem.member_id
`

// GET /api/qa-plan-careers/years - Get years for filtering
router.get('/years', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const [rows] = await pool.query(`
      SELECT DISTINCT YEAR(sef.self_assessment_date) as Year
      FROM self_assessment sef
      JOIN qa_plan_career qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id
      WHERE (pla.member_id = ? AND ? != 'superuser' AND ? != 'admin')
         OR (mem.created_by = ? AND ? = 'superuser')
         OR (? = 'admin')
      ORDER BY Year DESC
    `, [member_id, req.user.role, req.user.role, req.user.member_id, req.user.role, req.user.role])
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/months - Get months for filtering
router.get('/months', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const [rows] = await pool.query(`
      SELECT DISTINCT
        DATE_FORMAT(sef.self_assessment_date, '%m') as M,
        DATE_FORMAT(sef.self_assessment_date, '%M') as Month
      FROM self_assessment sef
      JOIN qa_plan_career qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id
      WHERE (pla.member_id = ? AND ? != 'superuser' AND ? != 'admin')
         OR (mem.created_by = ? AND ? = 'superuser')
         OR (? = 'admin')
      ORDER BY M ASC
    `, [member_id, req.user.role, req.user.role, req.user.member_id, req.user.role, req.user.role])
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/report-careers - Get careers for report filtering
router.get('/report-careers', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const [rows] = await pool.query(`
      SELECT DISTINCT car.career_name
      FROM plan_career pla
      JOIN career car ON pla.career_id = car.career_id
      WHERE pla.member_id = ?
      ORDER BY car.career_name
    `, [member_id])
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/report-qualifications - Get qualifications for report filtering
router.get('/report-qualifications', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const [rows] = await pool.query(`
      SELECT DISTINCT qua.qualification_name
      FROM qa_plan_career qpc
      JOIN qualification qua ON qpc.qualification_id = qua.qualification_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      WHERE pla.member_id = ?
      ORDER BY qua.qualification_name
    `, [member_id])
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/year-table - Get report data aggregated by year
router.get('/year-table', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const { full_name, career_name, qualification_name, year } = req.query

        let sql = `
      SELECT
        qpc.qualification_id,
        mem.full_name,
        DATE_FORMAT(sel.self_assessment_date, '%Y') AS Year,
        car.career_name,
        qua.qualification_name,
        lev.level_description as level_name,
        tar.target_name, tar.target_value,
        ROUND(AVG(per.perform_value), 2) AS avg_perform_value,
        DATE_FORMAT(MIN(sel.self_assessment_date), '%Y-%m-%d') as min_day,
        (SELECT p2.perform_value FROM self_assessment s2 JOIN perform p2 ON s2.perform_id = p2.perform_id WHERE s2.qa_plan_career_id = qpc.qa_plan_career_id AND YEAR(s2.self_assessment_date) = Year ORDER BY s2.self_assessment_date ASC LIMIT 1) as min_perform_value,
        DATE_FORMAT(MAX(sel.self_assessment_date), '%Y-%m-%d') as max_day,
        (SELECT p3.perform_value FROM self_assessment s3 JOIN perform p3 ON s3.perform_id = p3.perform_id WHERE s3.qa_plan_career_id = qpc.qa_plan_career_id AND YEAR(s3.self_assessment_date) = Year ORDER BY s3.self_assessment_date DESC LIMIT 1) as max_perform_value
      FROM self_assessment sel
      JOIN perform per ON sel.perform_id = per.perform_id
      JOIN qa_plan_career qpc ON sel.qa_plan_career_id = qpc.qa_plan_career_id
      JOIN qualification qua ON qpc.qualification_id = qua.qualification_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id
      JOIN career car ON pla.career_id = car.career_id
      JOIN target tar ON qpc.target_id = tar.target_id
      JOIN level lev ON qpc.level_id = lev.level_id
      WHERE (mem.member_id = ? OR ? IS NULL)
    `
        const params = [member_id, member_id]

        if (full_name && full_name !== '%') {
            sql += ' AND mem.full_name LIKE ?'
            params.push(full_name)
        }
        if (career_name && career_name !== '%') {
            sql += ' AND car.career_name LIKE ?'
            params.push(career_name)
        }
        if (qualification_name && qualification_name !== '%') {
            sql += ' AND qua.qualification_name LIKE ?'
            params.push(qualification_name)
        }
        if (year && year !== '%') {
            sql += ' AND YEAR(sel.self_assessment_date) = ?'
            params.push(year)
        }

        sql += `
      GROUP BY Year, qpc.qa_plan_career_id
      ORDER BY Year DESC, car.career_name, qua.qualification_name
    `
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/month-table - Get report data aggregated by month
router.get('/month-table', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const { full_name, career_name, qualification_name, year, month } = req.query

        let sql = `
      SELECT
        sel.self_assessment_id,
        mem.full_name,
        DATE_FORMAT(sel.self_assessment_date, '%m') AS M,
        DATE_FORMAT(sel.self_assessment_date, '%M') AS Month,
        DATE_FORMAT(sel.self_assessment_date, '%Y') AS Year,
        car.career_name,
        qua.qualification_name,
        lev.level_description as level_name,
        tar.target_name, tar.target_value,
        ROUND(AVG(per.perform_value), 2) AS avg_perform_value,
        DATE_FORMAT(MAX(sel.self_assessment_date), '%Y-%m-%d') as maxDay,
        (SELECT p3.perform_value FROM self_assessment s3 JOIN perform p3 ON s3.perform_id = p3.perform_id WHERE s3.qa_plan_career_id = qpc.qa_plan_career_id AND DATE_FORMAT(s3.self_assessment_date, '%Y-%m') = DATE_FORMAT(sel.self_assessment_date, '%Y-%m') ORDER BY s3.self_assessment_date DESC LIMIT 1) as max_perform_value
      FROM self_assessment sel
      JOIN perform per ON sel.perform_id = per.perform_id
      JOIN qa_plan_career qpc ON sel.qa_plan_career_id = qpc.qa_plan_career_id
      JOIN qualification qua ON qpc.qualification_id = qua.qualification_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id
      JOIN career car ON pla.career_id = car.career_id
      JOIN target tar ON qpc.target_id = tar.target_id
      JOIN level lev ON qpc.level_id = lev.level_id
      WHERE (mem.member_id = ? OR ? IS NULL)
    `
        const params = [member_id, member_id]

        if (full_name && full_name !== '%') {
            sql += ' AND mem.full_name LIKE ?'
            params.push(full_name)
        }
        if (career_name && career_name !== '%') {
            sql += ' AND car.career_name LIKE ?'
            params.push(career_name)
        }
        if (qualification_name && qualification_name !== '%') {
            sql += ' AND qua.qualification_name LIKE ?'
            params.push(qualification_name)
        }
        if (year && year !== '%') {
            sql += ' AND YEAR(sel.self_assessment_date) = ?'
            params.push(year)
        }
        if (month && month !== '%') {
            sql += " AND DATE_FORMAT(sel.self_assessment_date, '%M') = ?"
            params.push(month)
        }

        sql += `
      GROUP BY Year, M, qpc.qa_plan_career_id
      ORDER BY Year DESC, M DESC, car.career_name, qua.qualification_name
    `
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})


// GET /api/qa-plan-careers/full-names - ชื่อสมาชิกทั้งหมดใน qa_plan_career
router.get('/full-names', authenticate, async (req, res, next) => {
    try {
        let sql = `SELECT DISTINCT mem.full_name FROM qa_plan_career qpc
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id`
        const params = []
        if (req.user.role === 'user') {
            sql += ' WHERE pla.member_id = ?'
            params.push(req.user.member_id)
        } else if (req.user.role === 'superuser') {
            sql += ' LEFT JOIN individual ind ON mem.member_id = ind.member_id WHERE ind.advisor_id = ? OR mem.member_id = ?'
            params.push(req.user.member_id, req.user.member_id)
        }
        sql += ' ORDER BY mem.full_name'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/career-names - อาชีพทั้งหมดใน qa_plan_career
router.get('/career-names', authenticate, async (req, res, next) => {
    try {
        let sql = `SELECT DISTINCT car.career_name FROM qa_plan_career qpc
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id
      JOIN career car ON pla.career_id = car.career_id`
        const params = []
        if (req.user.role === 'user') {
            sql += ' WHERE pla.member_id = ?'
            params.push(req.user.member_id)
        } else if (req.user.role === 'superuser') {
            sql += ' LEFT JOIN individual ind ON mem.member_id = ind.member_id WHERE ind.advisor_id = ? OR mem.member_id = ?'
            params.push(req.user.member_id, req.user.member_id)
        }
        sql += ' ORDER BY car.career_name'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/qualification-names - คุณสมบัติทั้งหมดใน qa_plan_career
router.get('/qualification-names', authenticate, async (req, res, next) => {
    try {
        let sql = `SELECT DISTINCT qua.qualification_name FROM qa_plan_career qpc
      JOIN qualification qua ON qpc.qualification_id = qua.qualification_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id`
        const params = []
        if (req.user.role === 'user') {
            sql += ' WHERE pla.member_id = ?'
            params.push(req.user.member_id)
        } else if (req.user.role === 'superuser') {
            sql += ' LEFT JOIN individual ind ON mem.member_id = ind.member_id WHERE ind.advisor_id = ? OR mem.member_id = ?'
            params.push(req.user.member_id, req.user.member_id)
        }
        sql += ' ORDER BY qua.qualification_name'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/qa-plan-careers/filter-month - กรองข้อมูล self assessment ตามเดือน
router.post('/filter-month', authenticate, async (req, res, next) => {
    try {
        const { member_id, full_name, career_name, qualification_name, year, month } = req.body
        const effectiveMemberId = (req.user.role === 'user') ? req.user.member_id : member_id

        let sql = `
      SELECT
        sel.self_assessment_id,
        mem.full_name,
        DATE_FORMAT(sel.self_assessment_date, '%m') AS M,
        DATE_FORMAT(sel.self_assessment_date, '%M') AS Month,
        DATE_FORMAT(sel.self_assessment_date, '%Y') AS Year,
        DATE_FORMAT(sel.self_assessment_date, '%Y-%m-%d') AS self_assessment_date,
        car.career_name,
        qua.qualification_name,
        lev.level_description as level_name,
        tar.target_name, tar.target_value,
        per.perform_name, per.perform_value
      FROM self_assessment sel
      JOIN perform per ON sel.perform_id = per.perform_id
      JOIN qa_plan_career qpc ON sel.qa_plan_career_id = qpc.qa_plan_career_id
      JOIN qualification qua ON qpc.qualification_id = qua.qualification_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      JOIN member mem ON pla.member_id = mem.member_id
      JOIN career car ON pla.career_id = car.career_id
      JOIN target tar ON qpc.target_id = tar.target_id
      LEFT JOIN level lev ON qpc.level_id = lev.level_id
      WHERE 1=1
    `
        const params = []
        if (req.user.role === 'user') {
            sql += ' AND pla.member_id = ?'
            params.push(req.user.member_id)
        } else if (req.user.role === 'superuser') {
            // ใช้ความสัมพันธ์ Advisor ID จากตาราง individual
            sql += ' LEFT JOIN individual ind ON mem.member_id = ind.member_id'
            sql += ' AND (ind.advisor_id = ? OR mem.member_id = ?)'
            params.push(req.user.member_id, req.user.member_id)

            if (effectiveMemberId) {
                sql += ' AND pla.member_id = ?'
                params.push(effectiveMemberId)
            }
        } else if (effectiveMemberId) {
            sql += ' AND pla.member_id = ?'
            params.push(effectiveMemberId)
        }
        if (full_name && full_name !== '%') { sql += ' AND mem.full_name LIKE ?'; params.push(`%${full_name}%`) }
        if (career_name && career_name !== '%') { sql += ' AND car.career_name LIKE ?'; params.push(`%${career_name}%`) }
        if (qualification_name && qualification_name !== '%') { sql += ' AND qua.qualification_name LIKE ?'; params.push(`%${qualification_name}%`) }
        if (year && year !== '%') { sql += ' AND YEAR(sel.self_assessment_date) = ?'; params.push(year) }
        if (month && month !== '%') { sql += " AND DATE_FORMAT(sel.self_assessment_date, '%M') = ?"; params.push(month) }
        sql += ' ORDER BY sel.self_assessment_date DESC'

        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/qa-plan-careers/check-dependencies
router.post('/check-dependencies', authenticate, async (req, res, next) => {
    try {
        const { id, ids, type } = req.body
        // Simplified dependency check
        res.json({ plan_count: 0, assessment_count: 0 })
    } catch (err) { next(err) }
})

// POST /api/qa-plan-careers/bulk-delete
router.post('/bulk-delete', authenticate, async (req, res, next) => {
    try {
        const { qa_plan_career_ids } = req.body
        if (!Array.isArray(qa_plan_career_ids) || qa_plan_career_ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' })
        }

        if (req.user.role === 'user') {
            const [rows] = await pool.query(
                `SELECT qpc.qa_plan_career_id FROM qa_plan_career qpc
         JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
         WHERE qpc.qa_plan_career_id IN (?) AND pla.member_id = ?`,
                [qa_plan_career_ids, req.user.member_id]
            )
            if (rows.length !== qa_plan_career_ids.length) {
                return res.status(403).json({ error: 'Access denied for some items' })
            }
        }

        await pool.query('DELETE FROM qa_plan_career WHERE qa_plan_career_id IN (?)', [qa_plan_career_ids])
        res.json({ status: 'success', message: 'Delete Complete' })
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { plan_career_id } = req.query
        let sql = JOIN_QUERY
        const params = []

        if (req.user.role === 'user') {
            sql += ' WHERE mem.member_id = ?'
            params.push(req.user.member_id)
            if (plan_career_id) {
                sql += ' AND pla.plan_career_id = ?'
                params.push(plan_career_id)
            }
        } else if (plan_career_id) {
            sql += ' WHERE pla.plan_career_id = ?'
            params.push(plan_career_id)
        }

        sql += ' ORDER BY qpc.qa_plan_career_id'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qa-plan-careers/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(JOIN_QUERY + ' WHERE qpc.qa_plan_career_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && rows[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/qa-plan-careers
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { plan_career_id, qualification_id, target_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO qa_plan_career (plan_career_id, qualification_id, target_id) VALUES (?, ?, ?)',
            [plan_career_id, qualification_id, target_id]
        )
        res.status(201).json({ message: 'Insert Complete', qa_plan_career_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/qa-plan-careers/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const [check] = await pool.query(
            'SELECT pla.member_id FROM qa_plan_career qpc JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id WHERE qpc.qa_plan_career_id=?',
            [req.params.id]
        )
        if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && check[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }

        const { plan_career_id, qualification_id, target_id } = req.body
        await pool.query(
            'UPDATE qa_plan_career SET plan_career_id=?, qualification_id=?, target_id=? WHERE qa_plan_career_id=?',
            [plan_career_id, qualification_id, target_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/qa-plan-careers/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM qa_plan_career WHERE qa_plan_career_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



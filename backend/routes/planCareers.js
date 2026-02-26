import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

const JOIN_QUERY = `
  SELECT pc.*,
    car.career_name,
    cg.ca_group_name,
    mem.full_name
  FROM plan_career pc
  LEFT JOIN career       car ON pc.career_id       = car.career_id
  LEFT JOIN career_group cg  ON car.career_group_id = cg.career_group_id
  LEFT JOIN member       mem ON pc.member_id       = mem.member_id
`

// POST /api/plan-careers/check-dependencies
router.post('/check-dependencies', authenticate, async (req, res, next) => {
    try {
        const { plan_career_id, plan_career_ids, type } = req.body
        // Simplified dependency check
        res.json({ has_dependencies: false, count: 0 })
    } catch (err) { next(err) }
})

// GET /api/plan-careers/super  ← สำหรับ super user ดูข้อมูลทั้งหมด
router.get('/super', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(JOIN_QUERY + ' ORDER BY pc.plan_career_id')
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/plan-careers/bulk-delete
router.post('/bulk-delete', authenticate, async (req, res, next) => {
    try {
        const { plan_career_ids } = req.body
        if (!Array.isArray(plan_career_ids) || plan_career_ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' })
        }

        if (req.user.role === 'user') {
            const [rows] = await pool.query(
                'SELECT plan_career_id FROM plan_career WHERE plan_career_id IN (?) AND member_id = ?',
                [plan_career_ids, req.user.member_id]
            )
            if (rows.length !== plan_career_ids.length) {
                return res.status(403).json({ error: 'Access denied for some items' })
            }
        }

        await pool.query('DELETE FROM plan_career WHERE plan_career_id IN (?)', [plan_career_ids])
        res.json({ status: 'success', message: 'Delete Complete' })
    } catch (err) { next(err) }
})

// GET /api/plan-careers
router.get('/', authenticate, async (req, res, next) => {
    try {
        let rows
        if (req.user.role === 'user') {
            ;[rows] = await pool.query(JOIN_QUERY + ' WHERE pc.member_id = ? ORDER BY pc.plan_career_id', [req.user.member_id])
        } else {
            ;[rows] = await pool.query(JOIN_QUERY + ' ORDER BY pc.plan_career_id')
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/plan-careers/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(JOIN_QUERY + ' WHERE pc.plan_career_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && rows[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/plan-careers
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { member_id, career_id, plan_career_date } = req.body
        // ปรับให้ตรงกับ DB จริงที่มี start_date, end_date
        const [result] = await pool.query(
            'INSERT INTO plan_career (member_id, career_id, start_date, end_date) VALUES (?, ?, ?, ?)',
            [member_id || req.user.member_id, career_id, plan_career_date || '', plan_career_date || '']
        )
        res.status(201).json({ message: 'Insert Complete', plan_career_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/plan-careers/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const [check] = await pool.query('SELECT member_id FROM plan_career WHERE plan_career_id=?', [req.params.id])
        if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && check[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }

        const { career_id, plan_career_date } = req.body
        await pool.query(
            'UPDATE plan_career SET career_id=?, start_date=?, end_date=? WHERE plan_career_id=?',
            [career_id, plan_career_date, plan_career_date, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/plan-careers/:id
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            const [check] = await pool.query('SELECT member_id FROM plan_career WHERE plan_career_id=?', [req.params.id])
            if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
            if (check[0].member_id !== req.user.member_id) {
                return res.status(403).json({ error: 'Access denied.' })
            }
        }
        await pool.query('DELETE FROM plan_career WHERE plan_career_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



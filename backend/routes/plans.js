import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

const JOIN_QUERY = `
  SELECT p.*,
    dev.development_name,
    imp.importance_name,
    fre.frequency_name,
    qpc.qa_plan_career_id, qpc.plan_career_id, qpc.qualification_id,
    qua.qualification_name,
    pc.career_id, car.career_name,
    m.full_name, m.member_id
  FROM plan p
  LEFT JOIN development    dev ON p.development_id    = dev.development_id
  LEFT JOIN importance     imp ON p.importance_id     = imp.importance_id
  LEFT JOIN frequency      fre ON p.frequency_id      = fre.frequency_id
  LEFT JOIN qa_plan_career qpc ON p.qa_plan_career_id = qpc.qa_plan_career_id
  LEFT JOIN qualification  qua ON qpc.qualification_id = qua.qualification_id
  LEFT JOIN plan_career    pc  ON qpc.plan_career_id   = pc.plan_career_id
  LEFT JOIN career         car ON pc.career_id         = car.career_id
  LEFT JOIN member         m   ON pc.member_id         = m.member_id
`

// GET /api/plans
router.get('/', authenticate, async (req, res, next) => {
    try {
        let rows
        if (req.user.role === 'user') {
            ;[rows] = await pool.query(JOIN_QUERY + ' WHERE pc.member_id = ? ORDER BY p.plan_id', [req.user.member_id])
        } else {
            ;[rows] = await pool.query(JOIN_QUERY + ' ORDER BY p.plan_id')
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/plans/check-dependencies (compatibility)
router.post('/check-dependencies', authenticate, async (req, res, next) => {
    try {
        const { plan_id, plan_ids, type } = req.body
        // In this simple version, we'll just check if plan exists.
        // If there were evidence/evaluation tables, we would check them here.
        res.json({ has_dependencies: false, count: 0 })
    } catch (err) { next(err) }
})

// POST /api/plans/bulk-delete (compatibility)
router.post('/bulk-delete', authenticate, async (req, res, next) => {
    try {
        const { plan_ids } = req.body
        if (!Array.isArray(plan_ids) || plan_ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' })
        }

        // For users, verify ownership of all plans before deleting
        if (req.user.role === 'user') {
            const [rows] = await pool.query(
                `SELECT p.plan_id FROM plan p
         JOIN qa_plan_career qpc ON p.qa_plan_career_id = qpc.qa_plan_career_id
         JOIN plan_career pc ON qpc.plan_career_id = pc.plan_career_id
         WHERE p.plan_id IN (?) AND pc.member_id = ?`,
                [plan_ids, req.user.member_id]
            )
            if (rows.length !== plan_ids.length) {
                return res.status(403).json({ error: 'Access denied for some items' })
            }
        }

        await pool.query('DELETE FROM plan WHERE plan_id IN (?)', [plan_ids])
        res.json({ status: 'success', message: 'Delete Complete' })
    } catch (err) { next(err) }
})

// GET /api/plans/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(JOIN_QUERY + ' WHERE p.plan_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && rows[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/plans
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { qa_plan_career_id, development_id, plan_title, plan_channel, importance_id, frequency_id, plan_start_date, plan_end_date } = req.body
        const [result] = await pool.query(
            `INSERT INTO plan (qa_plan_career_id, development_id, plan_title, plan_channel, importance_id, frequency_id, plan_start_date, plan_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [qa_plan_career_id, development_id, plan_title, plan_channel, importance_id, frequency_id, plan_start_date, plan_end_date]
        )
        res.status(201).json({ message: 'Insert Complete', plan_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/plans/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const [check] = await pool.query(
            `SELECT pc.member_id FROM plan p
       JOIN qa_plan_career qpc ON p.qa_plan_career_id = qpc.qa_plan_career_id
       JOIN plan_career pc ON qpc.plan_career_id = pc.plan_career_id
       WHERE p.plan_id=?`,
            [req.params.id]
        )
        if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && check[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }

        const { qa_plan_career_id, development_id, plan_title, plan_channel, importance_id, frequency_id, plan_start_date, plan_end_date } = req.body
        await pool.query(
            `UPDATE plan SET qa_plan_career_id=?, development_id=?, plan_title=?, plan_channel=?, importance_id=?, frequency_id=?, plan_start_date=?, plan_end_date=?
       WHERE plan_id=?`,
            [qa_plan_career_id, development_id, plan_title, plan_channel, importance_id, frequency_id, plan_start_date, plan_end_date, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/plans/:id - admin only
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM plan WHERE plan_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

const JOIN_QUERY = `
  SELECT sef.*,
    qpc.qa_plan_career_id, qpc.plan_career_id, qpc.qualification_id, qpc.target_id,
    qua.qualification_name,
    pla.career_id,
    car.career_name,
    tar.target_name,
    per.perform_name,
    mem.member_id, mem.full_name
  FROM self_assessment as sef
  LEFT JOIN qa_plan_career as qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
  LEFT JOIN qualification  as qua ON qpc.qualification_id = qua.qualification_id
  LEFT JOIN plan_career    as pla ON qpc.plan_career_id = pla.plan_career_id
  LEFT JOIN career         as car ON pla.career_id = car.career_id
  LEFT JOIN target         as tar ON qpc.target_id = tar.target_id
  LEFT JOIN perform        as per ON sef.perform_id = per.perform_id
  LEFT JOIN member         as mem ON pla.member_id = mem.member_id
`

// GET /api/self-assessments/perform - Get performance levels
router.get('/perform', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM perform')
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/self-assessments - Get all assessments
router.get('/', authenticate, async (req, res, next) => {
    try {
        let rows
        if (req.user.role === 'user') {
            ;[rows] = await pool.query(JOIN_QUERY + ' WHERE mem.member_id = ?', [req.user.member_id])
        } else {
            ;[rows] = await pool.query(JOIN_QUERY + ' ORDER BY sef.self_assessment_id')
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/self-assessments/qa/:qa_id - Get assessment by QA ID
router.get('/qa/:qa_id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(JOIN_QUERY + ' WHERE sef.qa_plan_career_id = ?', [req.params.qa_id])
        if (rows.length === 0) return res.json([]) // Return empty array if not found like PHP

        const assessment = rows[0]
        if (req.user.role === 'user' && assessment.member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/self-assessments/references - backward compat: get references by member_id query param
// ⚠️ MUST be before /:id to prevent Express matching 'references' as :id
router.get('/references', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const [rows] = await pool.query(`
      SELECT ref.*
      FROM reference ref
      JOIN self_assessment sef ON ref.self_assessment_id = sef.self_assessment_id
      JOIN qa_plan_career qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
      JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
      WHERE pla.member_id = ?
    `, [member_id])
        res.json(rows)
    } catch (err) { next(err) }
})

// PUT /api/self-assessments/references/:id
// ⚠️ MUST be before /:id
router.put('/references/:id', authenticate, async (req, res, next) => {
    try {
        const { reference_description, plan_id } = req.body
        await pool.query(
            'UPDATE reference SET reference_description=?, plan_id=? WHERE reference_id=?',
            [reference_description, plan_id || null, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/self-assessments/references/:id
// ⚠️ MUST be before /:id
router.delete('/references/:id', authenticate, async (req, res, next) => {
    try {
        await pool.query('DELETE FROM reference WHERE reference_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

// GET /api/self-assessments/:id - Get single assessment
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(JOIN_QUERY + ' WHERE sef.self_assessment_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })

        if (req.user.role === 'user' && rows[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/self-assessments
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { self_assessment_date, qa_plan_career_id, perform_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO self_assessment (self_assessment_date, qa_plan_career_id, perform_id) VALUES (?, ?, ?)',
            [self_assessment_date, qa_plan_career_id, perform_id]
        )
        res.status(201).json({ message: 'Insert Complete', self_assessment_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/self-assessments/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        // Check ownership
        const [check] = await pool.query(
            `SELECT pla.member_id FROM self_assessment sef
       JOIN qa_plan_career qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
       JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
       WHERE sef.self_assessment_id = ?`,
            [req.params.id]
        )
        if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && check[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }

        const { self_assessment_date, qa_plan_career_id, perform_id } = req.body
        await pool.query(
            'UPDATE self_assessment SET self_assessment_date=?, qa_plan_career_id=?, perform_id=? WHERE self_assessment_id=?',
            [self_assessment_date, qa_plan_career_id, perform_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/self-assessments/:id
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        // Check ownership or admin
        if (req.user.role !== 'admin') {
            const [check] = await pool.query(
                `SELECT pla.member_id FROM self_assessment sef
         JOIN qa_plan_career qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
         JOIN plan_career pla ON qpc.plan_career_id = pla.plan_career_id
         WHERE sef.self_assessment_id = ?`,
                [req.params.id]
            )
            if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
            if (check[0].member_id !== req.user.member_id) {
                return res.status(403).json({ error: 'Access denied.' })
            }
        }

        await pool.query('DELETE FROM self_assessment WHERE self_assessment_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

// GET /api/self-assessments/:id/references - Get references for a specific assessment
router.get('/:id/references', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM reference WHERE self_assessment_id = ?', [req.params.id])
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/self-assessments/:id/references - Insert a single reference
router.post('/:id/references', authenticate, async (req, res, next) => {
    try {
        const { reference_description, plan_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO reference (self_assessment_id, plan_id, reference_description) VALUES (?, ?, ?)',
            [req.params.id, plan_id || null, reference_description]
        )
        res.status(201).json({ message: 'Insert Complete', reference_id: result.insertId })
    } catch (err) { next(err) }
})

// POST /api/self-assessments/:id/references/bulk - Insert multiple references
router.post('/:id/references/bulk', authenticate, async (req, res, next) => {
    try {
        const { references } = req.body
        if (!Array.isArray(references) || references.length === 0) {
            return res.status(400).json({ error: 'No references provided' })
        }

        const values = references.map(ref => [
            req.params.id,
            ref.plan_id || null,
            ref.reference_description
        ])

        await pool.query(
            'INSERT INTO reference (self_assessment_id, plan_id, reference_description) VALUES ?',
            [values]
        )
        res.status(201).json({ message: 'Insert Complete' })
    } catch (err) { next(err) }
})

// NOTE: PUT /references/:id and DELETE /references/:id have been moved ABOVE /:id (see above)

// POST /api/self-assessments/bulk-delete
router.post('/bulk-delete', authenticate, async (req, res, next) => {
    try {
        const { ids } = req.body
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' })
        }

        const conn = await pool.getConnection()
        try {
            await conn.beginTransaction()
            await conn.query('DELETE FROM reference WHERE self_assessment_id IN (?)', [ids])
            await conn.query('DELETE FROM self_assessment WHERE self_assessment_id IN (?)', [ids])
            await conn.commit()
            res.json({ message: 'Delete Complete', deleted: ids.length })
        } catch (err) {
            await conn.rollback()
            throw err
        } finally {
            conn.release()
        }
    } catch (err) { next(err) }
})

// POST /api/self-assessments/check-dependencies - Single or Bulk
router.post('/check-dependencies', authenticate, async (req, res, next) => {
    try {
        const { id, ids } = req.body
        const targetIds = ids || (id ? [id] : [])
        if (targetIds.length === 0) return res.json({ has_dependencies: false, count: 0 })

        const [rows] = await pool.query('SELECT COUNT(*) as count FROM reference WHERE self_assessment_id IN (?)', [targetIds])
        res.json({ has_dependencies: rows[0].count > 0, count: rows[0].count })
    } catch (err) { next(err) }
})

// NOTE: GET /references has been moved ABOVE /:id (see above)

export default router



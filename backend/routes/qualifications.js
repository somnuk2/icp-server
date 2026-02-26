import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/qualifications
router.get('/', authenticate, async (req, res, next) => {
    try {
        let rows
        if (req.user.role === 'user') {
            ;[rows] = await pool.query(
                `SELECT qa.*, car.career_name
         FROM qa_plan_career as qa_pc
         INNER JOIN qualification as qa ON qa_pc.qualification_id = qa.qualification_id
         INNER JOIN plan_career as pc ON qa_pc.plan_career_id = pc.plan_career_id
         INNER JOIN career as car ON pc.career_id = car.career_id
         WHERE pc.member_id = ?`,
                [req.user.member_id]
            )
        } else {
            // PHP version of getall for admin/superuser
            ;[rows] = await pool.query(
                `SELECT qa_pc.*, qa.qualification_name, car.career_name
         FROM qa_plan_career as qa_pc
         INNER JOIN qualification as qa ON qa_pc.qualification_id = qa.qualification_id
         INNER JOIN plan_career as pc ON qa_pc.plan_career_id = pc.plan_career_id
         INNER JOIN career as car ON pc.career_id = car.career_id`
            )
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qualifications/list - ดึงรายการ qualification ทั้งหมด (สำหรับ dropdown)
router.get('/list', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
      SELECT q.*, qg.qualification_group_name
      FROM qualification q
      LEFT JOIN qualification_group qg ON q.qualification_group_id = qg.qualification_group_id
      ORDER BY q.qualification_id
    `)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qualifications/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM qualification WHERE qualification_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/qualifications
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { member_id, qualification_name, qualification_group_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO qualification (member_id, qualification_name, qualification_group_id) VALUES (?, ?, ?)',
            [member_id || req.user.member_id, qualification_name, qualification_group_id]
        )
        res.status(201).json({ message: 'Insert Complete', qualification_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/qualifications/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { qualification_name, qualification_group_id } = req.body
        await pool.query(
            'UPDATE qualification SET qualification_name=?, qualification_group_id=? WHERE qualification_id=?',
            [qualification_name, qualification_group_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/qualifications/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM qualification WHERE qualification_id = ?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/degrees
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { faculty_id } = req.query
        let sql = 'SELECT d.*, f.faculty_name, i.institute_name FROM degree d LEFT JOIN faculty f ON d.faculty_id = f.faculty_id LEFT JOIN institute i ON f.institute_id = i.institute_id'
        const params = []

        if (faculty_id) {
            sql += ' WHERE d.faculty_id = ?'
            params.push(faculty_id)
        }

        sql += ' ORDER BY d.degree_id'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/degrees/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT d.*, f.faculty_name, i.institute_name FROM degree d LEFT JOIN faculty f ON d.faculty_id = f.faculty_id LEFT JOIN institute i ON f.institute_id = i.institute_id WHERE d.degree_id = ?',
            [req.params.id]
        )
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/degrees - admin only
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { degree_name, faculty_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO degree (degree_name, faculty_id) VALUES (?, ?)',
            [degree_name, faculty_id]
        )
        res.status(201).json({ message: 'Insert Complete', degree_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/degrees/:id - admin only
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { degree_name, faculty_id } = req.body
        await pool.query(
            'UPDATE degree SET degree_name=?, faculty_id=? WHERE degree_id=?',
            [degree_name, faculty_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/degrees/:id - admin only
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM degree WHERE degree_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



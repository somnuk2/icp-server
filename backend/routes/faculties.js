import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/faculties
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { institute_id } = req.query
        let sql = 'SELECT f.*, i.institute_name FROM faculty f LEFT JOIN institute i ON f.institute_id = i.institute_id'
        const params = []

        if (institute_id) {
            sql += ' WHERE f.institute_id = ?'
            params.push(institute_id)
        }

        sql += ' ORDER BY f.faculty_id'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/faculties/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT f.*, i.institute_name FROM faculty f LEFT JOIN institute i ON f.institute_id = i.institute_id WHERE f.faculty_id = ?',
            [req.params.id]
        )
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/faculties - admin only
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { faculty_name, institute_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO faculty (faculty_name, institute_id) VALUES (?, ?)',
            [faculty_name, institute_id]
        )
        res.status(201).json({ message: 'Insert Complete', faculty_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/faculties/:id - admin only
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { faculty_name, institute_id } = req.body
        await pool.query(
            'UPDATE faculty SET faculty_name=?, institute_id=? WHERE faculty_id=?',
            [faculty_name, institute_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/faculties/:id - admin only
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM faculty WHERE faculty_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



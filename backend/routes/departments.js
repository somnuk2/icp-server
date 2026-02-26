import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/departments
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { degree_id } = req.query
        let sql = `SELECT dep.*, deg.degree_name, f.faculty_name, i.institute_name
       FROM department dep
       LEFT JOIN degree  deg ON dep.degree_id    = deg.degree_id
       LEFT JOIN faculty f   ON deg.faculty_id   = f.faculty_id
       LEFT JOIN institute i ON f.institute_id   = i.institute_id`
        const params = []

        if (degree_id) {
            sql += ' WHERE dep.degree_id = ?'
            params.push(degree_id)
        }

        sql += ' ORDER BY dep.department_id'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/departments - admin only
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { department_id, department_name, degree_id } = req.body
        await pool.query(
            'INSERT INTO department (department_id, department_name, degree_id) VALUES (?, ?, ?)',
            [department_id, department_name, degree_id]
        )
        res.status(201).json({ message: 'Insert Complete' })
    } catch (err) { next(err) }
})

// PUT /api/departments/:id - admin only
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { department_name, degree_id } = req.body
        await pool.query(
            'UPDATE department SET department_name=?, degree_id=? WHERE department_id=?',
            [department_name, degree_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/departments/:id - admin only
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM department WHERE department_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/projects
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM project ORDER BY project_name')
        res.json(rows)
    } catch (err) { next(err) }
})

// POST /api/projects - admin only
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { project_name } = req.body
        const [result] = await pool.query(
            'INSERT INTO project (project_name) VALUES (?)',
            [project_name]
        )
        res.status(201).json({ message: 'Insert Complete', project_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/projects/:id - admin only
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { project_name } = req.body
        await pool.query(
            'UPDATE project SET project_name=? WHERE project_id=?',
            [project_name, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/projects/:id - admin only
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM project WHERE project_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



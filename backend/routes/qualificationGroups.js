import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/qualification-groups
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM qualification_group ORDER BY qualification_group_id')
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/qualification-groups/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM qualification_group WHERE qualification_group_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/qualification-groups
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { qualification_group_name, qualification_group_description } = req.body
        const [result] = await pool.query(
            'INSERT INTO qualification_group (qualification_group_name, qualification_group_description) VALUES (?, ?)',
            [qualification_group_name, qualification_group_description]
        )
        res.status(201).json({ message: 'Insert Complete', qualification_group_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/qualification-groups/:id
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { qualification_group_name, qualification_group_description } = req.body
        await pool.query(
            'UPDATE qualification_group SET qualification_group_name=?, qualification_group_description=? WHERE qualification_group_id=?',
            [qualification_group_name, qualification_group_description, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/qualification-groups/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM qualification_group WHERE qualification_group_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



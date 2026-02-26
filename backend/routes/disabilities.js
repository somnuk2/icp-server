import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/disabilities
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM disability ORDER BY disability_id')
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/disabilities/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM disability WHERE disability_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/disabilities
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { disability_name } = req.body
        const [result] = await pool.query(
            'INSERT INTO disability (disability_name) VALUES (?)',
            [disability_name]
        )
        res.status(201).json({ message: 'Insert Complete', disability_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/disabilities/:id
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { disability_name } = req.body
        await pool.query(
            'UPDATE disability SET disability_name = ? WHERE disability_id = ?',
            [disability_name, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/disabilities/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM disability WHERE disability_id = ?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



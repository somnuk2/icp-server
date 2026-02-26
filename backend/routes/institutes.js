import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/institutes - ทุก role อ่านได้
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM institute ORDER BY institute_id')
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/institutes/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM institute WHERE institute_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/institutes - admin เท่านั้น
router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { institute_name, institute_address } = req.body
        const [result] = await pool.query(
            'INSERT INTO institute (institute_name, institute_address) VALUES (?, ?)',
            [institute_name, institute_address || '']
        )
        res.status(201).json({ message: 'Insert Complete', institute_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/institutes/:id - admin เท่านั้น
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { institute_name, institute_address } = req.body
        await pool.query(
            'UPDATE institute SET institute_name=?, institute_address=? WHERE institute_id=?',
            [institute_name, institute_address || '', req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/institutes/:id - admin เท่านั้น
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM institute WHERE institute_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/careers/groups  ← ต้องอยู่ก่อน /:id เสมอ
router.get('/groups', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM career_group ORDER BY career_group_id')
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/careers
router.get('/', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
      SELECT c.*, cg.ca_group_name
      FROM career c
      LEFT JOIN career_group cg ON c.career_group_id = cg.career_group_id
      ORDER BY c.career_id
    `)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/careers/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
      SELECT c.*, cg.ca_group_name
      FROM career c
      LEFT JOIN career_group cg ON c.career_group_id = cg.career_group_id
      WHERE c.career_id = ?
    `, [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/careers
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { career_name, career_group_id } = req.body
        const [result] = await pool.query(
            'INSERT INTO career (career_name, career_group_id) VALUES (?, ?)',
            [career_name, career_group_id]
        )
        res.status(201).json({ message: 'Insert Complete', career_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/careers/:id
router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { career_name, career_group_id } = req.body
        await pool.query(
            'UPDATE career SET career_name=?, career_group_id=? WHERE career_id=?',
            [career_name, career_group_id, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/careers/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM career WHERE career_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



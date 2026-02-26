import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/notifications - Get all (admin/suser) or by member_id (query param)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id
        let sql = `
            SELECT noti.*, fre.frequency_name
            FROM notification noti
            LEFT JOIN frequency fre ON noti.notification_type = fre.frequency_id
        `
        const params = []

        if (member_id) {
            sql += ' WHERE noti.member_id = ?'
            params.push(member_id)
        } else if (req.user.role === 'user') {
            sql += ' WHERE noti.member_id = ?'
            params.push(req.user.member_id)
        }

        sql += ' ORDER BY noti.notification_id DESC'
        const [rows] = await pool.query(sql, params)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/notifications/latest - ดึงแจ้งเตือนล่าสุดของสมาชิก (เหมือน action=getallNotify)
router.get('/latest', authenticate, async (req, res, next) => {
    try {
        const member_id = req.query.member_id || req.user.member_id
        const [rows] = await pool.query(`
            SELECT noti.*, fre.frequency_name
            FROM notification noti
            LEFT JOIN frequency fre ON noti.notification_type = fre.frequency_id
            WHERE noti.member_id = ?
            ORDER BY noti.notification_id DESC
            LIMIT 1
        `, [member_id])

        if (rows.length === 0) return res.json({})
        res.json(rows[0])
    } catch (err) { next(err) }
})

// GET /api/notifications/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT noti.*, fre.frequency_name
            FROM notification noti
            LEFT JOIN frequency fre ON noti.notification_type = fre.frequency_id
            WHERE noti.notification_id = ?
        `, [req.params.id])

        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/notifications
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { member_id, is_notification, notification_date, notification_type, message } = req.body
        const [result] = await pool.query(
            'INSERT INTO notification (member_id, is_notification, notification_date, notification_type, message) VALUES (?, ?, ?, ?, ?)',
            [member_id || req.user.member_id, is_notification || 0, notification_date || new Date(), notification_type || 1, message || '']
        )
        res.status(201).json({ message: 'Insert Complete', notification_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/notifications/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { member_id, is_notification, notification_date, notification_type, message } = req.body
        await pool.query(
            'UPDATE notification SET member_id=?, is_notification=?, notification_date=?, notification_type=?, message=? WHERE notification_id=?',
            [member_id, is_notification, notification_date, notification_type, message, req.params.id]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        await pool.query('DELETE FROM notification WHERE notification_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



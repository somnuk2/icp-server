import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// GET /api/members - admin/suser เห็นทั้งหมด (ตามเงื่อนไข), user เห็นตัวเอง, guest เห็นทั้งหมด
router.get('/', optionalAuthenticate, async (req, res, next) => {
    try {
        let rows
        // Case: User is logged in
        if (req.user) {
            if (req.user.role === 'user') {
                ;[rows] = await pool.query(
                    'SELECT member_id, full_name, email, status, is_verified FROM member WHERE member_id = ?',
                    [req.user.member_id]
                )
            } else if (req.user.role === 'suser') {
                ;[rows] = await pool.query(`
                    SELECT DISTINCT m.member_id, m.full_name, m.email, m.status, m.is_verified, m.created_by
                    FROM member m
                    LEFT JOIN individual i ON m.member_id = i.member_id
                    WHERE (i.advisor_id = ? OR m.created_by = ? OR m.member_id = ?)
                    ORDER BY m.member_id
                `, [req.user.member_id, req.user.member_id, req.user.member_id])
            } else {
                // admin
                ;[rows] = await pool.query(
                    'SELECT member_id, full_name, email, status, is_verified, created_by FROM member ORDER BY member_id'
                )
            }
        } 
        // Case: Guest access (Prevent listing members)
        else {
            rows = [] // Return empty to protect privacy
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/members/options - สำหรับดึงรายชื่อสมาชิกมาใส่ Dropdown (เหมือน action=getMember)
router.get('/options', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT member_id, full_name, status FROM member ORDER BY full_name'
        )
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/members/created_by/:id - ดึง members ที่สร้างโดย admin/suser นี้
router.get('/created_by/:id', authenticate, async (req, res, next) => {
    console.log(`🔍 [API] GET /api/members/created_by/${req.params.id}`)
    try {
        const [rows] = await pool.query(
            'SELECT member_id, full_name, email, status, is_verified, created_by FROM member WHERE created_by = ? ORDER BY member_id',
            [req.params.id]
        )
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/members/:id/individual - Get detailed individual data (merged member + individual + details)
router.get('/:id/individual', authenticate, async (req, res, next) => {
    try {
        if (req.user.role === 'user' && req.user.member_id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        const [rows] = await pool.query(`
      SELECT
        m.member_id, m.full_name, m.email, m.status, m.is_verified, m.created_by,
        i.individual_id, i.birthday, i.telephone, i.department_id,
        i.is_graduate, i.date, i.year, i.is_disability, i.disability_id,
        i.dis_description, i.project_id, i.advisor_id, i.province, i.preferred_region,
        i.favorite_subject, i.unfavorite_subject, i.favorite_activity, i.dream_career,
        i.skill, i.additional_info,
        a.full_name as advisor_name,
        d.disability_name,
        dp.department_name,
        dg.degree_id, dg.degree_name,
        f.faculty_id, f.faculty_name,
        ins.institute_id, ins.institute_name,
        prj.project_name
      FROM member m
      LEFT JOIN individual i ON m.member_id = i.member_id
      LEFT JOIN member a ON i.advisor_id = a.member_id
      LEFT JOIN disability d ON i.disability_id = d.disability_id
      LEFT JOIN department dp ON i.department_id = dp.department_id
      LEFT JOIN degree dg ON dp.degree_id = dg.degree_id
      LEFT JOIN faculty f ON dg.faculty_id = f.faculty_id
      LEFT JOIN institute ins ON f.institute_id = ins.institute_id
      LEFT JOIN project prj ON i.project_id = prj.project_id
      WHERE m.member_id = ?
    `, [req.params.id])

        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// GET /api/members/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        if (req.user.role === 'user' && req.user.member_id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        const [rows] = await pool.query(
            'SELECT member_id, full_name, email, status, is_verified FROM member WHERE member_id = ?',
            [req.params.id]
        )
        if (rows.length === 0) return res.status(404).json({ error: 'Member not found.' })
        res.json(rows[0])
    } catch (err) { next(err) }
})

// PUT /api/members/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const memberId = parseInt(req.params.id);
        const { full_name, email, password, status, is_verified } = req.body

        // Check permissions
        if (req.user.role === 'user' && req.user.member_id !== memberId) {
            return res.status(403).json({ error: 'Access denied.' })
        }

        if (req.user.role === 'suser') {
            // Check if suser owns this member or is advisor
            const [check] = await pool.query(
                'SELECT member_id FROM member WHERE member_id = ? AND created_by = ?',
                [memberId, req.user.member_id]
            );
            // Also check individual table if advisor
            const [check2] = await pool.query(
                'SELECT member_id FROM individual WHERE member_id = ? AND advisor_id = ?',
                [memberId, req.user.member_id]
            );

            if (check.length === 0 && check2.length === 0 && req.user.member_id !== memberId) {
                return res.status(403).json({ error: 'Access denied. You do not manage this member.' })
            }
        }

        // Prepare updates
        let query = 'UPDATE member SET full_name=?, email=?'
        let params = [full_name, email]

        if (password) {
            const hashed = await bcrypt.hash(password, 10)
            query += ', password=?'
            params.push(hashed)
        }

        if (status && (req.user.role === 'admin' || req.user.role === 'suser')) {
            query += ', status=?'
            params.push(status)
        }

        if (is_verified !== undefined && (req.user.role === 'admin' || req.user.role === 'suser')) {
            query += ', is_verified=?'
            params.push(is_verified)
        }

        query += ' WHERE member_id=?'
        params.push(memberId)

        await pool.query(query, params)
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/members/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM member WHERE member_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

export default router



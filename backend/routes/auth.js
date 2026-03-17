import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password, gemini_api_key } = req.body
        console.log(`🔐 Login Attempt: ${email}`)

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' })
        }

        const [rows] = await pool.query(
            'SELECT * FROM member WHERE email = ?', [email]
        )

        if (rows.length === 0) {
            console.log(`❌ User not found: ${email}`)
            return res.status(401).json({ error: 'Invalid email or password.' })
        }

        const member = rows[0]

        // Update API Key if provided during login
        if (gemini_api_key) {
            await pool.query('UPDATE member SET gemini_api_key = ? WHERE member_id = ?', [gemini_api_key, member.member_id])
            member.gemini_api_key = gemini_api_key
        }

        // Support both hashed and plain passwords
        let isValid = false
        if (member.password && member.password.startsWith('$2')) {
            isValid = await bcrypt.compare(password, member.password)
        } else {
            isValid = password === member.password
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' })
        }

        const role = member.status || 'user'

        const token = generateToken({
            member_id: member.member_id,
            email: member.email,
            role,
            full_name: member.full_name || ''
        })

        res.json({
            token,
            member_id: member.member_id,
            email: member.email,
            role,
            full_name: member.full_name || '',
            gemini_api_key: member.gemini_api_key || null
        })
    } catch (err) {
        next(err)
    }
})

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, full_name, status, created_by, is_verified } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' })
        }

        // Check duplicate
        const [existing] = await pool.query('SELECT member_id FROM member WHERE email = ?', [email])
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' })
        }

        const hashed = await bcrypt.hash(password, 10)
        const [result] = await pool.query(
            'INSERT INTO member (email, password, full_name, status, is_verified, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashed, full_name || '', status || 'user', is_verified !== undefined ? is_verified : 1, created_by || 0]
        )

        res.status(201).json({ message: 'Registered successfully.', member_id: result.insertId })
    } catch (err) {
        next(err)
    }
})


// POST /api/auth/logout (client-side token removal, server just acknowledges)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully.' })
})

export default router



import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body
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
        console.log(`🔍 Found Member: ${member.email}, Status: ${member.status}`)

        // Support both hashed and plain passwords
        let isValid = false
        if (member.password && member.password.startsWith('$2')) {
            console.log('📦 Using Bcrypt comparison')
            isValid = await bcrypt.compare(password, member.password)
        } else {
            console.log('📝 Using Plain text comparison')
            isValid = password === member.password
        }

        console.log(`⚖️ Password Match: ${isValid}`)

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' })
        }

        // Role comes from 'status' field: 'admin', 'superuser', 'user'
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
            full_name: member.full_name || ''
        })
    } catch (err) {
        next(err)
    }
})

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, full_name, status } = req.body
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
            'INSERT INTO member (email, password, full_name, status, is_verified) VALUES (?, ?, ?, ?, ?)',
            [email, hashed, full_name || '', status || 'user', 1] // Set is_verified=1 for now as per previous logic or if email verification is handled separately
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



import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'icp2022-secret-key-change-in-production'

// Middleware: ตรวจสอบ JWT Token
export function authenticate(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded // { member_id, email, role }
        next()
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' })
    }
}

// Helper: สร้าง JWT Token
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export { JWT_SECRET }



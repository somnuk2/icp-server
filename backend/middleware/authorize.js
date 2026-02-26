// Middleware: ตรวจสอบ Role
// ใช้หลัง authenticate middleware เสมอ
// roles = ['admin', 'superuser', 'user'] หรือ subset ของมัน

export function authorize(roles = []) {
    if (typeof roles === 'string') roles = [roles]

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated.' })
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}`
            })
        }

        next()
    }
}

// Role constants
export const ROLES = {
    ADMIN: 'admin',
    SUPERUSER: 'superuser',
    USER: 'user',
}

// Role hierarchy helpers
export const isAdmin = (role) => role === ROLES.ADMIN
export const isSuperUser = (role) => role === ROLES.SUPERUSER || role === ROLES.ADMIN
export const isUser = (role) => [ROLES.USER, ROLES.SUPERUSER, ROLES.ADMIN].includes(role)



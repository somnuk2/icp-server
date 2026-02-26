import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const isUser = req.user.role === 'user'
        const memberId = req.user.member_id

        const queries = {
            members: 'SELECT COUNT(*) as count FROM member',
            individuals: 'SELECT COUNT(*) as count FROM individual',
            plans: 'SELECT COUNT(*) as count FROM plan',
            planCareers: 'SELECT COUNT(*) as count FROM plan_career',
            qualifications: 'SELECT COUNT(*) as count FROM qualification',
            assessments: 'SELECT COUNT(*) as count FROM self_assessment'
        }

        if (isUser) {
            queries.plans = `SELECT COUNT(*) as count FROM plan p
                       JOIN qa_plan_career qpc ON p.qa_plan_career_id = qpc.qa_plan_career_id
                       JOIN plan_career pc ON qpc.plan_career_id = pc.plan_career_id
                       WHERE pc.member_id = ${memberId}`
            queries.planCareers = `SELECT COUNT(*) as count FROM plan_career WHERE member_id = ${memberId}`
            queries.qualifications = `SELECT COUNT(*) as count FROM qualification WHERE member_id = ${memberId}`
            queries.assessments = `SELECT COUNT(*) as count FROM self_assessment sef
                             JOIN qa_plan_career qpc ON sef.qa_plan_career_id = qpc.qa_plan_career_id
                             JOIN plan_career pc ON qpc.plan_career_id = pc.plan_career_id
                             WHERE pc.member_id = ${memberId}`
        }

        const results = {}
        for (const [key, sql] of Object.entries(queries)) {
            const [rows] = await pool.query(sql)
            results[key] = rows[0].count
        }

        res.json(results)
    } catch (err) { next(err) }
})

// GET /api/dashboard/summary - รายงานสรุปรวม
router.get('/summary', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
      SELECT
        c.career_name,
        COUNT(pc.plan_career_id) as total_plans,
        AVG(per.perform_id) as avg_performance
      FROM career c
      LEFT JOIN plan_career pc ON c.career_id = pc.career_id
      LEFT JOIN qa_plan_career qpc ON pc.plan_career_id = qpc.plan_career_id
      LEFT JOIN self_assessment sef ON qpc.qa_plan_career_id = sef.qa_plan_career_id
      LEFT JOIN perform per ON sef.perform_id = per.perform_id
      GROUP BY c.career_id
      HAVING total_plans > 0
      ORDER BY total_plans DESC
    `)
        res.json(rows)
    } catch (err) { next(err) }
})

export default router



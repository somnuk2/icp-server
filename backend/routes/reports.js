import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// GET /api/reports/pivot - ข้อมูลสำหรับทำ Pivot Table หรือ Report รวม
router.get('/pivot', authenticate, async (req, res, next) => {
    try {
        let whereClause = ''
        if (req.user.role === 'user') {
            whereClause = `WHERE m.member_id = ${req.user.member_id}`
        }

        const query = `
      SELECT
        m.member_id, m.full_name,
        ind.telephone,
        pc.plan_career_id, c.career_name,
        qpc.qa_plan_career_id, q.qualification_name,
        t.target_name,
        sef.self_assessment_id, sef.self_assessment_date,
        per.perform_name, per.perform_id
      FROM member m
      INNER JOIN individual ind ON m.member_id = ind.member_id
      INNER JOIN plan_career pc ON m.member_id = pc.member_id
      INNER JOIN career c ON pc.career_id = c.career_id
      INNER JOIN qa_plan_career qpc ON pc.plan_career_id = qpc.plan_career_id
      INNER JOIN qualification q ON qpc.qualification_id = q.qualification_id
      INNER JOIN target t ON qpc.target_id = t.target_id
      LEFT JOIN self_assessment sef ON qpc.qa_plan_career_id = sef.qa_plan_career_id
      LEFT JOIN perform per ON sef.perform_id = per.perform_id
      ${whereClause}
      ORDER BY m.member_id, pc.plan_career_id, qpc.qa_plan_career_id
    `
        const [rows] = await pool.query(query)
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/reports/table1 - สถิติตามสาขาวิชา/คณะ
router.get('/table1', authenticate, async (req, res, next) => {
    try {
        const query = `
      SELECT
        i.institute_name,
        f.faculty_name,
        d.department_name,
        COUNT(ind.individual_id) as total_students
      FROM institute i
      JOIN faculty f ON i.institute_id = f.institute_id
      JOIN degree deg ON f.faculty_id = deg.faculty_id
      JOIN department d ON deg.degree_id = d.degree_id
      LEFT JOIN individual ind ON d.department_id = ind.department_id
      GROUP BY d.department_id
      ORDER BY i.institute_name, f.faculty_name, d.department_name
    `
        const [rows] = await pool.query(query)
        res.json(rows)
    } catch (err) { next(err) }
})

export default router



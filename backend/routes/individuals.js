import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

const FULL_JOIN = `
  SELECT ind.*,
    mem.full_name, mem.email,
    dep.department_name,
    deg.degree_id, deg.degree_name,
    fac.faculty_id, fac.faculty_name,
    ins.institute_id, ins.institute_name,
    dis.disability_name,
    pro.project_name,
    adv.full_name as advisor_name
  FROM individual ind
  LEFT JOIN member     mem ON ind.member_id     = mem.member_id
  LEFT JOIN department dep ON ind.department_id = dep.department_id
  LEFT JOIN degree     deg ON dep.degree_id     = deg.degree_id
  LEFT JOIN faculty    fac ON deg.faculty_id    = fac.faculty_id
  LEFT JOIN institute  ins ON fac.institute_id  = ins.institute_id
  LEFT JOIN disability dis ON ind.disability_id = dis.disability_id
  LEFT JOIN project    pro ON ind.project_id    = pro.project_id
  LEFT JOIN member      adv ON ind.advisor_id    = adv.member_id
`

// GET /api/individuals
router.get('/', authenticate, async (req, res, next) => {
    try {
        let rows
        if (req.user.role === 'user') {
            ;[rows] = await pool.query(FULL_JOIN + ' WHERE ind.member_id = ?', [req.user.member_id])
        } else if (req.user.role === 'suser') {
            ;[rows] = await pool.query(FULL_JOIN + ' WHERE ind.advisor_id = ? OR ind.member_id = ? ORDER BY ind.individual_id', [req.user.member_id, req.user.member_id])
        } else {
            ;[rows] = await pool.query(FULL_JOIN + ' ORDER BY ind.individual_id')
        }
        res.json(rows)
    } catch (err) { next(err) }
})

// GET /api/individuals/:id
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const [rows] = await pool.query(FULL_JOIN + ' WHERE ind.individual_id = ?', [req.params.id])
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && rows[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        res.json(rows[0])
    } catch (err) { next(err) }
})

// POST /api/individuals
router.post('/', authenticate, async (req, res, next) => {
    try {
        const toInt = (v, def = null) => (v === '' || v === undefined || v === null) ? def : parseInt(v)
        const toStr = (v) => (v === undefined || v === null) ? '' : String(v)

        const {
            member_id, birthday, telephone, department_id,
            is_graduate, date, year, is_disability, disability_id,
            dis_description, project_id, advisor_id, province, preferred_region,
            favorite_subject, unfavorite_subject, favorite_activity, dream_career,
            skill, additional_info
        } = req.body

        const [result] = await pool.query(
            `INSERT INTO individual (
                member_id, birthday, telephone, department_id,
                is_graduate, date, year, is_disability, disability_id,
                dis_description, project_id, advisor_id, province, preferred_region,
                favorite_subject, unfavorite_subject, favorite_activity, dream_career,
                skill, additional_info
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                toInt(member_id),
                toStr(birthday), toStr(telephone),
                toInt(department_id),
                toInt(is_graduate, 0), toStr(date), toStr(year),
                toInt(is_disability, 0),
                toInt(disability_id),
                toStr(dis_description),
                toInt(project_id),
                toInt(advisor_id, 0),  // NOT NULL in DB, default 0
                toStr(province), toStr(preferred_region),
                toStr(favorite_subject), toStr(unfavorite_subject),
                toStr(favorite_activity), toStr(dream_career),
                toStr(skill), toStr(additional_info)
            ]
        )
        res.status(201).json({ message: 'Insert Complete', individual_id: result.insertId })
    } catch (err) { next(err) }
})

// PUT /api/individuals/:id
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const [check] = await pool.query('SELECT member_id FROM individual WHERE individual_id=?', [req.params.id])
        if (check.length === 0) return res.status(404).json({ error: 'Not found.' })
        if (req.user.role === 'user' && check[0].member_id !== req.user.member_id) {
            return res.status(403).json({ error: 'Access denied.' })
        }
        const { birthday, telephone, department_id,
            is_graduate, date, year, is_disability, disability_id,
            dis_description, project_id, advisor_id, province, preferred_region,
            favorite_subject, unfavorite_subject, favorite_activity, dream_career,
            skill, additional_info } = req.body
        await pool.query(
            `UPDATE individual SET
                birthday=?, telephone=?, department_id=?,
                is_graduate=?, date=?, year=?, is_disability=?, disability_id=?,
                dis_description=?, project_id=?, advisor_id=?, province=?, preferred_region=?,
                favorite_subject=?, unfavorite_subject=?, favorite_activity=?, dream_career=?,
                skill=?, additional_info=?
             WHERE individual_id=?`,
            [
                birthday, telephone, department_id,
                is_graduate, date, year, is_disability, disability_id,
                dis_description, project_id, advisor_id, province, preferred_region,
                favorite_subject, unfavorite_subject, favorite_activity, dream_career,
                skill, additional_info, req.params.id
            ]
        )
        res.json({ message: 'Update Complete' })
    } catch (err) { next(err) }
})

// DELETE /api/individuals/:id - admin only
router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM individual WHERE individual_id=?', [req.params.id])
        res.json({ message: 'Delete Complete' })
    } catch (err) { next(err) }
})

// POST /api/individuals/delete-selected - admin only
router.post('/delete-selected', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        const { individual_ids } = req.body
        if (!Array.isArray(individual_ids) || individual_ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' })
        }
        await pool.query('DELETE FROM individual WHERE individual_id IN (?)', [individual_ids])
        res.json({ message: 'Delete Selected Complete', count: individual_ids.length })
    } catch (err) { next(err) }
})

export default router




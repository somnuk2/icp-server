import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Universal GET for reference tables
const getRef = (table, orderBy) => async (req, res, next) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy || table + '_id'}`)
        res.json(rows)
    } catch (err) { next(err) }
}

router.get('/disabilities', authenticate, getRef('disability'))
router.get('/projects', authenticate, getRef('project'))
router.get('/advisors', authenticate, getRef('advisor'))
router.get('/developments', authenticate, getRef('development'))
router.get('/importances', authenticate, getRef('importance'))
router.get('/frequencies', authenticate, getRef('frequency'))
router.get('/targets', authenticate, getRef('target'))
router.get('/levels', authenticate, getRef('level'))
router.get('/qualification-groups', authenticate, getRef('qualification_group'))

export default router



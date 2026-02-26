import express from 'express'
import pool from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = express.Router()

// Generic CRUD for simple constant tables
const createCrud = (tableName, idName, nameField) => {
    // GET all
    router.get(`/${tableName}`, authenticate, async (req, res, next) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY ${idName}`)
            res.json(rows)
        } catch (err) { next(err) }
    })

    // POST
    router.post(`/${tableName}`, authenticate, authorize(['admin']), async (req, res, next) => {
        try {
            const data = req.body
            const fields = Object.keys(data)
            const values = Object.values(data)
            const placeholders = fields.map(() => '?').join(', ')

            const [result] = await pool.query(
                `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
                values
            )
            res.status(201).json({ message: 'Insert Complete', id: result.insertId })
        } catch (err) { next(err) }
    })

    // PUT
    router.put(`/${tableName}/:id`, authenticate, authorize(['admin']), async (req, res, next) => {
        try {
            const data = req.body
            const fields = Object.keys(data)
            const values = Object.values(data)
            const setClause = fields.map(f => `${f} = ?`).join(', ')

            await pool.query(
                `UPDATE ${tableName} SET ${setClause} WHERE ${idName} = ?`,
                [...values, req.params.id]
            )
            res.json({ message: 'Update Complete' })
        } catch (err) { next(err) }
    })

    // DELETE
    router.delete(`/${tableName}/:id`, authenticate, authorize(['admin']), async (req, res, next) => {
        try {
            await pool.query(`DELETE FROM ${tableName} WHERE ${idName} = ?`, [req.params.id])
            res.json({ message: 'Delete Complete' })
        } catch (err) { next(err) }
    })
}

// ─── Register underscore routes (legacy names used by some pages) ──────────────
createCrud('career_group', 'career_group_id', 'ca_group_name')
createCrud('importance', 'importance_id', 'importance_name')
createCrud('level', 'level_id', 'level_name')
createCrud('target', 'target_id', 'target_name')
createCrud('development', 'development_id', 'development_name')
createCrud('perform', 'perform_id', 'perform_name')
createCrud('frequency', 'frequency_id', 'frequency_name')

// ─── Alias routes: Hyphen/Plural variants ─────────────────────────────────────
// Frontend uses both /career-groups and /career_group  → map to same table
const alias = (path, tableName, idName) => {
    router.get(`/${path}`, authenticate, async (req, res, next) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY ${idName}`)
            res.json(rows)
        } catch (err) { next(err) }
    })
    router.post(`/${path}`, authenticate, authorize(['admin']), async (req, res, next) => {
        try {
            const data = req.body
            const fields = Object.keys(data)
            const values = Object.values(data)
            const placeholders = fields.map(() => '?').join(', ')
            const [result] = await pool.query(
                `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
                values
            )
            res.status(201).json({ message: 'Insert Complete', id: result.insertId })
        } catch (err) { next(err) }
    })
    router.put(`/${path}/:id`, authenticate, authorize(['admin']), async (req, res, next) => {
        try {
            const data = req.body
            const fields = Object.keys(data)
            const values = Object.values(data)
            const setClause = fields.map(f => `${f} = ?`).join(', ')
            await pool.query(`UPDATE ${tableName} SET ${setClause} WHERE ${idName} = ?`, [...values, req.params.id])
            res.json({ message: 'Update Complete' })
        } catch (err) { next(err) }
    })
    router.delete(`/${path}/:id`, authenticate, authorize(['admin']), async (req, res, next) => {
        try {
            await pool.query(`DELETE FROM ${tableName} WHERE ${idName} = ?`, [req.params.id])
            res.json({ message: 'Delete Complete' })
        } catch (err) { next(err) }
    })
}

alias('career-groups', 'career_group', 'career_group_id')
alias('frequencies', 'frequency', 'frequency_id')
alias('qualification-groups', 'qualification_group', 'qualification_group_id')
alias('targets', 'target', 'target_id')
alias('levels', 'level', 'level_id')
alias('developments', 'development', 'development_id')
alias('importances', 'importance', 'importance_id')
alias('performs', 'perform', 'perform_id')

export default router



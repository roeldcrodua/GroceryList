import { pool } from '../config/database.js'

const getCategories = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT id, name, sort_order AS "sortOrder" FROM categories ORDER BY sort_order ASC, name ASC'
    )
    res.status(200).json(results.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default {
  getCategories
}

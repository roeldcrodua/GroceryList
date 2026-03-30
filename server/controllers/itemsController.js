import { pool } from '../config/database.js'

const getItems = async (req, res) => {
  try {
    const results = await pool.query(`
      SELECT
        items.id,
        items.name,
        items.default_unit AS "defaultUnit",
        items.barcode,
        items.brand,
        items.unit_price::float AS "unitPrice",
        categories.id AS "categoryId",
        categories.name AS "categoryName"
      FROM items
      JOIN categories ON categories.id = items.default_category_id
      ORDER BY categories.sort_order ASC, items.name ASC
    `)
    res.status(200).json(results.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default {
  getItems
}

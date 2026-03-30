import { pool } from '../config/database.js'

const getLists = async (req, res) => {
  try {
    const results = await pool.query(`
      SELECT
        grocery_lists.id,
        grocery_lists.name,
        grocery_lists.owner_user_id AS "ownerUserId",
        grocery_lists.created_at AS "createdAt",
        grocery_lists.archived_at AS "archivedAt",
        COALESCE(COUNT(list_items.id), 0)::int AS "itemCount",
        COALESCE(SUM(list_items.quantity * items.unit_price), 0)::float AS "estimatedTotal"
      FROM grocery_lists
      LEFT JOIN list_items ON list_items.list_id = grocery_lists.id
      LEFT JOIN items ON items.id = list_items.item_id
      GROUP BY grocery_lists.id
      ORDER BY grocery_lists.created_at DESC, grocery_lists.id DESC
    `)
    res.status(200).json(results.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getListById = async (req, res) => {
  try {
    const listId = Number.parseInt(req.params.id, 10)
    if (Number.isNaN(listId)) {
      return res.status(400).json({ error: 'List id must be a number.' })
    }

    const listResult = await pool.query(
      `
        SELECT
          grocery_lists.id,
          grocery_lists.name,
          grocery_lists.owner_user_id AS "ownerUserId",
          grocery_lists.created_at AS "createdAt",
          grocery_lists.archived_at AS "archivedAt"
        FROM grocery_lists
        WHERE grocery_lists.id = $1
      `,
      [listId]
    )

    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grocery list not found.' })
    }

    const itemsResult = await pool.query(`
      SELECT
        list_items.id,
        list_items.list_id AS "listId",
        list_items.item_id AS "itemId",
        COALESCE(list_items.custom_name, items.name) AS "displayName",
        list_items.custom_name AS "customName",
        list_items.quantity::float AS quantity,
        list_items.unit,
        list_items.notes,
        list_items.created_at AS "createdAt",
        list_items.updated_at AS "updatedAt",
        items.name,
        items.default_unit AS "defaultUnit",
        items.unit_price::float AS "unitPrice",
        categories.name AS "categoryName"
      FROM list_items
      JOIN items ON items.id = list_items.item_id
      JOIN categories ON categories.id = items.default_category_id
      WHERE list_items.list_id = $1
      ORDER BY categories.sort_order ASC, COALESCE(list_items.custom_name, items.name) ASC
    `, [listId])

    const estimatedTotal = itemsResult.rows.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    return res.status(200).json({
      ...listResult.rows[0],
      estimatedTotal,
      itemCount: itemsResult.rows.length,
      items: itemsResult.rows
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const createList = async (req, res) => {
  try {
    const { name, ownerUserId = 1 } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required.' })
    }

    const ownerResult = await pool.query('SELECT id FROM users WHERE id = $1', [ownerUserId])
    if (ownerResult.rows.length === 0) {
      return res.status(400).json({ error: 'Owner user does not exist.' })
    }

    const insertResult = await pool.query(
      'INSERT INTO grocery_lists (name, owner_user_id) VALUES ($1, $2) RETURNING id, name, owner_user_id AS "ownerUserId", created_at AS "createdAt", archived_at AS "archivedAt"',
      [name.trim(), ownerUserId]
    )

    await pool.query(
      'INSERT INTO list_members (list_id, user_id, role, accepted_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
      [insertResult.rows[0].id, ownerUserId, 'owner']
    )

    return res.status(201).json({
      ...insertResult.rows[0],
      itemCount: 0,
      estimatedTotal: 0,
      items: []
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const updateList = async (req, res) => {
  try {
    const listId = Number.parseInt(req.params.id, 10)
    const { name, archivedAt = null } = req.body

    if (Number.isNaN(listId)) {
      return res.status(400).json({ error: 'List id must be a number.' })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required.' })
    }

    const updateResult = await pool.query(
      `
        UPDATE grocery_lists
        SET name = $1, archived_at = $2
        WHERE id = $3
        RETURNING id, name, owner_user_id AS "ownerUserId", created_at AS "createdAt", archived_at AS "archivedAt"
      `,
      [name.trim(), archivedAt, listId]
    )

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grocery list not found.' })
    }

    return res.status(200).json(updateResult.rows[0])
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const deleteList = async (req, res) => {
  try {
    const listId = Number.parseInt(req.params.id, 10)
    if (Number.isNaN(listId)) {
      return res.status(400).json({ error: 'List id must be a number.' })
    }

    const deleteResult = await pool.query('DELETE FROM grocery_lists WHERE id = $1 RETURNING id', [listId])
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grocery list not found.' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

export default {
  getLists,
  getListById,
  createList,
  updateList,
  deleteList
}

import { pool } from '../config/database.js'

const incompatibleFrozenRule = (categoryName, notes) => {
  return categoryName === 'Frozen' && !notes?.toLowerCase().includes('cooler')
}

const validateListItemPayload = async ({ itemId, quantity, unit, notes }) => {
  if (!itemId) {
    return { error: 'A catalog item is required.' }
  }

  if (!quantity || Number(quantity) <= 0) {
    return { error: 'Quantity must be greater than zero.' }
  }

  if (!unit || !String(unit).trim()) {
    return { error: 'Unit is required.' }
  }

  const itemResult = await pool.query(`
    SELECT
      items.id,
      items.name,
      items.default_unit AS "defaultUnit",
      categories.name AS "categoryName"
    FROM items
    JOIN categories ON categories.id = items.default_category_id
    WHERE items.id = $1
  `, [itemId])

  if (itemResult.rows.length === 0) {
    return { error: 'Selected catalog item does not exist.' }
  }

  const item = itemResult.rows[0]
  if (incompatibleFrozenRule(item.categoryName, notes)) {
    return { error: 'Frozen items require notes that mention a cooler bag.' }
  }

  return { item }
}

const createListItem = async (req, res) => {
  try {
    const listId = Number.parseInt(req.params.listId, 10)
    if (Number.isNaN(listId)) {
      return res.status(400).json({ error: 'List id must be a number.' })
    }

    const { itemId, customName = null, quantity, unit, notes = null } = req.body
    const validation = await validateListItemPayload({ itemId, quantity, unit, notes })
    if (validation.error) {
      return res.status(400).json({ error: validation.error })
    }

    const listResult = await pool.query('SELECT id FROM grocery_lists WHERE id = $1', [listId])
    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'Grocery list not found.' })
    }

    const insertResult = await pool.query(`
      INSERT INTO list_items (list_id, item_id, custom_name, quantity, unit, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, list_id AS "listId", item_id AS "itemId", custom_name AS "customName", quantity::float AS quantity, unit, notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [listId, itemId, customName?.trim() || null, quantity, unit.trim(), notes?.trim() || null])

    return res.status(201).json(insertResult.rows[0])
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const updateListItem = async (req, res) => {
  try {
    const listItemId = Number.parseInt(req.params.id, 10)
    if (Number.isNaN(listItemId)) {
      return res.status(400).json({ error: 'List item id must be a number.' })
    }

    const { itemId, customName = null, quantity, unit, notes = null } = req.body
    const validation = await validateListItemPayload({ itemId, quantity, unit, notes })
    if (validation.error) {
      return res.status(400).json({ error: validation.error })
    }

    const updateResult = await pool.query(`
      UPDATE list_items
      SET item_id = $1,
          custom_name = $2,
          quantity = $3,
          unit = $4,
          notes = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, list_id AS "listId", item_id AS "itemId", custom_name AS "customName", quantity::float AS quantity, unit, notes, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [itemId, customName?.trim() || null, quantity, unit.trim(), notes?.trim() || null, listItemId])

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'List item not found.' })
    }

    return res.status(200).json(updateResult.rows[0])
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const deleteListItem = async (req, res) => {
  try {
    const listItemId = Number.parseInt(req.params.id, 10)
    if (Number.isNaN(listItemId)) {
      return res.status(400).json({ error: 'List item id must be a number.' })
    }

    const deleteResult = await pool.query('DELETE FROM list_items WHERE id = $1 RETURNING id', [listItemId])
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'List item not found.' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

export default {
  createListItem,
  updateListItem,
  deleteListItem
}

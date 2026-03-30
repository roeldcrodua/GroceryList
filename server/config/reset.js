import { pool } from './database.js'
import { users, categories, items } from '../data/seedData.js'

const createTables = async () => {
  const query = `
    DROP TABLE IF EXISTS list_items;
    DROP TABLE IF EXISTS list_members;
    DROP TABLE IF EXISTS grocery_lists;
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      default_unit VARCHAR(50) NOT NULL,
      default_category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      barcode VARCHAR(100),
      brand VARCHAR(255),
      unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE grocery_lists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      archived_at TIMESTAMP
    );

    CREATE TABLE list_members (
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
      invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      accepted_at TIMESTAMP,
      UNIQUE(list_id, user_id)
    );

    CREATE TABLE list_items (
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
      custom_name VARCHAR(255),
      quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
      unit VARCHAR(50) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `

  await pool.query(query)
}

const seedUsers = async () => {
  for (const user of users) {
    await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      [user.name, user.email]
    )
  }
}

const seedCategories = async () => {
  const categoryIdByName = new Map()

  for (const category of categories) {
    const result = await pool.query(
      'INSERT INTO categories (name, sort_order) VALUES ($1, $2) RETURNING id, name',
      [category.name, category.sortOrder]
    )
    categoryIdByName.set(result.rows[0].name, result.rows[0].id)
  }

  return categoryIdByName
}

const seedItems = async (categoryIdByName) => {
  for (const item of items) {
    await pool.query(
      `
        INSERT INTO items (name, default_unit, default_category_id, barcode, brand, unit_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        item.name,
        item.defaultUnit,
        categoryIdByName.get(item.categoryName),
        item.barcode,
        item.brand,
        item.unitPrice
      ]
    )
  }
}

const seedStarterList = async () => {
  const ownerResult = await pool.query('SELECT id FROM users ORDER BY id ASC LIMIT 1')
  const ownerUserId = ownerResult.rows[0].id

  const listResult = await pool.query(
    'INSERT INTO grocery_lists (name, owner_user_id) VALUES ($1, $2) RETURNING id',
    ['Weekly Essentials', ownerUserId]
  )

  await pool.query(
    'INSERT INTO list_members (list_id, user_id, role, accepted_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
    [listResult.rows[0].id, ownerUserId, 'owner']
  )

  const seededItems = await pool.query('SELECT id, name, default_unit FROM items WHERE name = ANY($1)', [[
    'Milk',
    'Apples',
    'Rice'
  ]])

  for (const seededItem of seededItems.rows) {
    await pool.query(
      `
        INSERT INTO list_items (list_id, item_id, quantity, unit, notes)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        listResult.rows[0].id,
        seededItem.id,
        seededItem.name === 'Rice' ? 1 : 2,
        seededItem.default_unit,
        seededItem.name === 'Milk' ? '2% for the week' : null
      ]
    )
  }
}

const resetDatabase = async () => {
  try {
    await createTables()
    await seedUsers()
    const categoryIdByName = await seedCategories()
    await seedItems(categoryIdByName)
    await seedStarterList()
    console.log('GroceryList database reset complete.')
  } catch (error) {
    console.error('Failed to reset GroceryList database:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

resetDatabase()

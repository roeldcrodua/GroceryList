import './dotenv.js'
import pg from 'pg'

const { Pool } = pg

const host = process.env.PGHOST
const sslMode = process.env.PGSSLMODE
const isLocalDatabase = host === 'localhost' || host === '127.0.0.1'

if (!process.env.PGUSER || !process.env.PGPASSWORD || !host || !process.env.PGPORT || !process.env.PGDATABASE) {
  throw new Error('PGUSER, PGPASSWORD, PGHOST, PGPORT, and PGDATABASE are required in server/.env')
}

export const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host,
  port: Number.parseInt(process.env.PGPORT, 10),
  database: process.env.PGDATABASE,
  ssl: isLocalDatabase || sslMode !== 'require' ? false : { rejectUnauthorized: false }
})

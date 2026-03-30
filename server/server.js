import express from 'express'
import cors from 'cors'
import './config/dotenv.js'
import categoriesRouter from './routes/categories.js'
import itemsRouter from './routes/items.js'
import listsRouter from './routes/lists.js'
import listItemsRouter from './routes/listItems.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'GroceryList API is running',
    endpoints: ['/api/categories', '/api/items', '/api/lists', '/api/list-items/:id']
  })
})

app.use('/api/categories', categoriesRouter)
app.use('/api/items', itemsRouter)
app.use('/api/lists', listsRouter)
app.use('/api/list-items', listItemsRouter)

const port = Number.parseInt(process.env.PORT || '3001', 10)

app.listen(port, () => {
  console.log(`GroceryList server listening on http://localhost:${port}`)
})

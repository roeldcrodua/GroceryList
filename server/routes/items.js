import express from 'express'
import itemsController from '../controllers/itemsController.js'

const router = express.Router()

router.get('/', itemsController.getItems)

export default router

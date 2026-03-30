import express from 'express'
import listItemsController from '../controllers/listItemsController.js'

const router = express.Router()

router.patch('/:id', listItemsController.updateListItem)
router.delete('/:id', listItemsController.deleteListItem)

export default router

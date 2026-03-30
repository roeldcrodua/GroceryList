import express from 'express'
import listsController from '../controllers/listsController.js'
import listItemsController from '../controllers/listItemsController.js'

const router = express.Router()

router.get('/', listsController.getLists)
router.get('/:id', listsController.getListById)
router.post('/', listsController.createList)
router.patch('/:id', listsController.updateList)
router.delete('/:id', listsController.deleteList)
router.post('/:listId/items', listItemsController.createListItem)

export default router

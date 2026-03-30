import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ListItemEditor from '../components/ListItemEditor'
import SummaryPanel from '../components/SummaryPanel'
import { getCategories, getItems } from '../services/catalogApi'
import { deleteList, deleteListItem, getList, updateListItem } from '../services/listsApi'
import { calculateListSummary } from '../utilities/calcTotals'
import { validateListItem } from '../utilities/validation'

const emptyEditorState = {
  itemId: '',
  customName: '',
  quantity: 1,
  unit: '',
  notes: ''
}

const ListDetailPage = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [catalogItems, setCatalogItems] = useState([])
  const [categories, setCategories] = useState([])
  const [editingItemId, setEditingItemId] = useState(null)
  const [editorForm, setEditorForm] = useState(emptyEditorState)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadPage = async () => {
    try {
      setLoading(true)
      const [listData, categoryData, itemData] = await Promise.all([
        getList(listId),
        getCategories(),
        getItems()
      ])
      setList(listData)
      setCategories(categoryData)
      setCatalogItems(itemData)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
  }, [listId])

  const summary = useMemo(() => calculateListSummary(list?.items || []), [list])

  const handleDeleteList = async () => {
    const shouldDelete = window.confirm('Delete this grocery list and all of its items?')
    if (!shouldDelete) {
      return
    }

    try {
      await deleteList(listId)
      navigate('/')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleDeleteItem = async (listItemId) => {
    try {
      await deleteListItem(listItemId)
      await loadPage()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const beginEditing = (listItem) => {
    setEditingItemId(listItem.id)
    setEditorForm({
      itemId: String(listItem.itemId),
      customName: listItem.customName || '',
      quantity: listItem.quantity,
      unit: listItem.unit,
      notes: listItem.notes || ''
    })
  }

  const handleEditorChange = (event) => {
    const { name, value } = event.target
    setEditorForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSaveEdit = async () => {
    const selectedItem = catalogItems.find((item) => item.id === Number(editorForm.itemId))
    const validationError = validateListItem({
      ...editorForm,
      categoryName: selectedItem?.categoryName
    })

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      await updateListItem(editingItemId, {
        itemId: Number(editorForm.itemId),
        customName: editorForm.customName,
        quantity: Number(editorForm.quantity),
        unit: editorForm.unit,
        notes: editorForm.notes
      })
      setEditingItemId(null)
      setEditorForm(emptyEditorState)
      await loadPage()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  if (loading) {
    return <section className="card"><p>Loading grocery list...</p></section>
  }

  if (!list) {
    return <section className="card"><p>List not found.</p></section>
  }

  return (
    <section className="two-column-layout">
      <div className="stack">
        <section className="card">
          <div className="page-header compact">
            <div>
              <p className="eyebrow">List detail</p>
              <h1>{list.name}</h1>
            </div>
            <div className="card-actions">
              <Link className="button secondary" to={`/lists/${list.id}/edit`}>Edit list</Link>
              <button className="button danger" onClick={handleDeleteList}>Delete list</button>
            </div>
          </div>
          {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
          {list.items.length === 0 ? <p className="muted">This list has no items yet.</p> : (
            <div className="stack">
              {list.items.map((listItem) => (
                <div key={listItem.id} className="inline-card accent-card">
                  <div>
                    <strong>{listItem.displayName}</strong>
                    <p className="muted">{listItem.quantity} {listItem.unit} · {listItem.categoryName}</p>
                    <p className="muted">Est. ${(listItem.quantity * listItem.unitPrice).toFixed(2)}</p>
                    {listItem.notes ? <p className="muted">{listItem.notes}</p> : null}
                  </div>
                  <div className="card-actions">
                    <button className="button ghost" onClick={() => beginEditing(listItem)}>Update</button>
                    <button className="button ghost" onClick={() => handleDeleteItem(listItem.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {editingItemId ? (
          <ListItemEditor
            form={editorForm}
            items={catalogItems}
            categories={categories}
            onChange={handleEditorChange}
            onSubmit={handleSaveEdit}
            submitLabel="Save changes"
            errorMessage={errorMessage}
            onCancel={() => setEditingItemId(null)}
          />
        ) : null}
      </div>

      <SummaryPanel listName={list.name} listItems={list.items} summary={summary} />
    </section>
  )
}

export default ListDetailPage

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListItemEditor from '../components/ListItemEditor'
import SummaryPanel from '../components/SummaryPanel'
import { getCategories, getItems } from '../services/catalogApi'
import { createList, createListItem } from '../services/listsApi'
import { calculateListSummary } from '../utilities/calcTotals'
import { validateListItem, validateListName } from '../utilities/validation'

const emptyItemForm = {
  itemId: '',
  customName: '',
  quantity: 1,
  unit: '',
  notes: ''
}

const NewListPage = () => {
  const navigate = useNavigate()
  const [listName, setListName] = useState('')
  const [catalogItems, setCatalogItems] = useState([])
  const [categories, setCategories] = useState([])
  const [draftItems, setDraftItems] = useState([])
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [categoryData, itemData] = await Promise.all([getCategories(), getItems()])
        setCategories(categoryData)
        setCatalogItems(itemData)
        setErrorMessage('')
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [])

  const draftSummary = useMemo(() => calculateListSummary(draftItems), [draftItems])

  const selectedCatalogItem = catalogItems.find((item) => item.id === Number(itemForm.itemId))

  const handleItemChange = (event) => {
    const { name, value } = event.target
    setItemForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: value }
      if (name === 'itemId') {
        const nextItem = catalogItems.find((item) => item.id === Number(value))
        if (nextItem && !currentForm.unit) {
          nextForm.unit = nextItem.defaultUnit
        }
      }
      return nextForm
    })
  }

  const handleAddDraftItem = () => {
    const validationError = validateListItem({
      ...itemForm,
      categoryName: selectedCatalogItem?.categoryName
    })

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setDraftItems((currentDraftItems) => [
      ...currentDraftItems,
      {
        id: `draft-${Date.now()}`,
        itemId: Number(itemForm.itemId),
        displayName: itemForm.customName.trim() || selectedCatalogItem.name,
        customName: itemForm.customName,
        quantity: Number(itemForm.quantity),
        unit: itemForm.unit,
        notes: itemForm.notes,
        categoryName: selectedCatalogItem.categoryName,
        unitPrice: selectedCatalogItem.unitPrice
      }
    ])
    setItemForm(emptyItemForm)
    setErrorMessage('')
  }

  const handleRemoveDraftItem = (draftId) => {
    setDraftItems((currentDraftItems) => currentDraftItems.filter((item) => item.id !== draftId))
  }

  const handleSaveList = async () => {
    const nameError = validateListName(listName)
    if (nameError) {
      setErrorMessage(nameError)
      return
    }

    if (draftItems.length === 0) {
      setErrorMessage('Add at least one grocery item before saving.')
      return
    }

    try {
      setSaving(true)
      const createdList = await createList({ name: listName, ownerUserId: 1 })

      for (const draftItem of draftItems) {
        await createListItem(createdList.id, {
          itemId: draftItem.itemId,
          customName: draftItem.customName,
          quantity: draftItem.quantity,
          unit: draftItem.unit,
          notes: draftItem.notes
        })
      }

      navigate(`/lists/${createdList.id}`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="card"><p>Loading catalog...</p></section>
  }

  return (
    <section className="two-column-layout">
      <div className="stack">
        <section className="card">
          <p className="eyebrow">Create list</p>
          <h1>Build a grocery run</h1>
          <label>
            List name
            <input value={listName} onChange={(event) => setListName(event.target.value)} placeholder="Weekly, Costco run, Dinner prep" />
          </label>
        </section>

        <ListItemEditor
          form={itemForm}
          items={catalogItems}
          categories={categories}
          onChange={handleItemChange}
          onSubmit={handleAddDraftItem}
          submitLabel="Add item"
          errorMessage={errorMessage}
        />

        <section className="card">
          <div className="editor-header">
            <div>
              <p className="meta">Draft items</p>
              <h3>Ready to save</h3>
            </div>
          </div>
          {draftItems.length === 0 ? <p className="muted">No items added yet.</p> : (
            <div className="stack">
              {draftItems.map((draftItem) => (
                <div key={draftItem.id} className="inline-card">
                  <div>
                    <strong>{draftItem.displayName}</strong>
                    <p className="muted">{draftItem.quantity} {draftItem.unit} · {draftItem.categoryName}</p>
                    {draftItem.notes ? <p className="muted">{draftItem.notes}</p> : null}
                  </div>
                  <button className="button ghost" onClick={() => handleRemoveDraftItem(draftItem.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="card-actions">
            <button className="button primary" onClick={handleSaveList} disabled={saving}>
              {saving ? 'Saving...' : 'Save grocery list'}
            </button>
          </div>
        </section>
      </div>

      <SummaryPanel listName={listName} listItems={draftItems} summary={draftSummary} />
    </section>
  )
}

export default NewListPage

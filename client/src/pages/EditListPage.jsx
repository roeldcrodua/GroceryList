import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getList, updateList } from '../services/listsApi'
import { validateListName } from '../utilities/validation'

const EditListPage = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [archivedAt, setArchivedAt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadList = async () => {
      try {
        const list = await getList(listId)
        setName(list.name)
        setArchivedAt(Boolean(list.archivedAt))
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadList()
  }, [listId])

  const handleSubmit = async () => {
    const validationError = validateListName(name)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      setSaving(true)
      await updateList(listId, {
        name,
        archivedAt: archivedAt ? new Date().toISOString() : null
      })
      navigate(`/lists/${listId}`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="card"><p>Loading list...</p></section>
  }

  return (
    <section className="card form-card narrow">
      <p className="eyebrow">Edit list</p>
      <h1>Update grocery list</h1>
      <label>
        List name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="checkbox-row">
        <input type="checkbox" checked={archivedAt} onChange={(event) => setArchivedAt(event.target.checked)} />
        Mark as archived
      </label>
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
      <div className="card-actions">
        <button className="button primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save list'}
        </button>
      </div>
    </section>
  )
}

export default EditListPage

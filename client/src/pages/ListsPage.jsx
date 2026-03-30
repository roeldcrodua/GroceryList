import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ListCard from '../components/ListCard'
import { deleteList, getLists } from '../services/listsApi'

const ListsPage = () => {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadLists = async () => {
    try {
      setLoading(true)
      const data = await getLists()
      setLists(data)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLists()
  }, [])

  const handleDelete = async (listId) => {
    const shouldDelete = window.confirm('Delete this grocery list?')
    if (!shouldDelete) {
      return
    }

    try {
      await deleteList(listId)
      setLists((currentLists) => currentLists.filter((list) => list.id !== listId))
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  if (loading) {
    return <section className="card"><p>Loading grocery lists...</p></section>
  }

  return (
    <section className="page-grid">
      <div className="page-header">
        <div>
          <p className="eyebrow">Saved lists</p>
          <h1>Plan your next grocery run</h1>
        </div>
        <Link className="button primary" to="/lists/new">Create a list</Link>
      </div>

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      {lists.length === 0 ? (
        <section className="card empty-state">
          <h2>No grocery lists yet</h2>
          <p>Start with a new list, then add catalog items and notes.</p>
        </section>
      ) : (
        <div className="card-grid">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}

export default ListsPage

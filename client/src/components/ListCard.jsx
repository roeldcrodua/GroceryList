import { Link } from 'react-router-dom'

const ListCard = ({ list, onDelete }) => {
  return (
    <article className="card list-card">
      <div>
        <p className="meta">{new Date(list.createdAt).toLocaleDateString()}</p>
        <h2>{list.name}</h2>
      </div>
      <div className="stat-grid">
        <div>
          <span className="stat-label">Items</span>
          <strong>{list.itemCount}</strong>
        </div>
        <div>
          <span className="stat-label">Estimated total</span>
          <strong>${list.estimatedTotal.toFixed(2)}</strong>
        </div>
      </div>
      <div className="card-actions">
        <Link className="button secondary" to={`/lists/${list.id}`}>View</Link>
        <Link className="button secondary" to={`/lists/${list.id}/edit`}>Edit</Link>
        <button className="button danger" onClick={() => onDelete(list.id)}>Delete</button>
      </div>
    </article>
  )
}

export default ListCard

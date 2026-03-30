import { categoryThemes, defaultCategoryTheme } from '../data/categoryThemes'

const SummaryPanel = ({ listName, listItems, summary }) => {
  return (
    <aside className="card summary-panel">
      <p className="meta">Live summary</p>
      <h3>{listName || 'Untitled list'}</h3>
      <div className="summary-stats">
        <div>
          <span className="stat-label">Line items</span>
          <strong>{summary.itemCount}</strong>
        </div>
        <div>
          <span className="stat-label">Total quantity</span>
          <strong>{summary.totalQuantity}</strong>
        </div>
        <div>
          <span className="stat-label">Estimated total</span>
          <strong>${summary.estimatedTotal.toFixed(2)}</strong>
        </div>
      </div>
      <div className="chip-stack">
        {listItems.length > 0 ? listItems.map((listItem) => {
          const theme = categoryThemes[listItem.categoryName] || defaultCategoryTheme
          return (
            <span
              key={listItem.id ?? `${listItem.itemId}-${listItem.displayName}`}
              className={`category-pill ${theme.className}`}
            >
              {listItem.displayName} · {listItem.quantity} {listItem.unit}
            </span>
          )
        }) : <p className="muted">Add items to see your live list composition.</p>}
      </div>
    </aside>
  )
}

export default SummaryPanel

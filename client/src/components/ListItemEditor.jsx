import { categoryThemes } from '../data/categoryThemes'

const ListItemEditor = ({
  form,
  items,
  categories,
  onChange,
  onSubmit,
  submitLabel,
  errorMessage,
  onCancel
}) => {
  const selectedItem = items.find((item) => item.id === Number(form.itemId))
  const theme = selectedItem ? categoryThemes[selectedItem.categoryName] : null

  return (
    <section className="card item-editor">
      <div className="editor-header">
        <div>
          <p className="meta">Customize List Item</p>
          <h3>{submitLabel}</h3>
        </div>
        {selectedItem ? (
          <span className={`category-pill ${theme?.className || 'category-pill--default'}`}>
            {theme?.icon} · {selectedItem.categoryName}
          </span>
        ) : null}
      </div>

      <div className="form-grid">
        <label>
          Catalog item
          <select name="itemId" value={form.itemId} onChange={onChange}>
            <option value="">Select an item</option>
            {categories.map((category) => {
              const categoryItems = items.filter((item) => item.categoryId === category.id)
              return (
                <optgroup key={category.id} label={category.name}>
                  {categoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · ${item.unitPrice.toFixed(2)} / {item.defaultUnit}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </select>
        </label>

        <label>
          Custom label
          <input name="customName" value={form.customName} onChange={onChange} placeholder="Optional aisle label" />
        </label>

        <label>
          Quantity
          <input type="number" min="0.25" step="0.25" name="quantity" value={form.quantity} onChange={onChange} />
        </label>

        <label>
          Unit
          <input name="unit" value={form.unit} onChange={onChange} placeholder="lb, dozen, bag" />
        </label>

        <label className="field-span">
          Notes
          <textarea name="notes" value={form.notes} onChange={onChange} placeholder="For frozen items, mention cooler bag here." rows="3" />
        </label>
      </div>

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      <div className="card-actions">
        <button className="button primary" onClick={onSubmit}>{submitLabel}</button>
        {onCancel ? <button className="button ghost" onClick={onCancel}>Cancel</button> : null}
      </div>
    </section>
  )
}

export default ListItemEditor

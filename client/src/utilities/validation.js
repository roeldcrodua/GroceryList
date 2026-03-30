export const validateListName = (name) => {
  if (!name || !name.trim()) {
    return 'List name is required.'
  }

  return ''
}

export const validateListItem = ({ itemId, quantity, unit, notes, categoryName }) => {
  if (!itemId) {
    return 'Please choose an item from the catalog.'
  }

  if (!quantity || Number(quantity) <= 0) {
    return 'Quantity must be greater than zero.'
  }

  if (!unit || !unit.trim()) {
    return 'Unit is required.'
  }

  if (categoryName === 'Frozen' && !notes?.toLowerCase().includes('cooler')) {
    return 'Frozen items require notes that mention a cooler bag.'
  }

  return ''
}

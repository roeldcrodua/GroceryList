export const calculateListSummary = (listItems) => {
  return listItems.reduce(
    (summary, listItem) => {
      const itemTotal = Number(listItem.quantity || 0) * Number(listItem.unitPrice || 0)
      summary.itemCount += 1
      summary.totalQuantity += Number(listItem.quantity || 0)
      summary.estimatedTotal += itemTotal
      return summary
    },
    { itemCount: 0, totalQuantity: 0, estimatedTotal: 0 }
  )
}

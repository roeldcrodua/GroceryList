export const users = [
  { name: 'Jordan Kim', email: 'jordan@example.com' },
  { name: 'Sam Rivera', email: 'sam@example.com' }
]

export const categories = [
  { name: 'Produce', sortOrder: 1 },
  { name: 'Dairy', sortOrder: 2 },
  { name: 'Meat', sortOrder: 3 },
  { name: 'Bakery', sortOrder: 4 },
  { name: 'Pantry', sortOrder: 5 },
  { name: 'Frozen', sortOrder: 6 },
  { name: 'Beverages', sortOrder: 7 }
]

export const items = [
  { name: 'Apples', defaultUnit: 'lb', categoryName: 'Produce', barcode: null, brand: null, unitPrice: 2.49 },
  { name: 'Bananas', defaultUnit: 'lb', categoryName: 'Produce', barcode: null, brand: null, unitPrice: 0.79 },
  { name: 'Milk', defaultUnit: 'gal', categoryName: 'Dairy', barcode: '111111111111', brand: 'Valley Fresh', unitPrice: 4.29 },
  { name: 'Eggs', defaultUnit: 'dozen', categoryName: 'Dairy', barcode: '222222222222', brand: 'Golden Farm', unitPrice: 3.99 },
  { name: 'Chicken Breast', defaultUnit: 'lb', categoryName: 'Meat', barcode: '333333333333', brand: 'Market Select', unitPrice: 6.49 },
  { name: 'Sourdough Bread', defaultUnit: 'loaf', categoryName: 'Bakery', barcode: '444444444444', brand: 'Crust & Co', unitPrice: 5.49 },
  { name: 'Rice', defaultUnit: 'bag', categoryName: 'Pantry', barcode: '555555555555', brand: 'Harvest Home', unitPrice: 7.99 },
  { name: 'Frozen Pizza', defaultUnit: 'box', categoryName: 'Frozen', barcode: '666666666666', brand: 'Slice Night', unitPrice: 8.99 },
  { name: 'Sparkling Water', defaultUnit: 'pack', categoryName: 'Beverages', barcode: '777777777777', brand: 'Clear Peak', unitPrice: 6.29 }
]

import { apiClient } from './apiClient'

export const getCategories = () => apiClient.get('/api/categories')
export const getItems = () => apiClient.get('/api/items')

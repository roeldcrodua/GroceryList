import { apiClient } from './apiClient'

export const getLists = () => apiClient.get('/api/lists')
export const getList = (listId) => apiClient.get(`/api/lists/${listId}`)
export const createList = (payload) => apiClient.post('/api/lists', payload)
export const updateList = (listId, payload) => apiClient.patch(`/api/lists/${listId}`, payload)
export const deleteList = (listId) => apiClient.delete(`/api/lists/${listId}`)
export const createListItem = (listId, payload) => apiClient.post(`/api/lists/${listId}/items`, payload)
export const updateListItem = (listItemId, payload) => apiClient.patch(`/api/list-items/${listItemId}`, payload)
export const deleteListItem = (listItemId) => apiClient.delete(`/api/list-items/${listItemId}`)

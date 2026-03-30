const checkResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Request failed.' }))
    throw new Error(errorBody.error || 'Request failed.')
  }

  return response.json()
}

export const apiClient = {
  get: async (path) => {
    const response = await fetch(path)
    return checkResponse(response)
  },
  post: async (path, body) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return checkResponse(response)
  },
  patch: async (path, body) => {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return checkResponse(response)
  },
  delete: async (path) => {
    const response = await fetch(path, { method: 'DELETE' })
    return checkResponse(response)
  }
}

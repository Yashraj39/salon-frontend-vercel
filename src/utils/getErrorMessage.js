const getErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return String(data.errors[0])
  }

  if (err?.response?.status === 400) return 'Invalid request'
  if (err?.response?.status === 401) return 'Unauthorized'
  if (err?.response?.status === 403) return 'Access denied'
  if (err?.response?.status === 404) return 'Not found'
  if (err?.response?.status === 409) return 'Already exists'
  if (err?.response?.status >= 500) return 'Server error'

  if (err?.request && !err?.response) {
    return 'Server not responding'
  }

  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message
  }

  return fallback
}

export default getErrorMessage
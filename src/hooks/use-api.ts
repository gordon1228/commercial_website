import { useState, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiOptions {
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
  successMessage?: string
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (
    apiCall: () => Promise<Response>,
    options: ApiOptions = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setState({ data, loading: false, error: null })

      if (options.onSuccess) {
        options.onSuccess(data)
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))

      if (options.onError) {
        options.onError(errorMessage)
      }

      return { data: null, error: errorMessage }
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    clearError
  }
}

export function useFetch<T = unknown>(url: string, options?: RequestInit) {
  const api = useApi<T>()

  const fetch = useCallback((customOptions?: RequestInit) => {
    return api.execute(() => 
      window.fetch(url, { ...options, ...customOptions })
    )
  }, [url, options, api])

  return {
    ...api,
    fetch
  }
}

export function useFormSubmit<T = unknown>() {
  const api = useApi<T>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(async (
    url: string,
    data: unknown,
    options: ApiOptions & { method?: 'POST' | 'PUT' | 'PATCH' } = {}
  ) => {
    setIsSubmitting(true)

    const result = await api.execute(() => 
      fetch(url, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }), 
      options
    )

    setIsSubmitting(false)
    return result
  }, [api])

  return {
    ...api,
    submit,
    isSubmitting
  }
}
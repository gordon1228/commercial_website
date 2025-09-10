import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// Mock session data for testing
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  },
  expires: '2030-01-01T00:00:00.000Z'
}

// Mock session for regular user
export const mockUserSession = {
  user: {
    id: 'test-user-id',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user'
  },
  expires: '2030-01-01T00:00:00.000Z'
}

// Wrapper component for providers
interface AllTheProvidersProps {
  children: React.ReactNode
  session?: any
}

const AllTheProviders = ({ children, session = null }: AllTheProvidersProps) => {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: RenderOptions & { session?: any }
) => {
  const { session, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const createMockVehicle = (overrides = {}) => ({
  id: 'test-vehicle-id',
  name: 'Test Vehicle',
  model: 'Test Model',
  year: 2023,
  price: 50000,
  description: 'Test vehicle description',
  specifications: {
    engine: '2.0L',
    transmission: 'Automatic',
    fuelType: 'Gasoline'
  },
  features: ['Feature 1', 'Feature 2'],
  category: 'truck' as const,
  status: 'active' as const,
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockContactForm = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  subject: 'Test Subject',
  message: 'Test message content',
  company: 'Test Company',
  preferredContact: 'email' as const,
  ...overrides
})

// Mock API responses
export const mockApiSuccess = (data: any) => ({
  ok: true,
  status: 200,
  json: async () => ({ success: true, data }),
  text: async () => JSON.stringify({ success: true, data }),
})

export const mockApiError = (message: string, status: number = 400) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  text: async () => JSON.stringify({ error: message }),
})

// Test helpers for form validation
export const fillFormField = (container: HTMLElement, name: string, value: string) => {
  const field = container.querySelector(`[name="${name}"]`) as HTMLInputElement
  if (field) {
    field.value = value
    field.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

export const submitForm = (container: HTMLElement) => {
  const form = container.querySelector('form')
  if (form) {
    form.dispatchEvent(new Event('submit', { bubbles: true }))
  }
}

// Mock fetch responses
export const mockFetch = (response: any, status: number = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  })
}

// Mock fetch error
export const mockFetchError = (error: string) => {
  global.fetch = jest.fn().mockRejectedValue(new Error(error))
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock router helpers
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  ...overrides
})

// Mock next/navigation hooks
export const mockUseRouter = (router = {}) => {
  const mockRouter = createMockRouter(router)
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockRouter.pathname,
    useSearchParams: () => new URLSearchParams(),
  }))
  return mockRouter
}

// Test data generators
export const generateVehicles = (count: number) => {
  return Array.from({ length: count }, (_, index) => 
    createMockVehicle({
      id: `vehicle-${index}`,
      name: `Vehicle ${index + 1}`,
      price: 50000 + (index * 10000)
    })
  )
}

export const generateUsers = (count: number) => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `user-${index}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`
    })
  )
}

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('@axe-core/react')
  const results = await axe(container)
  expect(results.violations).toHaveLength(0)
}

// Mock window dimensions for responsive testing
export const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Mock intersection observer for testing lazy loading
export const mockIntersectionObserver = (isIntersecting: boolean = true) => {
  const mockObserve = jest.fn()
  const mockUnobserve = jest.fn()
  const mockDisconnect = jest.fn()

  global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: '',
    thresholds: [],
  }))

  // Trigger intersection change
  const triggerIntersection = (entries: any[] = [{ isIntersecting }]) => {
    const observer = (global.IntersectionObserver as jest.Mock).mock.results[0]?.value
    if (observer) {
      const callback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0]
      callback(entries)
    }
  }

  return {
    mockObserve,
    mockUnobserve,
    mockDisconnect,
    triggerIntersection,
  }
}

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const startTime = performance.now()
  renderFn()
  await waitForAsync()
  const endTime = performance.now()
  return endTime - startTime
}

// Mock console methods for testing
export const mockConsole = () => {
  const originalConsole = { ...console }
  const mockMethods = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }

  Object.assign(console, mockMethods)

  const restore = () => {
    Object.assign(console, originalConsole)
  }

  return { ...mockMethods, restore }
}

// Error boundary testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong</div>
    }

    return this.props.children
  }
}

// Mock timers for testing
export const mockTimers = () => {
  jest.useFakeTimers()
  return {
    advanceTimersByTime: jest.advanceTimersByTime,
    runAllTimers: jest.runAllTimers,
    runOnlyPendingTimers: jest.runOnlyPendingTimers,
    clearAllTimers: jest.clearAllTimers,
    restore: () => jest.useRealTimers(),
  }
}

export default {
  render: customRender,
  mockSession,
  mockUserSession,
  createMockVehicle,
  createMockUser,
  createMockContactForm,
  mockApiSuccess,
  mockApiError,
  fillFormField,
  submitForm,
  mockFetch,
  mockFetchError,
  waitForAsync,
  createMockRouter,
  mockUseRouter,
  generateVehicles,
  generateUsers,
  checkAccessibility,
  mockWindowSize,
  mockIntersectionObserver,
  measureRenderTime,
  mockConsole,
  TestErrorBoundary,
  mockTimers,
}
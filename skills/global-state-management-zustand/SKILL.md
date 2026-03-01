---
name: global-state-management-zustand
description: 'Complete guide for building and using global state management with Zustand in src/stores/. Use when creating centralized app state, persisting user preferences, managing authentication tokens, handling filters and pagination, and sharing state across components. Learn store patterns, Zustand middleware, TypeScript types, component integration, and best practices for organizing application state.'
---

# Global State Management with Zustand

Complete guide for building and using Zustand stores for centralized application state management.

## When to Use This Skill

- Creating global application state (auth, ui, filters)
- Persisting user preferences to localStorage
- Managing authentication tokens and user data
- Handling filters and pagination state
- Sharing state across deeply nested components
- Avoiding prop drilling for widely-used data
- Creating reusable state slices for features
- Implementing persistent storage for app state
- Managing modal and sidebar visibility states

## What is Zustand?

Zustand is a lightweight state management library for React with:
- **Simple API** - Less boilerplate than Redux
- **Hooks-based** - Use like React hooks in components
- **TypeScript Support** - Full type safety
- **Middleware** - Add persistence, logging, devtools
- **No Provider Hell** - No context wrapper needed

## Store Organization

### Folder & File Structure

```
src/stores/
├── useAuthStore.ts                 # Authentication & user info
├── useUIStore.ts                   # UI state (sidebars, modals)
├── useDetailStore.ts               # Detail page state (selected item)
├── useFilterStore.ts               # Filter/search state
├── usePaginationStore.ts           # Pagination state
├── useContactStore.ts              # Contact-specific state
├── useProductStore.ts              # Product/MDM state
├── useSelectedData.ts              # Multi-select state
├── useSnackbarStore.ts             # Toast/notification state
└── useComingSoonStore.ts           # Feature flags/coming soon
```

### Store Naming Convention

- **Filename**: `use[Feature]Store.ts` (camelCase with "Store" suffix)
- **Export**: `export const use[Feature]Store = create...`
- **Usage**: `const value = use[Feature]Store((state) => state.property)`

## Core Store Patterns

### Pattern 1: Simple Store (No Persistence)

For ephemeral state that resets on page reload:

```typescript
// src/stores/useUIStore.ts

import { create } from 'zustand'

// 1. Define state interface
type UIState = {
  // State properties
  isSideBarShow: 'show' | 'minify'
  menuCode: string
  isModalOpen: boolean
  
  // Action methods
  setMenuCode: (code: string) => void
  setIsSideBarShow: (val: 'show' | 'minify') => void
  toggleSidebar: () => void
  openModal: () => void
  closeModal: () => void
}

// 2. Create store
export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isSideBarShow: 'show',
  menuCode: 'm-incident-management',
  isModalOpen: false,

  // Action methods (using set function)
  setMenuCode: (code) => {
    set({ menuCode: code })
  },

  setIsSideBarShow: (val) => {
    set({ isSideBarShow: val })
  },

  toggleSidebar: () =>
    set((state) => ({
      isSideBarShow: state.isSideBarShow === 'show' ? 'minify' : 'show',
    })),

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}))

// 3. Usage in component
function MyComponent() {
  const { isSideBarShow, toggleSidebar } = useUIStore()
  
  return (
    <button onClick={toggleSidebar}>
      {isSideBarShow === 'show' ? 'Hide' : 'Show'} Sidebar
    </button>
  )
}
```

**Key Points:**
- No middleware for simple UI state
- Direct state access and mutations
- Used for temporary UI state (modals, sidebars)
- Resets on page refresh

### Pattern 2: Persistent Store with Middleware

For state that needs to survive page reloads:

```typescript
// src/stores/useAuthStore.ts

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// 1. Define state interface
interface AuthState {
  // State
  token: string | null
  user: { id: string; name: string } | null
  isAuthLoading: boolean
  
  // Actions
  setToken: (token: string) => void
  setUser: (user: any) => void
  setIsAuthLoading: (loading: boolean) => void
  logout: () => void
}

// 2. Create store with persist middleware
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      user: null,
      isAuthLoading: false,

      // Actions
      setToken: (token) => set({ token }),

      setUser: (user) => set({ user }),

      setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),

      logout: () => set({ token: null, user: null }),
    }),

    // Persistence configuration
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      skipHydration: true, // Handle hydration manually if needed
      partialState: ['token', 'user'], // Only persist specific fields (optional)
    }
  )
)

// 3. Usage in component
function ProvidedComponent() {
  const { token, user, logout } = useAuthStore()
  
  return token ? (
    <div>
      Welcome {user?.name}
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <p>Not authenticated</p>
  )
}
```

**Key Points:**
- Uses `persist` middleware for localStorage
- Survives page reloads
- `skipHydration` prevents hydration mismatch
- Can specify which fields to persist
- Useful for auth, settings, preferences

### Pattern 3: Store with Updater Functions

For complex state updates using updater functions:

```typescript
// src/stores/useFilterStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 1. Define flexible state structure
interface FilterValues {
  [key: string]: any
}

interface FilterState {
  values: FilterValues
  setValues: (val: FilterValues | ((prev: FilterValues) => FilterValues)) => void
  clearFilters: () => void
  updateSingleFilter: (key: string, value: any) => void
}

// 2. Create store with updater pattern
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // Initial state
      values: {
        search: '',
        status: [],
        dateRange: null,
      },

      // Action: accepts object or function
      setValues: (val) =>
        set((state) => ({
          values: typeof val === 'function' ? val(state.values) : val,
        })),

      // Action: clear all filters
      clearFilters: () =>
        set({
          values: {
            search: '',
            status: [],
            dateRange: null,
          },
        }),

      // Action: update single filter field
      updateSingleFilter: (key, value) =>
        set((state) => ({
          values: {
            ...state.values,
            [key]: value,
          },
        })),
    }),

    { name: 'filters' }
  )
)

// 3. Usage in component
function FilterPanel() {
  const { values, setValues, updateSingleFilter, clearFilters } = useFilterStore()

  // Update with object
  const handleSetStatus = (status: string[]) => {
    updateSingleFilter('status', status)
  }

  // Update with function
  const handleSearchChange = (search: string) => {
    setValues((prev) => ({
      ...prev,
      search,
    }))
  }

  // Clear all
  const handleClear = () => {
    clearFilters()
  }

  return (
    <div>
      <input
        value={values.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleClear}>Clear Filters</button>
    </div>
  )
}
```

**Key Points:**
- Flexible updater function pattern
- Supports both object and function updates
- Good for complex nested state
- Useful for filters, pagination, search

### Pattern 4: Store with Computed Selectors

For derived/computed state from store:

```typescript
// src/stores/useDetailStore.ts

import { create } from 'zustand'

interface DetailItem {
  id: string
  name: string
  status: 'active' | 'inactive'
}

interface DetailState {
  detailCode: string | null
  detailData: DetailItem | null
  isLoading: boolean

  // Actions
  setDetailCode: (code: string) => void
  setDetailData: (data: DetailItem | null) => void
  setIsLoading: (loading: boolean) => void
  clearDetail: () => void

  // Computed (using store directly in component via selectors)
  isDetailOpen: boolean
  detailTitle: string
}

export const useDetailStore = create<DetailState>((set, get) => ({
  // State
  detailCode: null,
  detailData: null,
  isLoading: false,

  // Actions
  setDetailCode: (code) => set({ detailCode: code }),

  setDetailData: (data) => set({ detailData: data }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  clearDetail: () =>
    set({ detailCode: null, detailData: null, isLoading: false }),

  // Computed properties (derived from state)
  get isDetailOpen() {
    return get().detailCode !== null
  },

  get detailTitle() {
    return get().detailData?.name || 'Detail'
  },
}))

// 3. Usage with selectors for performance
function DetailView() {
  // Subscribe only to detailCode (re-render only if this changes)
  const detailCode = useDetailStore((state) => state.detailCode)
  
  // Subscribe only to detailData
  const detailData = useDetailStore((state) => state.detailData)
  
  // Manual selector to prevent unnecessary re-renders
  const isOpen = useDetailStore((state) => state.detailCode !== null)

  return (
    <div>
      {isOpen && (
        <div>
          <h1>{detailData?.name}</h1>
          <p>Code: {detailCode}</p>
        </div>
      )}
    </div>
  )
}
```

**Key Points:**
- Use `get()` to access state inside actions
- Computed properties for derived data
- Selectors in components control re-renders
- Granular subscriptions prevent re-renders

## Workflow: Creating a Store

### Step 1: Plan Store Requirements

Before creating a store:

**What data should be global?**
- Frequently accessed across many components?
- Too deep prop drilling?
- Needs to persist across reloads?

**What should be local?**
- Component-specific UI state?
- Form input before submission?
- Keep at component level

**Should it persist?**
- Auth token? **YES**
- User preferences? **YES**
- Filters? **YES** (optional)
- Modal visibility? **NO**
- Current page state? **NO**

### Step 2: Define TypeScript Interface

Always define state shape first:

```typescript
// Define all state and actions
interface MyState {
  // Data
  items: any[]
  selectedId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setItems: (items: any[]) => void
  selectItem: (id: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSelection: () => void
}
```

### Step 3: Create Simple Non-Persistent Store

For transient state:

```typescript
// src/stores/useDashboardStore.ts

import { create } from 'zustand'

interface DashboardState {
  activeTab: 'overview' | 'analytics' | 'settings'
  isChartVisible: boolean
  setActiveTab: (tab: string) => void
  toggleChart: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'overview',
  isChartVisible: true,

  setActiveTab: (tab) => set({ activeTab: tab as any }),

  toggleChart: () =>
    set((state) => ({
      isChartVisible: !state.isChartVisible,
    })),
}))
```

### Step 4: Create Persistent Store

For data that should survive reloads:

```typescript
// src/stores/useSettingsStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark'
  language: 'en' | 'id'
  notifications: boolean

  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: 'en' | 'id') => void
  setNotifications: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      notifications: true,

      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
      setNotifications: (enabled) => set({ notifications: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: localStorage,
    }
  )
)
```

### Step 5: Create Store with Complex Updates

For stores with related state updates:

```typescript
// src/stores/useCheckoutStore.ts

import { create } from 'zustand'

interface CartItem {
  id: string
  quantity: number
  price: number
}

interface CheckoutState {
  items: CartItem[]
  selectedAddress: string | null
  paymentMethod: 'card' | 'bank' | null

  // Individual setters
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  setSelectedAddress: (address: string) => void
  setPaymentMethod: (method: 'card' | 'bank') => void

  // Computed values
  total: number
  itemCount: number

  // Reset
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  // State
  items: [],
  selectedAddress: null,
  paymentMethod: null,

  // Actions
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  setSelectedAddress: (address) => set({ selectedAddress: address }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // Computed values using getter
  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  get itemCount() {
    return get().items.length
  },

  // Reset state
  reset: () =>
    set({
      items: [],
      selectedAddress: null,
      paymentMethod: null,
    }),
}))

// Usage
function CheckoutComponent() {
  const { items, total, addItem, removeItem } = useCheckoutStore()

  return (
    <div>
      <p>Total: ${total}</p>
      <button onClick={() => addItem({ id: '1', quantity: 1, price: 100 })}>
        Add Item
      </button>
    </div>
  )
}
```

## Advanced Patterns

### Pattern: Combining Multiple Stores

```typescript
function UserProfile() {
  // Multiple stores in one component
  const { user } = useAuthStore()
  const { theme } = useSettingsStore()
  const { notification } = useUIStore()

  return (
    <div style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
      <h1>{user?.name}</h1>
      {notification && <Toast message={notification} />}
    </div>
  )
}
```

### Pattern: Store Subscription Outside Components

```typescript
// Subscribe to store changes
const unsubscribe = useAuthStore.subscribe(
  (state) => state.token, // Select what to watch
  (token) => {
    // Run when token changes
    console.log('Token changed:', token)
  }
)

// Unsubscribe when done
unsubscribe()
```

### Pattern: Reset Store to Defaults

```typescript
// Create a resetStore function
const useMyStore = create<MyState>((set) => ({
  // ... initial state
  reset: () => set({ /* reset values */ })
}))

// Or externally
export const resetAllStores = () => {
  useAuthStore.setState({ token: null })
  useFilterStore.setState({ values: {} })
  useUIStore.setState({ isModalOpen: false })
}
```

### Pattern: DevTools Integration (Optional)

```typescript
import { devtools } from 'zustand/middleware'

export const useMyStore = create<MyState>()(
  devtools(
    (set) => ({
      // store implementation
    }),
    { name: 'MyStore' }
  )
)
```

## Best Practices

### ✅ DO

- **Define TypeScript Interfaces** - Full type safety
- **Keep Stores Focused** - One responsibility per store
- **Use Persist Middleware** - For data that should survive reloads
- **Create Selector Functions** - For performance optimization
- **Document Store Usage** - Comment about state purpose
- **Use Reset Functions** - For logout/reset scenarios
- **Minimize Rerenders** - Use granular selectors in components
- **Keep Logic Pure** - No side effects in actions
- **Use Good Naming** - Clear store and action names
- **Avoid Over-normalization** - Keep structure simple but organized

### ❌ AVOID

- **Massive Stores** - Split into focused stores
- **Callback Hell** - Keep update functions simple
- **Side Effects in Actions** - Use hooks for side effects
- **Directly Mutating State** - Always use set()
- **Complex Selectors in Components** - Extract to helper functions
- **Ignoring TypeScript** - Always type state
- **Storing Everything** - Only global, frequently-used data
- **Forgetting to Unsubscribe** - Call unsubscribe() when needed
- **Mixing Sync and Async** - Use async thunks or custom middleware
- **Not Testing** - Test state changes

## Common Store Patterns

### Store for Form State

```typescript
export const useFormStore = create<FormState>((set) => ({
  formData: {},
  errors: {},
  isSubmitting: false,

  setFieldValue: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setError: (field, error) =>
    set((state) => ({
      errors: { ...state.errors, [field]: error },
    })),

  submit: async () => {
    set({ isSubmitting: true })
    // API call
    set({ isSubmitting: false })
  },

  reset: () =>
    set({ formData: {}, errors: {}, isSubmitting: false }),
}))
```

### Store for List with Filtering

```typescript
export const useListStore = create<ListState>((set, get) => ({
  items: [],
  searchTerm: '',
  filters: {},

  setItems: (items) => set({ items }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilters: (filters) => set({ filters }),

  get filteredItems() {
    const { items, searchTerm, filters } = get()
    return items.filter(
      (item) =>
        item.name.includes(searchTerm) &&
        Object.entries(filters).every(([key, value]) => item[key] === value)
    )
  },
}))
```

## Troubleshooting

### State not persisting after reload

**Cause**: Missing persist middleware or incorrect storage
**Solution**:
```typescript
export const useMyStore = create<MyState>()(
  persist(
    (set) => ({ /* store */ }),
    { name: 'my-storage', storage: localStorage }
  )
)
```

### Component re-renders on every state change

**Cause**: Not using granular selectors
**Solution**:
```typescript
// ❌ WRONG - Re-renders on any state change
const state = useMyStore()

// ✅ RIGHT - Re-renders only on selectedId change
const selectedId = useMyStore((state) => state.selectedId)
```

### State undefined on first load

**Cause**: Hydration timing issue with persistence
**Solution**:
```typescript
const isHydrated = useMyStore((state) => state._hasHydrated)

if (!isHydrated) return <LoadingSpinner />
```

### Actions not updating state

**Cause**: Not using set() function
**Solution**:
```typescript
// ✅ Correct
setToken: (token) => set({ token })

// ❌ Wrong - Direct mutation
setToken: (token) => { this.token = token }
```

## Related Skills

**Prerequisites**
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For typing store state and actions

**Often Used Together**
- [custom-react-hooks](../custom-react-hooks/SKILL.md) - For using store state in component hooks
- [api-client-services](../api-client-services/SKILL.md) - For managing API communication state

**Can Reference**
- [global-context-providers](../global-context-providers/SKILL.md) - For providing store state to app via context

## References

- [Zustand Official Documentation](https://github.com/pmndrs/zustand)
- [Zustand Middleware](https://github.com/pmndrs/zustand/tree/main/docs/guides/typescript.md)
- [State Management Best Practices](https://zustand-demo.pmnd.rs/)
- [React Context vs Zustand](https://github.com/pmndrs/zustand#comparison-to-other-libraries)
- [TypeScript with Zustand](https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md)

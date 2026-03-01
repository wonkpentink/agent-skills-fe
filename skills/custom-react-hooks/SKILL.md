---
name: custom-react-hooks
description: 'Complete guide for creating and using custom React hooks in src/hooks/. Use when extracting reusable logic, creating domain-specific hooks, building API query/mutation hooks with React Query, handling authentication state, and sharing stateful logic across components. Learn hook patterns, TanStack Query integration, error handling, TypeScript typing, and best practices. Includes real-world examples from customer, employee, IDM, MDM, and partner domains.'
---

# Custom React Hooks

Complete guide for building and using custom React hooks for reusable stateful logic.

## When to Use This Skill

- Extracting repeating logic from multiple components
- Creating domain-specific hooks (customer, employee, partner)
- Building query hooks for data fetching (useQuery)
- Building mutation hooks for API calls (useMutation)
- Handling authentication and authorization logic
- Managing complex state patterns
- Debouncing, throttling, or other timing-based logic
- Integrating with global stores (Zustand)
- Building computed/derived values and caching

## Hook Organization & Structure

### Folder Organization

```
src/hooks/
├── custom/                         # Utility hooks (reusable logic)
│   └── useDebounce.ts              # Debounce values
├── customer/                       # Customer domain hooks
│   ├── useCustomerList.ts          # Query: fetch customers
│   ├── useCustomerDetail.ts        # Query: single customer detail
│   ├── useAddContacts.ts           # Mutation: add contact
│   ├── useUpdateTag.ts             # Mutation: update tags
│   ├── useUpdateContacts.ts        # Mutation: update contact
│   └── ...
├── employee/                       # Employee domain hooks
│   ├── useGetEmployee.ts           # Query: fetch employees
│   └── useGetDataUserLogin.ts      # Query: logged-in user data
├── idm/                            # Identity Management hooks
│   ├── useAuthorize.ts             # Mutation: authorize user
│   ├── useTokenRefresher.ts        # Effect: refresh token
│   └── useGetIp.ts                 # Query: get user IP
├── mdm/                            # Master Data Management hooks
│   ├── useBranch.ts                # Query: fetch branches
│   ├── useCity.ts                  # Query: fetch cities
│   ├── useProduct.ts               # Query: fetch products
│   └── ...
└── partner/                        # Partner domain hooks
    └── usePartnerList.ts           # Query: fetch partners
```

## Hook Patterns

### Pattern 1: Simple Utility Hook (No Async)

For pure logic extracted from components:

```typescript
// src/hooks/custom/useDebounce.ts

import { useEffect, useState } from 'react'

// Usage: const debouncedValue = useDebounce(value, 300)
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up timer
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup previous timer
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**Key Points:**
- Generic type parameter `<T>` for flexibility
- Returns transformed value
- Cleanup function to prevent memory leaks
- Dependencies properly specified

### Pattern 2: Query Hook (Data Fetching)

For read-only data fetching:

```typescript
// src/hooks/customer/useCustomerList.ts

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCustomerList } from '@/lib/api/contacts/contactServices'
import { useAuthStore } from '@/stores/useAuthStore'

interface CustomerListParams {
  show_pagination?: boolean
  per_page?: number
  page?: number
  codes?: string
  emails?: string
  v?: string // search
  start_date?: string
  end_date?: string
  updated_at_start?: string
  updated_at_end?: string
  lead_statuses?: string
  tags?: string
  pic_codes?: string
  tele_statuses?: string
  branch_codes?: string
  sources?: string
  whatsapp?: string
}

interface CustomerListResponse {
  success: boolean
  data: {
    list: any[]
    pagination: {
      page: number
      per_page: number
      total: number
    }
  }
}

export const useCustomerList = (params: CustomerListParams) => {
  const { isAuthLoading } = useAuthStore()
  const [isEnabled, setIsEnabled] = useState(false)

  // 1. Wait for auth to complete before enabling query
  useEffect(() => {
    if (!isAuthLoading) {
      const timer = setTimeout(() => {
        setIsEnabled(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isAuthLoading])

  // 2. Return query hook
  return useQuery<CustomerListResponse>({
    queryKey: ['customerList', params],
    queryFn: () => fetchCustomerList(params),
    enabled: isEnabled, // Only fetch when auth is ready
    staleTime: 1000 * 60 * 5, // Data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Cache kept for 10 minutes
    retry: false, // Don't auto-retry on failure
  })
}
```

**Key Points:**
- Waits for auth to complete before fetching
- Uses React Query for caching and state management
- Configurable stale time and cache time
- Proper TypeScript typing for params and response
- Query key includes params for proper invalidation

### Pattern 3: Mutation Hook (API Write Operations)

For create/update/delete operations:

```typescript
// src/hooks/customer/useUpdateTag.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTag } from '@/lib/api/contacts/contactServices'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useAuthorize } from '../idm/useAuthorize'

interface UpdateTagPayload {
  customer_code: string
  tags: Array<{ tag_code: string; tag_name: string }>
}

interface UpdateTagResponse {
  success: boolean
  message: string
  data?: any
}

export const useUpdateTag = () => {
  const queryClient = useQueryClient()
  const { mutate: authorizeMutate } = useAuthorize()
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar)

  // 1. Setup mutation
  return useMutation<UpdateTagResponse, unknown, UpdateTagPayload>({
    // API call function
    mutationFn: (body: UpdateTagPayload) => updateTag(body),

    // 2. On success
    onSuccess: (data: UpdateTagResponse) => {
      if (data?.success) {
        // Invalidate related queries to refetch
        queryClient.invalidateQueries({ queryKey: ['customerList'] })
        queryClient.invalidateQueries({ queryKey: ['activityLog'] })

        // Show success message
        showSnackbar('Update contacts successfully', 'success', 'top')
      } else if (data?.success === false) {
        // Server returned error in success response
        showSnackbar(data.message, 'error', 'top')
      }
    },

    // 3. On error
    onError: (error: any) => {
      if (error.status === 403) {
        // Unauthorized - refresh auth
        showSnackbar("You don't have access", 'error', 'top')
        authorizeMutate(2)
      } else {
        // Generic error
        showSnackbar('Update failed', 'error', 'top')
      }
    },
  })
}
```

**Key Points:**
- Takes payload and returns response
- Invalidates related queries on success
- Shows user feedback via snackbar
- Handles authorization errors specially
- Proper error state management

### Pattern 4: Authentication Mutation Hook

For login/auth operations:

```typescript
// src/hooks/idm/useAuthorize.ts

import { useMutation } from '@tanstack/react-query'
import { authorize } from '@/lib/api/idm/idmService'
import { encryptLS } from '@/lib/utils/Crypto'
import { useAuthStore } from '@/stores/useAuthStore'
import { AxiosError } from 'axios'
import { apiResponseRoute } from '@/lib/utils/apiResponse'

interface AuthorizeResponse {
  success: boolean
  data?: {
    token: string
    user?: any
  }
}

export const useAuthorize = () => {
  const { setIsAuthLoading, setToken } = useAuthStore()

  // 1. Setup mutation for authorization
  const mutation = useMutation<AuthorizeResponse, AxiosError, number>({
    // API call - takes user_type as parameter
    mutationFn: (user_type: number) => authorize(user_type),

    // 2. Before mutation (show loading)
    onMutate: () => setIsAuthLoading(true),

    // 3. On success
    onSuccess: (data: AuthorizeResponse) => {
      const plainToken = data?.data?.token

      // Encrypt and store token
      const encryptedToken = encryptLS(plainToken)
      setToken(encryptedToken)
      localStorage.setItem(
        import.meta.env.VITE_APP_TOKEN_TYPE,
        encryptedToken
      )

      // Clear loading state
      setIsAuthLoading(false)
    },

    // 4. On error
    onError: (error: AxiosError) => {
      setIsAuthLoading(false)

      if (error?.response?.status === 403) {
        // Session expired - redirect to login
        localStorage.removeItem(import.meta.env.VITE_APP_TOKEN_TYPE)
        const signinUrl = `${import.meta.env.VITE_INTOOLS_V2}/signin?session-expired`
        window.location.href = signinUrl
        return
      }

      // Other errors - route to appropriate error page
      window.location.href = apiResponseRoute(error.response)
    },
  })

  return mutation // Return for .mutate() or .mutateAsync() usage
}
```

**Key Points:**
- Handles authentication lifecycle
- Encrypts and stores token securely
- Handles session expiration
- Redirects on error
- Returns mutation object for calling

## Workflow: Creating a Custom Hook

### Step 1: Analyze Requirements

Before creating a hook:

**What logic are you extracting?**
- Pure computation (utility hook)?
- Async data fetching (query hook)?
- API mutations (mutation hook)?
- Complex state logic (state hook)?

**Is it reusable?**
- Used in multiple components?
- Domain-specific or general utility?
- Client-side or API-based?

**What's the scope?**
- Local component state?
- Global app state?
- Cache state?

### Step 2: Plan Hook Structure

Define the hook signature:

```typescript
// Define input parameters
interface HookParams {
  required_param: string
  optional_param?: number
}

// Define return type
interface HookReturn {
  data: any
  isLoading: boolean
  error: Error | null
}

// Hook signature
export const useMyHook = (params: HookParams): HookReturn => {
  // Implementation
}
```

### Step 3: Implement Simple Utility Hook

For pure state/logic hooks:

```typescript
// src/hooks/custom/useToggle.ts

import { useCallback, useState } from 'react'

interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
}

export const useToggle = (initialValue = false): UseToggleReturn => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return { value, toggle, setTrue, setFalse }
}
```

### Step 4: Implement Query Hook

For fetching data:

```typescript
// src/hooks/mdm/useBranch.ts

import { useQuery } from '@tanstack/react-query'
import { fetchBranches } from '@/lib/api/mdm/mdmService'

interface BranchParams {
  show_pagination?: boolean
  per_page?: number
  page?: number
  status?: number
  branch_code?: string
}

interface Branch {
  code: string
  name: string
  status: number
}

interface BranchResponse {
  success: boolean
  data: {
    list: Branch[]
    pagination?: {
      total: number
      page: number
      per_page: number
    }
  }
}

export const useBranch = (
  params: BranchParams,
  enabled = true
) => {
  return useQuery<BranchResponse>({
    queryKey: ['branches', params],
    queryFn: () => fetchBranches(params),
    enabled, // Can be controlled from component
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}
```

### Step 5: Implement Mutation Hook with Options

For API write operations:

```typescript
// src/hooks/customer/useAddContacts.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addContact } from '@/lib/api/contacts/contactServices'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

interface AddContactPayload {
  customer_name: string
  email?: string
  phone?: string
  address?: string
  // ... more fields
}

interface AddContactResponse {
  success: boolean
  message: string
  data?: {
    customer_code: string
    // ... response data
  }
}

interface UseAddContactsOptions {
  onSuccess?: (data: AddContactResponse) => void
  onError?: (error: any) => void
}

export const useAddContacts = (options?: UseAddContactsOptions) => {
  const queryClient = useQueryClient()
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar)

  return useMutation<AddContactResponse, unknown, AddContactPayload>({
    mutationFn: (payload: AddContactPayload) => addContact(payload),

    onSuccess: (data: AddContactResponse) => {
      if (data?.success) {
        // Invalidate list to refetch
        queryClient.invalidateQueries({ queryKey: ['customerList'] })

        showSnackbar('Contact added successfully', 'success')

        // Call custom on-success callback
        options?.onSuccess?.(data)
      } else {
        showSnackbar(data.message, 'error')
      }
    },

    onError: (error: any) => {
      showSnackbar('Failed to add contact', 'error')
      options?.onError?.(error)
    },
  })
}
```

### Step 6: Implement Complex State Hook

For multi-piece state:

```typescript
// src/hooks/custom/useForm.ts

import { useCallback, useState } from 'react'

interface UseFormOptions<T> {
  initialValues: T
  onSubmit?: (values: T) => void | Promise<void>
  validate?: (values: T) => Record<string, string>
}

interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  isDirty: boolean
  isSubmitting: boolean
  setFieldValue: (field: keyof T, value: any) => void
  setValues: (values: T) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  reset: () => void
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      setIsDirty(true)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate
      if (validate) {
        const newErrors = validate(values)
        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) {
          return
        }
      }

      // Submit
      setIsSubmitting(true)
      try {
        await onSubmit?.(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validate, onSubmit]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsDirty(false)
  }, [initialValues])

  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    setFieldValue,
    setValues,
    handleSubmit,
    reset,
  }
}
```

## Advanced Patterns

### Pattern: Conditional Query Hook

```typescript
// Only fetch when enabled
export const useOptionalQuery = (id?: string) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id!),
    enabled: !!id, // Only fetch if id exists
  })
}
```

### Pattern: Dependent Queries

```typescript
// Fetch one, then fetch another based on result
export const useUserWithPosts = (userId: string) => {
  const userQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  })

  const postsQuery = useQuery({
    queryKey: ['posts', userQuery.data?.id],
    queryFn: () => fetchPosts(userQuery.data!.id),
    enabled: !!userQuery.data, // Wait for user data
  })

  return { userQuery, postsQuery }
}
```

### Pattern: Mutation with Optimistic Update

```typescript
// Update UI before server response
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => updateData(data),
    onMutate: async (newData) => {
      // Cancel in-flight requests
      await queryClient.cancelQueries({ queryKey: ['items'] })

      // Save old data
      const previousData = queryClient.getQueryData(['items'])

      // Optimistically update
      queryClient.setQueryData(['items'], (old: any) => ({
        ...old,
        ...newData,
      }))

      return { previousData }
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      queryClient.setQueryData(['items'], context.previousData)
    },
  })
}
```

### Pattern: Hook with Cleanup

```typescript
// Setup and teardown logic
export const useEventListener = (
  eventName: string,
  handler: (e: Event) => void
) => {
  useEffect(() => {
    // Setup
    const isSupported = typeof window !== 'undefined'
    if (!isSupported) return

    window.addEventListener(eventName, handler)

    // Cleanup
    return () => {
      window.removeEventListener(eventName, handler)
    }
  }, [eventName, handler])
}
```

## Best Practices

### ✅ DO

- **Use Descriptive Names** - Start with "use" prefix
- **Define TypeScript Types** - Input params and return types
- **Memoize Callbacks** - Use useCallback for stable references
- **Handle Loading States** - Provide status feedback
- **Clean Up Effects** - Return cleanup functions
- **Document Usage** - Include JSDoc comments and examples
- **Test Edge Cases** - Handle undefined, null, errors
- **Keep Hooks Focused** - Single responsibility
- **Return Stable Objects** - Prevent unnecessary re-renders
- **Use React Query** - For API queries and mutations

### ❌ AVOID

- **Calling Hooks Conditionally** - Always at top level
- **Hooks in Loops** - Keep them at component top level
- **Circular Dependencies** - Avoid hooks calling each other in loops
- **Memory Leaks** - Always cleanup subscriptions
- **Too Much Responsibility** - Keep hooks focused
- **Ignoring Dependencies** - Include all dependencies in arrays
- **Hardcoded Values** - Make hooks configurable
- **Mixing Concerns** - Don't combine async + complex state
- **Over-Fetching** - Use proper cache time
- **Not Handling Errors** - Always provide error handling

## Common Hook Patterns

### Pattern: Fetch Once on Mount

```typescript
export const useFetchOnce = (fetchFn: () => Promise<any>) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFn().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, []) // No dependencies = fetch once

  return { data, loading }
}
```

### Pattern: Local Storage Sync

```typescript
export const useLocalStorage = (key: string, initialValue: any) => {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })

  const setStoredValue = (value: any) => {
    setValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [value, setStoredValue] as const
}
```

### Pattern: Derived State

```typescript
export const useComputed = (source: any, compute: (a: any) => any) => {
  return useMemo(() => compute(source), [source, compute])
}
```

## Troubleshooting

### Hook called more than expected

**Cause**: Missing dependencies or component re-renders
**Solution**:
```typescript
useEffect(() => {
  // Effect logic
}, [dependency]) // Include ALL dependencies
```

### Stale closure in callbacks

**Cause**: Not using useCallback or dependencies missing
**Solution**:
```typescript
const handleClick = useCallback(() => {
  console.log(value) // Use current value
}, [value]) // Include dependencies
```

### Query not refetching after mutation

**Cause**: Query key mismatch or cache not invalidated
**Solution**:
```typescript
onSuccess: () => {
  // Exact same queryKey as the query hook
  queryClient.invalidateQueries({ 
    queryKey: ['customerList', params] 
  })
}
```

### Memory leak warnings

**Cause**: Missing cleanup in useEffect
**Solution**:
```typescript
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe() // Cleanup
}, [])
```

### Race conditions with async data

**Cause**: Multiple requests, last one might not resolve last
**Solution**:
```typescript
useEffect(() => {
  let isMounted = true

  fetchData().then((data) => {
    if (isMounted) setData(data) // Only if component still mounted
  })

  return () => {
    isMounted = false // Cleanup
  }
}, [])
```

## Related Skills

**Prerequisites**
- [api-client-services](../api-client-services/SKILL.md) - For building query and mutation hooks
- [global-state-management-zustand](../global-state-management-zustand/SKILL.md) - For integrating hooks with global state

**Often Used Together**
- [feature-specific-business-logic](../feature-specific-business-logic/SKILL.md) - Features using custom hooks for data management
- [full-page-screen-components](../full-page-screen-components/SKILL.md) - Pages consuming data fetching hooks

**Can Reference**
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For typing hook return values and parameters
- [form-validation-schemas](../form-validation-schemas/SKILL.md) - For validating mutation data in hooks

## References

- [React Hooks Official Guide](https://react.dev/reference/react/hooks)
- [React Custom Hooks Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TanStack Query (React Query) Docs](https://tanstack.com/query/latest)
- [useQuery vs useMutation](https://tanstack.com/query/latest/docs/react/queries)
- [Common Hooks Mistakes](https://react.dev/warnings/invalid-hook-call-warning)
- [Hooks Rules](https://react.dev/warnings/rules-of-hooks)

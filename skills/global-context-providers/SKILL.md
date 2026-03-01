---
name: global-context-providers
description: 'Complete guide for building global context providers in src/providers/. Learn AppProviders component for wrapping entire app with QueryClient setup, dev tools initialization, environment-based configuration. Use when setting up root-level context, initializing data fetching middleware, providing global state to all components, and configuring development utilities. Covers React Query setup, provider composition, TanStack Query integration, and best practices for centralized app initialization.'
---

# Global Context Providers

A comprehensive guide for creating and organizing global context providers in `src/providers/`. Global context providers wrap the entire application at the root level, initializing essential services like data fetching (React Query), authentication context, theme providers, and development tools.

## When to Use This Skill

- Setting up root-level context for the entire application
- Initializing React Query/TanStack Query for global state management
- Creating a wrapper component for the app root
- Setting up development tools (React Query Devtools, Redux Devtools)
- Configuring environment-based providers conditionally
- Combining multiple providers into a single root provider
- Initializing global services (analytics, error tracking, logging)
- Providing context to all child components at app startup

## Prerequisites

- Understanding of React Context API
- Familiarity with React Query/TanStack Query
- Knowledge of React component composition
- Understanding of environment variables and configuration
- Basic knowledge of provider patterns (Context.Provider, HOC)
- Understanding of application initialization flow

## File Organization

```
src/providers/
├── AppProviders.tsx         # Root provider wrapping entire app
├── QueryClientConfig.ts     # (Optional) QueryClient configuration
└── index.ts                 # (Optional) Barrel export for imports
```

## Core Patterns

### Pattern 1: Basic AppProviders with React Query

The AppProviders component wraps the entire application with React Query's QueryClientProvider, enabling data fetching capabilities across all child components:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from "react";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => {
    const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production")

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {!isProduction && <ReactQueryDevtools initialIsOpen={true} />}
        </QueryClientProvider>
    )
}
```

**Key features:**
- Initializes QueryClient at module level
- Provides QueryClient to all child components via QueryClientProvider
- Conditionally renders React Query Devtools in non-production
- Accepts children as ReactNode prop
- Simple, focused provider structure
- Enables useQuery and useMutation hooks throughout app

### Pattern 2: Extended Providers with Multiple Contexts

Stack multiple providers for different features (theme, auth, notifications):

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => {
    const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production")

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                    {!isProduction && <ReactQueryDevtools />}
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}
```

**Order matters:**
- Outermost providers (like QueryClient) should be on top
- Inner providers can depend on outer providers
- Child components access all nested providers

### Pattern 3: QueryClient Configuration

Customize QueryClient with specific cache, retry, and timeout settings:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,           // 5 minutes
                gcTime: 1000 * 60 * 10,             // 10 minutes (formerly cacheTime)
                retry: process.env.NODE_ENV === 'production' ? 3 : 1,
                refetchOnWindowFocus: false,
                refetchOnReconnect: 'stale',
            },
            mutations: {
                retry: 1,
            }
        }
    });
};
```

Then use in AppProviders:

```typescript
const queryClient = createQueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
```

### Pattern 4: Environment-Dependent Providers

Conditionally render providers or features based on environment:

```typescript
export const AppProviders = ({ children }: { children: ReactNode }) => {
    const isDevelopment = import.meta.env.DEV;
    const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production");
    const isStaging = import.meta.env.MODE === 'staging';

    return (
        <QueryClientProvider client={queryClient}>
            {isDevelopment && <DevelopmentProviders>{children}</DevelopmentProviders>}
            {!isDevelopment && children}
            {!isProduction && <ReactQueryDevtools />}
        </QueryClientProvider>
    )
}
```

## Step-by-Step Workflows

### Workflow 1: Create Basic AppProviders

1. **Import React Query and React**:
   ```typescript
   import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
   import { ReactNode } from "react";
   ```

2. **Initialize QueryClient at module level**:
   ```typescript
   const queryClient = new QueryClient();
   ```

3. **Create AppProviders component**:
   ```typescript
   export const AppProviders = ({ children }: { children: ReactNode }) => {
   ```

4. **Return QueryClientProvider with children**:
   ```typescript
   return (
       <QueryClientProvider client={queryClient}>
           {children}
       </QueryClientProvider>
   )
   ```

5. **Export component** for use in App.tsx

### Workflow 2: Add React Query Devtools

1. **Import ReactQueryDevtools**:
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   ```

2. **Detect production environment**:
   ```typescript
   const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production")
   ```

3. **Conditionally render devtools**:
   ```typescript
   {!isProduction && <ReactQueryDevtools initialIsOpen={true} />}
   ```

4. **Test in development** - devtools should appear in bottom-right
5. **Disable in production** - no devtools on production builds

### Workflow 3: Create Custom QueryClient Configuration

1. **Create separate config file** (`QueryClientConfig.ts`):
   ```typescript
   import { QueryClient } from "@tanstack/react-query";

   export const createQueryClient = () => {
       return new QueryClient({
           defaultOptions: {
               queries: {
                   staleTime: 1000 * 60 * 5,
                   gcTime: 1000 * 60 * 10,
                   retry: 1,
               }
           }
       });
   };
   ```

2. **Import and use in AppProviders**:
   ```typescript
   import { createQueryClient } from "./QueryClientConfig";

   const queryClient = createQueryClient();
   ```

3. **Customize settings** based on application needs

### Workflow 4: Stack Multiple Providers

1. **Create provider components** (ThemeProvider, AuthProvider, etc.)
2. **Nest them in AppProviders**:
   ```typescript
   return (
       <QueryClientProvider client={queryClient}>
           <ThemeProvider>
               <AuthProvider>
                   {children}
               </AuthProvider>
           </ThemeProvider>
       </QueryClientProvider>
   )
   ```

3. **Ensure correct order** (dependencies first)
4. **Test that all contexts work** - each child should access parent providers

### Workflow 5: Implement in App Root

1. **Import AppProviders in App.tsx**:
   ```typescript
   import { AppProviders } from './providers/AppProviders'
   ```

2. **Wrap main components**:
   ```typescript
   function App() {
       return (
           <AppProviders>
               <RouterProvider router={router} />
               <Snackbar />
               <Modal />
           </AppProviders>
       )
   }
   ```

3. **Ensure app initialization** - providers should be outermost wrapper
4. **Test data fetching** - useQuery should work in child components

## Real-World Examples

### Example 1: Basic AppProviders with Devtools

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from "react";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => {
    const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production")

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {!isProduction && <ReactQueryDevtools initialIsOpen={true} />}
        </QueryClientProvider>
    )
}
```

### Example 2: AppProviders with Custom Configuration

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,           // 5 min cache
            gcTime: 1000 * 60 * 10,             // 10 min garbage collection
            retry: 1,                            // Retry once on failure
            refetchOnWindowFocus: false,         // Don't refetch on window focus
            refetchOnReconnect: 'stale',         // Refetch if stale on reconnect
        },
        mutations: {
            retry: 1,
        }
    }
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
    const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production")
    const isDevelopment = import.meta.env.DEV

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {isDevelopment && !isProduction && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    )
}
```

### Example 3: Multi-Provider Setup

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => {
    const isProduction = Boolean(import.meta.env.VITE_APP_SERVER_NAME === "Production")

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        {children}
                        {!isProduction && <ReactQueryDevtools initialIsOpen={false} />}
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}
```

### Example 4: App.tsx Usage

```typescript
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AppProviders } from './providers/AppProviders'
import { Snackbar } from './components/snackbar/Snackbar'
import ComingSoonModal from './components/modal/ComingSoonModal'

function App() {
    return (
        <AppProviders>
            <Snackbar />
            <RouterProvider router={router} />
            <ComingSoonModal />
        </AppProviders>
    )
}

export default App
```

### Example 5: Custom QueryClient Configuration File

```typescript
// src/providers/QueryClientConfig.ts
import { QueryClient, DefaultError } from "@tanstack/react-query";

export const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Cache data for 5 minutes
                staleTime: 1000 * 60 * 5,
                // Keep data in memory for 10 minutes before garbage collection
                gcTime: 1000 * 60 * 10,
                // Retry failed requests once
                retry: (failureCount, error: any) => {
                    if (error?.response?.status === 404) return false;
                    return failureCount < 1;
                },
                // Don't refetch when window regains focus
                refetchOnWindowFocus: false,
                // Refetch stale data when network reconnects
                refetchOnReconnect: 'stale',
                // Don't refetch when component remounts
                refetchOnMount: false,
            },
            mutations: {
                retry: 1,
            }
        }
    });
};
```

## Integration with App

### Main App Component Structure

```typescript
// src/App.tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AppProviders } from './providers/AppProviders'
import { Snackbar } from './components/snackbar/Snackbar'
import Modal from './components/modal/Modal'

function App() {
    return (
        <AppProviders>
            {/* Global components that need provider access */}
            <Snackbar />
            <Modal />
            
            {/* Router wraps all pages */}
            <RouterProvider router={router} />
        </AppProviders>
    )
}

export default App
```

### Using Provided Context in Child Components

```typescript
// src/pages/Contacts.tsx
import { useQuery } from '@tanstack/react-query'
import { fetchContacts } from '@/lib/api/contacts'

export const ContactsPage: React.FC = () => {
    // useQuery works because QueryClientProvider is active
    const { data, isLoading, error } = useQuery({
        queryKey: ['contacts'],
        queryFn: fetchContacts,
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            {data?.map(contact => (
                <div key={contact.id}>{contact.name}</div>
            ))}
        </div>
    )
}
```

## Provider Configuration Options

### QueryClient Default Options

| Option | Default | Purpose |
|--------|---------|---------|
| `staleTime` | 0 | How long cached data is considered fresh |
| `gcTime` | 5 min | How long to keep data in memory after unused |
| `retry` | 3 | Number of retry attempts on failure |
| `refetchOnWindowFocus` | true | Refetch when window regains focus |
| `refetchOnReconnect` | true | Refetch when network reconnects |
| `refetchOnMount` | true | Refetch when component mounts |

### Recommended Settings

```typescript
{
    queries: {
        staleTime: 5 * 60 * 1000,              // 5 minutes
        gcTime: 10 * 60 * 1000,                // 10 minutes
        retry: process.env.NODE_ENV === 'production' ? 3 : 1,
        refetchOnWindowFocus: false,           // Usually not needed
        refetchOnReconnect: 'stale',          // Refetch stale data
    },
    mutations: {
        retry: 1,                              // Fewer retries for mutations
    }
}
```

## Best Practices

### ✅ Do's

- **Keep QueryClient at module level** - Initialize once, reuse throughout app
- **Wrap entire app with providers** - Place in root App component
- **Order providers correctly** - Outermost first, dependencies inside
- **Customize for your needs** - Adjust staleTime, gcTime, retry based on requirements
- **Use devtools in development** - Helps debug data fetching issues
- **Extract configuration** - Move complex QueryClient config to separate file
- **Document provider stack** - Comment on why each provider is needed
- **Test provider initialization** - Ensure all child components access contexts

### ❌ Don'ts

- **Don't recreate QueryClient** - Would clear cache on every render
- **Don't nest providers unnecessarily** - Each adds overhead
- **Don't disable devtools without reason** - Useful for debugging
- **Don't forget to export** - Component must be exported for use in App
- **Don't use magic strings** - Store env var names in constants
- **Don't ignore React Query warnings** - Check console for optimization tips
- **Don't mix provider patterns** - Stick to consistent provider structure
- **Don't forget children prop** - Components must accept and render children

## Common Patterns

### Pattern: Environment-Based Provider

```typescript
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const isStaging = import.meta.env.MODE === 'staging';

{!isProd && <ReactQueryDevtools />}
```

### Pattern: Conditional Feature Providers

```typescript
{isDevelopment && <DevelopmentProviders>{children}</DevelopmentProviders>}
{!isDevelopment && children}
```

### Pattern: Stacked Providers

```typescript
<OuterProvider>
    <MiddleProvider>
        <InnerProvider>
            {children}
        </InnerProvider>
    </MiddleProvider>
</OuterProvider>
```

### Pattern: Custom Hook for Provider Context

```typescript
export const useQueryClient = () => {
    return useQueryClient();  // From @tanstack/react-query
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "useQuery is not a hook" error | Ensure parent component is wrapped with QueryClientProvider |
| Devtools not appearing | Check environment - should only show in non-production |
| Cache not persisting | Verify gcTime setting - cache lifetime may be too short |
| Stale data on page load | Increase staleTime or disable refetchOnWindowFocus |
| Constant refetching | Check refetchOnMount and refetchOnWindowFocus settings |
| Devtools showing errors | Check React Query version compatibility |
| Provider nesting errors | Verify children prop is passed correctly |
| QueryClient initialization issues | Ensure QueryClient created at module level, not in render |

## References and File Locations

### Example Files to Review

- [AppProviders.tsx](../../../src/providers/AppProviders.tsx) - Root provider wrapping entire app with React Query
- [App.tsx](../../../src/App.tsx) - Usage of AppProviders with all child components
- [main.tsx](../../../src/main.tsx) - React root initialization

### Integration Points

- **App Root**: [src/App.tsx](../../../src/App.tsx) - Where AppProviders wraps components
- **Data Fetching**: [src/hooks/](../../../src/hooks/) - useQuery hooks depend on QueryClientProvider
- **Queries and Mutations**: Throughout the app - useQuery and useMutation need provider
- **Global State**: [src/stores/](../../../src/stores/) - Can depend on provider context

### Related Skills

- **Custom React Hooks**: Use with useQuery and useMutation hooks for data fetching
- **API Client Services**: Configure data fetching that works with QueryClient
- **Global State Management**: Zustand stores work alongside React Query
- **Feature-Specific Business Logic**: Features use providers for data fetching

## Advanced Extensions

### Add Error Handling Provider

```typescript
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                if (error?.status === 401) return false;  // Don't retry 401
                return failureCount < 3;
            }
        }
    }
});
```

### Add Request Interceptor via Provider

```typescript
queryClient.setDefaultOptions({
    queries: {
        queryFn: async (context) => {
            // Add auth header to all requests
            const token = localStorage.getItem('token');
            return fetch(context.queryKey[0], {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    }
});
```

### Add Per-Environment Configuration

```typescript
export const createQueryClient = () => {
    const isDev = import.meta.env.DEV;
    
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: isDev ? 0 : 5 * 60 * 1000,
                retry: isDev ? 1 : 3,
                gcTime: isDev ? 2 * 60 * 1000 : 10 * 60 * 1000,
            }
        }
    });
};
```

## Summary

Global context providers establish the foundational services and context available to your entire application. Use AppProviders as the root wrapper with React Query's QueryClientProvider for data fetching capabilities. Keep QueryClient configuration centralized, conditionally render development tools based on environment, and stack multiple providers correctly to ensure all child components have access to necessary contexts. The provider pattern is fundamental to application architecture and enables feature-rich functionality throughout your app.

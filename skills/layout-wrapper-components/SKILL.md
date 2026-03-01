---
name: layout-wrapper-components
description: 'Complete guide for building layout wrapper components in src/layout/. Learn creating PrivateLayout for authenticated routes with authentication checks, authorization guards, and nested navigation. Learn PublicLayout for public/guest routes with minimal structure. Covers component composition, Outlet integration with React Router, authentication state handling, sidebar conditional rendering, and page structure organization.'
---

# Layout Wrapper Components

A comprehensive guide for creating and organizing layout wrapper components in `src/layout/`. Layout wrapper components define the high-level structural scaffolding for pages, handling authentication, navigation, sidebar visibility, and responsive layouts for authenticated and public routes.

## When to Use This Skill

- Creating a new layout structure for application pages
- Building authentication-protected layout wrappers
- Creating public/guest-facing layouts with minimal structure
- Implementing conditional sidebar or navigation visibility
- Handling authentication state at the layout level
- Organizing routes with different layout requirements
- Building responsive layout systems with shared header/sidebar
- Redirecting unauthenticated users from protected routes

## Prerequisites

- Understanding of React Router v6+ (Outlet, Navigate)
- Familiarity with React hooks (`useMemo`, `useEffect`)
- Knowledge of authentication token storage and retrieval
- Understanding of utility functions (crypto, storage operations)
- Basic Tailwind CSS for layout styling
- Understanding of the application's authentication flow

## File Organization

```
src/layout/
├── PrivateLayout.tsx       # Authenticated routes with auth checks
├── PublicLayout.tsx        # Public routes with minimal layout
└── index.ts                # (Optional) Barrel export for imports
```

## Core Patterns

### Pattern 1: PrivateLayout - Protected Routes with Auth Checks

The PrivateLayout enforces authentication requirements, validates tokens, and provides the full application experience with sidebar and navigation:

```typescript
import React, { useMemo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { decryptLS } from '../lib/utils/Crypto';
import { storeLastUrl } from '../lib/utils/StoreUrl';
import Sidebar from '../features/layouts/sidebar/Sidebar';

const PrivateLayout: React.FC = () => {
    const location = useLocation();
    storeLastUrl();

    // Retrieve and decrypt authentication tokens
    const { menu, token, tokenEncrypted } = useMemo(() => {
        const menuEncrypted = localStorage.getItem('smsf-mn');
        const tokenKey = import.meta.env.VITE_APP_TOKEN_TYPE;
        const tokenEncrypted = tokenKey ? localStorage.getItem(tokenKey) : null;
        const token = tokenEncrypted ? decryptLS(tokenEncrypted) : '';
        return { menu: menuEncrypted, token, tokenEncrypted };
    }, []);

    // Guard 1: Check for menu/permissions
    if (!menu) {
        if (tokenEncrypted) {
            // Token exists but no menu - redirect to landingpage
            return <Navigate to="/landingpage" replace />;
        }
        // No token and no menu - clear storage and redirect to signin
        localStorage.clear();
        const signinUrl = `${import.meta.env.VITE_INTOOLS_V2}/signin?session-expired`;
        window.location.replace(signinUrl);
    }

    // Guard 2: Check for valid token
    if (!token) {
        localStorage.clear();
        const signinUrl = `${import.meta.env.VITE_INTOOLS_V2}/signin?session-expired`;
        window.location.replace(signinUrl);
    }

    // Render layout with optional sidebar and page content
    return (
        <div className="flex flex-col font-roboto">
            <div className="flex h-[calc(100vh)]">
                {location.pathname !== '/landingpage' && <Sidebar />}
                <main className="flex-1 overflow-auto h-screen bg-white">
                    <div className="relative h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PrivateLayout;
```

**Key features:**
- Validates user authentication tokens before rendering
- Checks for menu/permissions from encrypted storage
- Redirects to signin on token/menu absence
- Conditionally renders sidebar based on route
- Uses `Outlet` for nested route rendering
- Stores last visited URL for navigation tracking
- Handles session expiration gracefully

### Pattern 2: PublicLayout - Guest Routes with Minimal Structure

The PublicLayout provides a simpler structure for public pages without authentication requirements:

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom'
import Sidebar from '../features/layouts/sidebar/Sidebar';

const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col font-roboto">
            <div className="flex h-[calc(100vh)]">
                <Sidebar />
                <main className="flex-1 overflow-auto h-screen bg-white">
                    <div className="relative h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PublicLayout
```

**Key features:**
- No authentication checks required
- Simpler component structure
- Still includes sidebar for navigation
- Uses `Outlet` for nested route rendering
- Minimal state management needed
- Fast rendering without auth validation

### Pattern 3: Route Configuration with Layouts

Layouts are configured at the route group level in React Router v6:

```typescript
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import PrivateLayout from "../layout/PrivateLayout";
import Home from "../pages/Home";
import Contacts from "../pages/contacts/Contacts";

export const router = createBrowserRouter([
    // Public routes
    {
        element: <PublicLayout />,
        children: [
            { path: "/submitted-loan", element: <SubmittedLoad /> },
            { path: "/report", element: <Report /> },
            { path: "/address", element: <AddAddress /> },
        ]
    },
    // Private/authenticated routes
    {
        element: <PrivateLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/contacts", element: <Contacts state={'bm'} /> },
            { path: "/contacts/detail", element: <DetailContact /> },
        ]
    }
],
    {
        basename: "/crm"
    }
);
```

**Structure:**
- Top-level `element` is the layout component
- `children` array contains nested routes
- Each route renders inside the layout's `<Outlet />`
- Different layouts for different route groups
- `basename` for application mounting path

## Step-by-Step Workflows

### Workflow 1: Create a PrivateLayout with Authentication

1. **Import required dependencies**:
   ```typescript
   import React, { useMemo } from 'react';
   import { Outlet, Navigate, useLocation } from 'react-router-dom';
   import { decryptLS } from '../lib/utils/Crypto';
   import { storeLastUrl } from '../lib/utils/StoreUrl';
   import Sidebar from '../features/layouts/sidebar/Sidebar';
   ```

2. **Create component and get Auth state**:
   ```typescript
   const PrivateLayout: React.FC = () => {
       const location = useLocation();
       storeLastUrl();
       
       const { menu, token, tokenEncrypted } = useMemo(() => {
           // Retrieve from localStorage
       }, []);
   ```

3. **Implement authentication guards** (check menu, token)
4. **Clear storage and redirect on missing auth**
5. **Conditionally render sidebar** based on route
6. **Use Outlet for nested routes**
7. **Export component** for router configuration

### Workflow 2: Create a PublicLayout without Auth

1. **Import React Router and Sidebar**:
   ```typescript
   import React from 'react';
   import { Outlet } from 'react-router-dom'
   import Sidebar from '../features/layouts/sidebar/Sidebar';
   ```

2. **Create simple functional component**:
   ```typescript
   const PublicLayout: React.FC = () => {
   ```

3. **Return layout with Outlet**:
   ```typescript
   return (
       <div className="flex flex-col font-roboto">
           <div className="flex h-[calc(100vh)]">
               <Sidebar />
               <main className="flex-1 overflow-auto h-screen bg-white">
                   <Outlet />
               </main>
           </div>
       </div>
   )
   ```

4. **Export and use in router configuration**

### Workflow 3: Configure Routes with Layouts

1. **Define public routes with PublicLayout**:
   ```typescript
   {
       element: <PublicLayout />,
       children: [
           { path: "/page1", element: <Page1 /> },
           { path: "/page2", element: <Page2 /> },
       ]
   }
   ```

2. **Define private routes with PrivateLayout**:
   ```typescript
   {
       element: <PrivateLayout />,
       children: [
           { path: "/dashboard", element: <Dashboard /> },
           { path: "/settings", element: <Settings /> },
       ]
   }
   ```

3. **Create and export router** with `createBrowserRouter`
4. **Set basename** if application is mounted at subpath
5. **Use in main App component**

### Workflow 4: Extend Layout with Additional Features

1. **Add header component** for page titles:
   ```typescript
   <div className="flex h-[calc(100vh)]">
       <Sidebar />
       <div className="flex-1 flex flex-col">
           <Header />
           <main className="flex-1 overflow-auto">
               <Outlet />
           </main>
       </div>
   </div>
   ```

2. **Add breadcrumbs** for navigation context
3. **Add global alerts/notifications** (Snackbar, Toast)
4. **Add loading states** while checking auth
5. **Add error boundaries** for crash handling

## Real-World Examples

### Example 1: PrivateLayout with Full Auth Check

```typescript
import React, { useMemo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { decryptLS } from '../lib/utils/Crypto';
import { storeLastUrl } from '../lib/utils/StoreUrl';
import Sidebar from '../features/layouts/sidebar/Sidebar';

const PrivateLayout: React.FC = () => {
    const location = useLocation();
    storeLastUrl();

    // Retrieve encrypted tokens from localStorage
    const { menu, token, tokenEncrypted } = useMemo(() => {
        const menuEncrypted = localStorage.getItem('smsf-mn');
        const tokenKey = import.meta.env.VITE_APP_TOKEN_TYPE;
        const tokenEncrypted = tokenKey ? localStorage.getItem(tokenKey) : null;
        const token = tokenEncrypted ? decryptLS(tokenEncrypted) : '';
        return { menu: menuEncrypted, token, tokenEncrypted };
    }, []);

    // No menu but has token - send to landing page
    if (!menu) {
        if (tokenEncrypted) {
            return <Navigate to="/landingpage" replace />;
        }
        // Clear session and redirect to signin
        localStorage.clear();
        window.location.replace(`${import.meta.env.VITE_INTOOLS_V2}/signin?session-expired`);
    }

    // No token - session expired
    if (!token) {
        localStorage.clear();
        window.location.replace(`${import.meta.env.VITE_INTOOLS_V2}/signin?session-expired`);
    }

    return (
        <div className="flex flex-col font-roboto">
            <div className="flex h-[calc(100vh)]">
                {location.pathname !== '/landingpage' && <Sidebar />}
                <main className="flex-1 overflow-auto h-screen bg-white">
                    <div className="relative h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PrivateLayout;
```

### Example 2: PublicLayout with Sidebar

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom'
import Sidebar from '../features/layouts/sidebar/Sidebar';

const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col font-roboto">
            <div className="flex h-[calc(100vh)]">
                <Sidebar />
                <main className="flex-1 overflow-auto h-screen bg-white">
                    <div className="relative h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PublicLayout
```

### Example 3: Route Configuration with Both Layouts

```typescript
import { createBrowserRouter } from "react-router-dom";
import Contacts from "../pages/contacts/Contacts";
import PublicLayout from "../layout/PublicLayout";
import Home from "../pages/Home";
import SubmittedLoad from "../pages/SubmittedLoad";
import Report from "../pages/Report";
import DetailContact from "../pages/contacts/detail/DetailContact";
import AddAddress from "../pages/AddAddress";
import PrivateLayout from "../layout/PrivateLayout";

export const router = createBrowserRouter([
    // Public layout group
    {
        element: <PublicLayout />,
        children: [
            { path: "/submitted-loan", element: <SubmittedLoad /> },
            { path: "/report", element: <Report /> },
            { path: "/address", element: <AddAddress /> },
        ]
    },
    // Private layout group
    {
        element: <PrivateLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/contacts", element: <Contacts state={'bm'} /> },
            { path: "/contacts/tele", element: <Contacts state={'tele'} /> },
            { path: "/contacts/detail", element: <DetailContact /> },
        ]
    }
],
    {
        basename: "/crm"
    }
);
```

### Example 4: Extended Layout with Header

```typescript
import React, { useMemo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { decryptLS } from '../lib/utils/Crypto';
import Header from '../features/layouts/header/Header';
import Sidebar from '../features/layouts/sidebar/Sidebar';

const ExtendedPrivateLayout: React.FC = () => {
    const location = useLocation();
    const { token } = useMemo(() => {
        // Auth check logic...
    }, []);

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return (
        <div className="flex flex-col h-screen font-roboto">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ExtendedPrivateLayout;
```

## Component Integration

### Using Layout with Router

```typescript
// src/main.tsx or App.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
```

### Page Component Inside Layout

```typescript
// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <button 
                onClick={() => navigate('/contacts')}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Go to Contacts
            </button>
        </div>
    );
};

export default Home;
```

### Protected Route with Auth Check

```typescript
// Example: Redirect to signin if accessing private route
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { token } = useAuthStore();
    return token ? element : <Navigate to="/signin" replace />;
};
```

## Layout Structure Best Practices

### ✅ Do's

- **Use `<Outlet />`** - Required for nested route rendering
- **Keep layouts simple** - Focus on structure, not page logic
- **Apply full-height container** - Use `h-[calc(100vh)]` for viewport-height layouts
- **Separate auth checks** - Do all validation at layout level
- **Use memoization** - Cache auth state retrieval with `useMemo`
- **Conditional sidebar** - Show/hide based on route or auth state
- **Store last URL** - Track user navigation for better UX
- **Clear storage on logout** - Prevent stale auth state
- **Use `<Navigate />`** - For client-side redirects in React Router v6+

### ❌ Don'ts

- **Don't hardcode routes** - Use router configuration for flexibility
- **Don't fetch data in layout** - Page components handle data fetching
- **Don't duplicate layout logic** - Create shared layout components
- **Don't ignore loading states** - Show spinner while validating auth
- **Don't mix layouts** - Keep public and private separate
- **Don't store sensitive data unencrypted** - Always encrypt tokens
- **Don't use `window.location`** - Use Router `<Navigate>` when possible
- **Don't block render unnecessarily** - Validate auth early and quickly

## Common Patterns

### Pattern: Conditional Sidebar

```typescript
{location.pathname !== '/landingpage' && <Sidebar />}
```

Hide sidebar for specific routes while keeping others visible.

### Pattern: Full-Height Flexbox

```typescript
<div className="flex h-[calc(100vh)]">
    <Sidebar />
    <main className="flex-1 overflow-auto">
        <Outlet />
    </main>
</div>
```

Creates responsive layout with flexible main content area.

### Pattern: Auth Token Memoization

```typescript
const { menu, token, tokenEncrypted } = useMemo(() => {
    // Expensive operations (localStorage reads, decryption)
}, []);
```

Prevents repeated auth checks on every render.

### Pattern: URL Tracking

```typescript
storeLastUrl();
```

Stores current URL before rendering for redirect after login.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page on private routes | Check localStorage token - ensure it's encrypted and valid |
| Sidebar not showing | Verify Sidebar component import path and conditional rendering logic |
| Route keeps redirecting to signin | Check token decryption - may be failing silently |
| Outlet not rendering child routes | Ensure router configuration has children array for layout group |
| Auth guards not working | Verify useMemo dependencies and token validation logic |
| Layout flashing | Use loading state to prevent render before auth check complete |
| Session expires silently | Add token refresh logic or check token expiry time |
| Browser back button issues | Ensure `storeLastUrl()` is called and history state managed |

## References and File Locations

### Example Files to Review

- [PrivateLayout.tsx](../../../src/layout/PrivateLayout.tsx) - Authenticated route layout with token validation
- [PublicLayout.tsx](../../../src/layout/PublicLayout.tsx) - Public route layout without auth checks

### Integration Points

- **Router**: [src/routes/index.tsx](../../../src/routes/index.tsx) - Layout configuration with routes
- **Authentication**: `src/stores/useAuthStore.ts` - Auth state management
- **Utilities**: `src/lib/utils/Crypto.ts` - Token encryption/decryption
- **Sidebar**: `src/features/layouts/sidebar/Sidebar.tsx` - Navigation component
- **Pages**: `src/pages/` - Display inside `<Outlet />`

## Advanced Extensions

### Add Header Component

```typescript
<div className="flex flex-col h-screen">
    <Header />
    <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
            <Outlet />
        </main>
    </div>
</div>
```

### Add Loading State

```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    validateAuth().finally(() => setIsLoading(false));
}, []);

if (isLoading) return <LoadingSpinner />;
```

### Add Error Boundary

```typescript
<ErrorBoundary>
    <PrivateLayout />
</ErrorBoundary>
```

### Add Global Alert/Snackbar

```typescript
const { snackbar } = useSnackbarStore();

return (
    <>
        <PrivateLayout />
        {snackbar && <Snackbar {...snackbar} />}
    </>
);
```

## Summary

Layout wrapper components provide the structural foundation for your application's routing system. Use `PrivateLayout` for authenticated routes with auth validation, and `PublicLayout` for guest routes without authentication requirements. Keep layouts focused on structure, let `<Outlet />` handle nested route rendering, and handle all authentication checks at the layout level for centralized security.

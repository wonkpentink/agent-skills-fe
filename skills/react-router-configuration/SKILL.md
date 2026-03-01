---
name: react-router-configuration
description: 'Complete guide for configuring application routes with React Router in src/routes/. Use when defining routes, creating route hierarchies, setting up layout-based routing with nested routes, managing authentication-aware routes, and configuring route parameters and navigation paths. Learn route setup patterns, layout composition with route elements, basename configuration, and real-world examples from the codebase.'
---

# React Router Configuration

Master application routing with React Router. Define application URLs, route hierarchy, layout composition, and navigation structure.

## When to Use This Skill

- Setting up application routes for the first time
- Adding new routes to an existing router configuration
- Creating nested route hierarchies with different layouts
- Implementing authentication-based route protection
- Configuring route parameters and dynamic URLs
- Setting up basename for subdirectory deployments
- Organizing routes by feature or page section

## Prerequisites

- React Router v6+ installed (`react-router-dom`)
- Understanding of layout components (PrivateLayout, PublicLayout)
- Page components ready to be routed
- Knowledge of authentication/authorization flow if implementing protected routes

## Step-by-Step Workflows

### Workflow 1: Set Up Basic Router Configuration

**Goal**: Create a router with layout-based route hierarchy and basename configuration.

#### Step 1: Import Dependencies

```typescript
import { createBrowserRouter } from "react-router-dom";
import PrivateLayout from "../layout/PrivateLayout";
import PublicLayout from "../layout/PublicLayout";
import Home from "../pages/Home";
import Report from "../pages/Report";
```

Import `createBrowserRouter` to define browser-based routing with proper history management.

#### Step 2: Define Route Hierarchy with Layout Wrappers

```typescript
export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            { path: "/submitted-loan", element: <SubmittedLoad /> },
            { path: "/report", element: <Report /> },
            { path: "/address", element: <AddAddress /> },
        ]
    },
    {
        element: <PrivateLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/contacts", element: <Contacts state={'bm'} /> },
            { path: "/contacts/tele", element: <Contacts state={'tele'} /> },
        ]
    }
],
    {
        basename: "/crm"
    }
);
```

**Key patterns**:
- Group routes by layout type (PublicLayout, PrivateLayout)
- Use `children` array for nested routes under layout
- Set `basename: "/crm"` for subdirectory deployment
- Paths are relative to their parent route element

#### Step 3: Export Router for App Integration

```typescript
export const router = createBrowserRouter([...], { basename: "/crm" });
```

Export the router as a named export so it can be imported in `main.tsx` or `App.tsx`.

---

### Workflow 2: Add New Routes to Existing Router

**Goal**: Add additional routes while maintaining existing hierarchy.

#### Step 1: Import New Page Component

```typescript
import ContactAnalytics from "../pages/contacts/ContactAnalytics";
```

#### Step 2: Add Route to Appropriate Layout Group

```typescript
{
    element: <PrivateLayout />,
    children: [
        { path: "/", element: <Home /> },
        { path: "/contacts", element: <Contacts state={'bm'} /> },
        { path: "/contacts/tele", element: <Contacts state={'tele'} /> },
        { path: "/contacts/analytics", element: <ContactAnalytics /> },  // NEW ROUTE
    ]
}
```

#### Step 3: Verify Path Uniqueness

Ensure new paths don't conflict with existing routes. Check parent and sibling routes for overlapping patterns.

---

### Workflow 3: Create Nested Feature Routes

**Goal**: Organize routes with deeper nesting for feature-specific pages.

#### Example: Detail Routes Under Contacts

```typescript
{
    element: <PrivateLayout />,
    children: [
        { path: "/", element: <Home /> },
        { 
            path: "/contacts",
            children: [
                { path: "/", element: <Contacts state={'bm'} /> },
                { path: "/tele", element: <Contacts state={'tele'} /> },
                { path: "/detail", element: <DetailContact /> },
            ]
        },
    ]
}
```

Or maintain flat structure with full paths:

```typescript
{ path: "/contacts", element: <Contacts state={'bm'} /> },
{ path: "/contacts/tele", element: <Contacts state={'tele'} /> },
{ path: "/contacts/detail", element: <DetailContact /> },
```

**Note**: Current codebase uses flat path structure for simplicity.

---

### Workflow 4: Use Route Parameters for Dynamic Routes

**Goal**: Create routes that accept URL parameters for detail pages.

#### Example: Contact Detail with ID Parameter

```typescript
import { useParams } from "react-router-dom";

// In router configuration:
{ path: "/contacts/detail/:id", element: <DetailContact /> },

// In DetailContact component:
function DetailContact() {
    const { id } = useParams<{ id: string }>();
    // Use id to fetch and display contact details
}
```

#### Route Parameter Patterns

- `:id` - Single parameter
- `:category/:id` - Multiple parameters
- `:id?` - Optional parameter
- `*` - Catch-all route

---

### Workflow 5: Configure Basename for Subdirectory Deployment

**Goal**: Deploy application in a subdirectory (e.g., `/crm` instead of root).

```typescript
export const router = createBrowserRouter([
    // ... routes array
],
    {
        basename: "/crm"  // Application deployed at example.com/crm
    }
);
```

**When to use**:
- Application serves from subdirectory
- Multiple apps on same domain
- Reverse proxy or subpath routing

**Impact**:
- All routes are prefixed with basename
- Navigation links must account for basename
- History API works relative to basename

---

## Route Configuration Patterns

### Pattern 1: Layout-Based Hierarchy (Current Implementation)

```typescript
const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            { path: "/login", element: <Login /> },
            { path: "/signup", element: <Signup /> },
        ]
    },
    {
        element: <PrivateLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/dashboard", element: <Dashboard /> },
        ]
    }
]);
```

**Advantages**:
- Clear separation of authenticated/unauthenticated routes
- Each layout applied once to its child routes
- Easy to add authorization checks in layout component

**Disadvantages**:
- Limited to two layout groups (add more if needed)
- Nested route definitions can get complex

### Pattern 2: Nested Child Routes

```typescript
{
    path: "/contacts",
    element: <ContactsLayout />,
    children: [
        { path: "", element: <ContactsList /> },
        { path: ":id", element: <ContactDetail /> },
        { path: ":id/edit", element: <ContactEdit /> },
    ]
}
```

### Pattern 3: Error Boundaries with Routes

```typescript
{
    element: <PrivateLayout />,
    errorElement: <ErrorPage />,  // Fallback for errors
    children: [
        { path: "/", element: <Home /> },
    ]
}
```

---

## Integration with Application

### In main.tsx or App.tsx

```typescript
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

function App() {
    return <RouterProvider router={router} />;
}

export default App;
```

### Route Integration Checklist

- [ ] Router defined in `src/routes/index.tsx`
- [ ] All page components imported and referenced
- [ ] Layout components (PrivateLayout, PublicLayout) exist
- [ ] Basename configured if using subdirectory
- [ ] Router exported and imported in app initialization
- [ ] RouterProvider wraps application

---

## Best Practices

### Organization

- Keep routes file focused: only route definitions and imports
- Group related routes by feature or layout
- Use descriptive path names matching feature names
- Maintain consistent path conventions (lowercase, hyphens)

### Path Naming

- Use consistent separators: `/feature/subfeature`
- Root path: `/` (avoid empty string)
- Feature routes: `/features`, `/contacts`, `/employees`
- Detail routes: `/contacts/detail`, `/contacts/:id`
- Action routes: `/contacts/create`, `/contacts/:id/edit`

### Layout Composition

- PrivateLayout for authenticated routes (with guards)
- PublicLayout for public/guest routes
- Use `<Outlet />` in layouts to render child route elements
- Check authentication in layout component, not individual routes

### Performance

- Lazy load page components for large applications
- Use `React.lazy()` and `Suspense` for code splitting
- Load critical routes first, defer secondary features

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Route not displaying | Path mismatch or component not imported | Verify path matches URL and component is imported |
| Layout not wrapping route | Missing layout element in route parent | Ensure layout defined as `element` in parent route |
| Basename not working | App not deployed in subdirectory | Check deployment configuration matches `basename` |
| Parameter not available | Wrong parameter name in route | Verify parameter name in route path matches `useParams()` |
| Navigation not updating | Router not provided to app | Ensure `RouterProvider` wraps app with `router` prop |

---

## Real-World Examples from Codebase

### Current Implementation: src/routes/index.tsx

```typescript
export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            { path: "/submitted-loan", element: <SubmittedLoad /> },
            { path: "/report", element: <Report /> },
            { path: "/address", element: <AddAddress /> },
        ]
    },
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

**Key features**:
- Two layout groups for public and private routes
- Root route at `/` in PrivateLayout
- Feature routes with consistent naming (`/contacts/*`)
- Layout state props (e.g., `state={'bm'}`) for configuration
- Subdirectory deployment with `basename: "/crm"`

---

## Related Skills

- **Custom React Hooks**: Use `useParams()`, `useNavigate()` in route components
- **Layout Wrapper Components**: Build PrivateLayout and PublicLayout to wrap route children
- **Full Page Screen Components**: Create page components rendered by routes

---

## Validation Checklist

- [ ] All routes defined in `src/routes/index.tsx`
- [ ] Page components exist at import paths
- [ ] Layout components properly wrap child routes
- [ ] Basename configured for deployment location
- [ ] Router exported and integrated in app
- [ ] No console errors on route navigation
- [ ] All pages accessible via navigation

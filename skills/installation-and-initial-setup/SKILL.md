---
name: installation-and-initial-setup
description: 'Complete guide for Frontend App project initialization from scratch. Use when setting up a new development environment, installing dependencies, creating project structure, configuring TypeScript/Vite, setting up environment variables, initializing layouts and routes, and verifying the development server. Includes npm setup, folder structure creation, configuration files, and environment setup for development, staging, and production.'
---

# Installation & Initial Setup (From Empty Folder)

Complete step-by-step guide for initializing the Frontend App project from an empty folder. This skill covers everything needed to set up a fully functional React + TypeScript + Vite development environment.

## When to Use This Skill

- Setting up a new Frontend App project from scratch
- Initializing project dependencies and build tools
- Creating the complete folder structure
- Configuring TypeScript, Vite, and ESLint
- Setting up environment variables for different environments (dev, staging, production)
- Verifying the development server works correctly
- Onboarding a new developer to the project

## Prerequisites

Before starting, ensure you have:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v18+ (recommended v20+) | JavaScript runtime |
| **npm** | v9+ | Package manager |
| **Git** | Latest | Version control |
| **Code Editor** | VS Code or similar | Development environment |
| **Terminal/Power** | Built-in OS | Command execution |

### Verify Prerequisites Are Installed

```bash
# Check Node.js version
node --version
# Expected output: v20.x.x or higher

# Check npm version
npm --version
# Expected output: v9.x.x or higher

# Check Git version
git --version
# Expected output: git version 2.x.x or higher
```

### Recommended VS Code Extensions

Install these extensions for better development experience:
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- ESLint (dbaeumer.vscode-eslint)
- TypeScript Vue Plugin (johnsoncodehk.volar)

## Step-by-Step Workflow

### Step 1: Initialize npm Project

```bash
# Initialize npm (creates package.json)
npm init -y
```

**Result**: A `package.json` file is created with default settings.

### Step 2: Install All Dependencies

Install all required dependencies in one command or split them into logical groups:

#### Install Production Dependencies

```bash
npm install react@19.2.1 react-dom@19.2.1 react-router-dom@7.5.2 \
  zustand@5.0.3 axios@1.13.0 react-hook-form@7.54.2 \
  @hookform/resolvers@5.0.1 yup@1.6.1 @tanstack/react-query@5.66.0 \
  @tanstack/react-query-devtools@5.66.0 react-select@5.10.1 \
  moment@2.30.1 date-fns@4.1.0 react-day-picker@9.8.0 \
  @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0 crypto-js@4.2.0 \
  jose@6.0.10 js-cookie@3.0.5 @fontsource/roboto
```

#### Install TypeScript & Build Tools

```bash
npm install --save-dev typescript@~5.7.2 vite@6.3.6 \
  @vitejs/plugin-react-swc@3 @tailwindcss/vite@4.1.0 \
  tailwindcss@4.1.17 postcss autoprefixer
```

#### Install Development & Linter Tools

```bash
npm install --save-dev eslint@9.22.0 eslint-plugin-react \
  eslint-plugin-react-hooks @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser prettier @types/node @types/react \ 
  @types/react-dom
```

**Note**: Installation typically takes 3-10 minutes. You'll see a `node_modules/` folder created with all packages.

### Step 3: Create Folder Structure

Create all required directories:

```bash
# Create main folders
mkdir -p src/{components,features,pages,hooks,stores,lib,types,layout,providers,routes,assets}
mkdir -p public/assets/{icons,images}
mkdir -p docs

# Create lib sub-folders
mkdir -p src/lib/{api/contacts,utils,validation,options}
```

**Expected folder structure**:

```
├── src/
│   ├── components/
│   ├── features/
│   ├── pages/
│   ├── hooks/
│   ├── stores/
│   ├── lib/
│   │   ├── api/
│   │   │   └── contacts/
│   │   ├── utils/
│   │   ├── validation/
│   │   └── options/
│   ├── types/
│   ├── layout/
│   ├── providers/
│   ├── routes/
│   └── assets/
├── public/
│   └── assets/
│       ├── icons/
│       └── images/
└── docs/
```

### Folder & File Explanations

**`src/` - Main source code directory**
- Contains all application source code
- Entry point for TypeScript compiler and module bundler

**`src/components/` - Reusable UI Components**
- Presentational components with minimal business logic
- Used across multiple features and pages
- Examples: Button, Modal, InputField, Avatar, Tabs, Table
- Should be: generic, reusable, focused on UI presentation

**`src/features/` - Feature-Specific Business Logic**
- Domain-focused modules for specific application features
- Contains logic that's not reusable across the app
- Organized by feature (contacts, assignments, filters, etc.)
- Examples: AddAddressForm, BranchHandling, LeadChangeForm, DragHandle

**`src/pages/` - Full Page/Screen Components**
- Complete views rendered by React Router
- Combine multiple components and features
- Each file typically represents one route
- Examples: Home, ContactDetail, Dashboard, AddAddress, Report

**`src/hooks/` - Custom React Hooks**
- Reusable logic extracted into hooks
- Organized by domain (custom, customer, employee, idm, mdm, partner)
- Examples: useDebounce, useCustomer, useEmployee, useAuth
- Share stateful logic without code duplication

**`src/stores/` - Global State Management (Zustand)**
- Centralized application state using Zustand library
- Each file is one store managing related state
- Examples: useAuthStore, useContactStore, useUIStore, usePaginationStore
- Supports persistent state with middleware

**`src/lib/` - Utility Library & Services**
- Collection of reusable utilities, helpers, and services
- Organized into sub-folders by function

  **`src/lib/api/` - API Client & Services**
  - Axios instance setup and configuration
  - Service functions that communicate with backend
  - Organized by domain (contacts, customers, employees, etc.)
  - Example: `contactServices.ts` with functions like fetchContacts(), updateContact()

  **`src/lib/utils/` - General Utility Functions**
  - Helper functions reused across entire app
  - Examples: Crypto (encryption/decryption), dateUtils, stringUtils
  - No component or feature-specific logic

  **`src/lib/validation/` - Form Validation Schemas**
  - Yup validation schemas for form data
  - Examples: contactSchema, addressSchema, assignContactSchema
  - Used with react-hook-form for form validation

  **`src/lib/options/` - Constants & Static Data**
  - Application-wide constants and dropdown options
  - Enums for status, types, and other fixed values
  - Configuration constants used in multiple places

**`src/types/` - TypeScript Type Definitions**
- Data models and interfaces for type safety
- Examples: Contact, Address, User, Lead, ColumnType
- Ensures consistent types across the entire application
- Mapped to API response structures

**`src/layout/` - Layout Wrapper Components**
- High-level layout structure for pages
- **PrivateLayout**: For authenticated routes (includes sidebar, header, navigation)
- **PublicLayout**: For public routes (minimal layout, no auth checks)
- Contains shared structural elements

**`src/providers/` - Global Context Providers**
- AppProviders: Root provider wrapping entire app
- Sets up QueryClient for data fetching (React Query)
- Provides global context to all child components
- Initializes dev tools in non-production environments

**`src/routes/` - React Router Configuration**
- Defines all application routes and their hierarchy
- Maps URL paths to page components
- Contains route parameters and nested routes
- Example: `/app` base route with child routes for features

**`src/assets/` - Local Static Files**
- Project-specific images and icons
- Bundled by Vite during build process
- Optimized and included in final bundle
- Typically: Logos, illustrations, SVG icons used in components

**`public/` - Static Files (Not Bundled)**
- Files copied as-is to the output directory
- Not processed by bundler
- Served directly by the web server
- Examples: Favicon, robots.txt

  **`public/assets/` - Public Static Assets**
  - **icons/**: SVG or icon files (not optimized by bundler)
  - **images/**: Static images displayed directly without optimization
  - Use when assets should not be bundled or optimized

**`docs/` - Project Documentation**
- Setup and onboarding guides
- Component library documentation
- Architecture and design patterns
- Development workflow guidelines
- Examples: SETUP.md, COMPONENTS.md

### Step 4: Create Configuration Files

#### Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### Create `tsconfig.app.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

#### Create `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### Create `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/app',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
})
```

#### Create `eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
]
```

#### Create `.gitignore`

```
# Dependencies
node_modules
.pnp

# Build output
dist
dist-ssr
*.local

# IDE
.vscode
.idea
*.swp
*.swo
*~

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Testing
coverage
```

#### Update `package.json` Scripts

Add these scripts to your `package.json`:

```json
{
  "name": "frontend-app",
  "version": "1.0.0",
  "type": "module",
  "description": "Frontend App Application",
  "scripts": {
    "start-staging-app": "vite --host",
    "build-staging": "tsc && vite build",
    "build-dev": "tsc && vite build --mode development",
    "build-prod": "tsc && vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### Step 5: Create Root HTML & Entry Point Files

#### Create `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frontend App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### Create `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### Create `src/App.tsx`

```typescript
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import AppProviders from './providers/AppProviders'

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App
```

#### Create `src/index.css`

```css
@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### Create `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
```

#### Create `src/declaration.d.ts`

```typescript
declare module '*.svg' {
  import React from 'react'
  const SVG: React.VFC<React.SVGProps<SVGSVGElement> & { title?: string }>
  export default SVG
}
```

### Step 6: Setup Environment Variables

Create three environment files in the project root:

#### Create `.env.development`

```
VITE_APP_SERVER_NAME=staging
VITE_APP_TOKEN_TYPE=auth_token_dev
VITE_CRYPTO_KEY=your_aes_encryption_key_here
VITE_APP_PRIVATE_KEY=your_hmac_private_key_here
VITE_APP_PUBLIC_KEY=your_public_key_here
VITE_APP_BASE_ENV=dev
VITE_INTOOLS_V2=http://localhost:3001
VITE_APP_HOST_CUSTOMER=http://api.dev.local:8001
VITE_APP_HOST_IDM=http://api.dev.local:8002
VITE_APP_HOST_MDM=http://api.dev.local:8003
VITE_APP_HOST_EMPLOYEE=http://api.dev.local:8004
VITE_APP_HOST_ORIGINATION=http://api.dev.local:8005
VITE_APP_HOST_ACTIVITY=http://api.dev.local:8006
VITE_APP_HOST_TASK=http://api.dev.local:8007
VITE_APP_HOST_PARTNER=http://api.dev.local:8008
```

#### Create `.env.staging`

```
VITE_APP_SERVER_NAME=staging
VITE_APP_TOKEN_TYPE=auth_token_staging
VITE_CRYPTO_KEY=your_aes_encryption_key_here
VITE_APP_PRIVATE_KEY=your_hmac_private_key_here
VITE_APP_PUBLIC_KEY=your_public_key_here
VITE_APP_BASE_ENV=staging
VITE_INTOOLS_V2=https://intools-staging.example.com
VITE_APP_HOST_CUSTOMER=https://api-staging.example.com/customer
VITE_APP_HOST_IDM=https://api-staging.example.com/idm
VITE_APP_HOST_MDM=https://api-staging.example.com/mdm
VITE_APP_HOST_EMPLOYEE=https://api-staging.example.com/employee
VITE_APP_HOST_ORIGINATION=https://api-staging.example.com/origination
VITE_APP_HOST_ACTIVITY=https://api-staging.example.com/activity
VITE_APP_HOST_TASK=https://api-staging.example.com/task
VITE_APP_HOST_PARTNER=https://api-staging.example.com/partner
```

#### Create `.env.production`

```
VITE_APP_SERVER_NAME=production
VITE_APP_TOKEN_TYPE=auth_token_prod
VITE_CRYPTO_KEY=your_aes_encryption_key_here
VITE_APP_PRIVATE_KEY=your_hmac_private_key_here
VITE_APP_PUBLIC_KEY=your_public_key_here
VITE_APP_BASE_ENV=production
VITE_INTOOLS_V2=https://intools.example.com
VITE_APP_HOST_CUSTOMER=https://api.example.com/customer
VITE_APP_HOST_IDM=https://api.example.com/idm
VITE_APP_HOST_MDM=https://api.example.com/mdm
VITE_APP_HOST_EMPLOYEE=https://api.example.com/employee
VITE_APP_HOST_ORIGINATION=https://api.example.com/origination
VITE_APP_HOST_ACTIVITY=https://api.example.com/activity
VITE_APP_HOST_TASK=https://api.example.com/task
VITE_APP_HOST_PARTNER=https://api.example.com/partner
```

**⚠️ SECURITY WARNING**: Never commit .env files to version control. Protection is already configured in `.gitignore`.

### Step 7: Create Core Provider & Router Files

#### Create `src/providers/AppProviders.tsx`

```typescript
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()
const isProduction = import.meta.env.VITE_APP_SERVER_NAME === 'production'

interface AppProvidersProps {
  children: React.ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {!isProduction && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default AppProviders
```

#### Create `src/routes/index.tsx`

```typescript
import { createBrowserRouter } from 'react-router-dom'
import PrivateLayout from '../layout/PrivateLayout'
import Home from '../pages/Home'

export const router = createBrowserRouter(
  [
    {
      path: '/app',
      element: <PrivateLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
      ],
    },
  ],
  {
    basename: '/app',
  }
)
```

#### Create `src/layout/PrivateLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom'

function PrivateLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <h2>Sidebar Navigation</h2>
        <p>Add your navigation here</p>
      </aside>
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default PrivateLayout
```

#### Create `src/layout/PublicLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom'

function PublicLayout() {
  return (
    <main>
      <Outlet />
    </main>
  )
}

export default PublicLayout
```

#### Create `src/pages/Home.tsx`

```typescript
function Home() {
  return (
    <div>
      <h1>Welcome to Frontend App</h1>
      <p>Getting started with your development environment</p>
    </div>
  )
}

export default Home
```

### Step 8: Verify Installation

```bash
# Verify dependencies are installed
ls node_modules | grep -E "react|zustand|axios" | head -5

# Verify TypeScript compiler
npx tsc --version

# Verify Vite is available
npx vite --version
```

### Step 9: Start Development Server

```bash
npm run start-staging-app
```

**Expected output**:
```
  VITE v6.3.6  ready in 234 ms

  ➜  Local:   http://localhost:3000/app
  ➜  press h to show help
```

Open your browser to `http://localhost:3000/app` - you should see the Home page displaying the welcome message. ✅

## Troubleshooting

### Error: `npm install` hangs or times out

```bash
# Clear npm cache and retry
npm cache clean --force
npm install
```

### Error: Peer dependency conflicts

```bash
# Install with legacy peer dependency resolution
npm install --legacy-peer-deps
```

### Error: Module not found in TypeScript

- Ensure `tsconfig.json` has correct `include` and `exclude` paths
- Check file extensions match (`.tsx` for components, `.ts` for utilities)
- Restart the IDE's TypeScript server

### Error: Port 3000 already in use

```bash
# Change port in vite.config.ts
# server: { port: 3001 }
# Or kill process using port 3000
npx kill-port 3000
```

### Error: "Cannot find module 'react'" in build time

```bash
# Ensure all dependencies are installed
npm install

# Clear build cache
rm -rf dist
npm run build-staging
```

## Next Steps After Setup

1. **Install recommended VS Code extensions** for better development experience
2. **Create initial API services** using the structure in `src/lib/api/`
3. **Setup authentication** in `src/stores/useAuthStore.ts`
4. **Create first feature** following the pattern in `src/features/`
5. **Read the SETUP.md documentation** for deeper understanding of architecture

## Related Skills

All other skills depend on this foundational setup. Refer to other skills once project initialization is complete:

**Commonly Used Next Skills**
- [react-router-configuration](../react-router-configuration/SKILL.md) - Configure application routes
- [api-client-services](../api-client-services/SKILL.md) - Set up API clients and services
- [global-state-management-zustand](../global-state-management-zustand/SKILL.md) - Create global stores
- [reusable-ui-components](../reusable-ui-components/SKILL.md) - Build component library

## References

- [Node.js LTS Downloads](https://nodejs.org/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand State Management](https://github.com/pmndrs/zustand)

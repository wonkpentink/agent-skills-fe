---
name: full-page-screen-components
description: 'Complete guide for building full page/screen components in src/pages/. Use when creating complete views rendered by React Router that combine multiple components and features. Learn page structure, data fetching patterns, authentication integration, store management, modal handling, and routing. Includes step-by-step workflows, real-world page examples, and best practices for organizing complex page logic.'
---

# Full Page/Screen Components

Complete guide for building full page/screen components that represent complete application views rendered by React Router.

## When to Use This Skill

- Creating new pages/screens rendered by React Router routes
- Building pages that combine multiple components and features
- Implementing data fetching and loading states
- Managing complex page-level state (modals, filters, pagination)
- Adding authentication and authorization checks
- Integrating store management for page data
- Handling query parameters and route navigation
- Creating detail pages with tabs and sections
- Building list pages with filters and pagination

## Key Concepts

### Pages vs Features vs Components

| Aspect | Components | Features | Pages |
|--------|-----------|----------|-------|
| **Scope** | Single UI element | Specific domain logic | Complete view/route |
| **Composition** | Reusable standalone | Feature-specific | Combines features & components |
| **State** | Minimal (UI only) | Feature-specific | Page-wide (modals, filters, data) |
| **Data Fetching** | None | Optional | Extensive |
| **Routing** | Not routed | Not routed | **Rendered by router** |
| **Examples** | Button, Input, Modal | AddAddressForm, TagsHandle | Contacts, DetailContact, Home |

## Core Page Structure

### Folder Organization

```
src/pages/
├── Home.tsx                        # Dashboard/entry point page
├── Report.tsx                      # Report listing page
├── AddAddress.tsx                  # Add address form page
├── SubmittedLoad.tsx               # Submitted load listing page
└── contacts/                       # Domain-specific folder
    ├── Contacts.tsx                # Contacts list page
    └── detail/
        └── DetailContact.tsx       # Single contact detail page
```

### Basic Page Component Pattern

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCustomHook } from '@/hooks/domain/useCustomHook'
import Header from '@/features/header/Header'
import Table from '@/components/table/Table'
import Modal from '@/components/modal/Modal'

// 1. Define Page Props
interface PageProps {
  state?: string
  params?: Record<string, string>
}

// 2. Define Page Component
const MyPage: React.FC<PageProps> = ({ state, params }) => {
  // 3. Router setup
  const navigate = useNavigate()
  
  // 4. Store setup
  const authData = useAuthStore((state) => state.authData)
  
  // 5. Hook setup for data fetching
  const { data, isLoading } = useCustomHook()
  
  // 6. Local state for page-specific UI
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState({})
  
  // 7. Side effects for initialization
  useEffect(() => {
    // Authorization check
    if (!authData) {
      navigate('/login')
    }
  }, [authData, navigate])
  
  // 8. Page layout
  return (
    <div className="page-container">
      <Header title="My Page" />
      
      <div className="page-content">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Table data={data} onRowClick={(row) => {}} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              {/* Modal content */}
            </Modal>
          </>
        )}
      </div>
    </div>
  )
}

export default MyPage
```

## Workflow: Creating a Full Page

### Step 1: Plan Page Requirements

Before coding, define:

**Page Purpose & Route**
- What is the page's primary function?
- What URL route will it be accessed from?
- Is it a list page, detail page, form page, or dashboard?

**User Flows**
- What are the main user interactions?
- What modals/dialogs appear?
- What navigation happens from this page?

**Data Requirements**
- What data does the page display?
- What API calls are needed?
- Is pagination or filtering required?

**Authorization**
- Who can access this page?
- What permissions are needed?
- What should happen if unauthorized?

### Step 2: Create Page File

Create page file in appropriate folder:

```bash
# Simple root-level page
touch src/pages/PageName.tsx

# Domain-specific pages
mkdir -p src/pages/domain
touch src/pages/domain/DomainPage.tsx
touch src/pages/domain/detail/DetailPage.tsx
```

### Step 3: Type Authorization & Access

```typescript
// src/pages/Contacts.tsx

import { useAuthorize } from '@/hooks/idm/useAuthorize'
import { useAuthStore } from '@/stores/useAuthStore'

const Contacts = ({ state }: { state: string }) => {
  // Check authorization on mount
  const { mutate: authorize } = useAuthorize()
  const { setIsAuthLoading } = useAuthStore()
  
  useEffect(() => {
    // Perform auth check (example: module code 2 = contacts)
    authorize(2)
  }, [authorize])
  
  return (
    <div>
      {/* Page content */}
    </div>
  )
}

export default Contacts
```

### Step 4: Simple Page Example - Home/Landing

For simple pages that redirect based on permissions:

```typescript
// src/pages/Home.tsx

import { Navigate } from 'react-router-dom'
import { decryptLS } from '@/lib/utils/Crypto'

interface MenuData {
  app_code: string
  url: string
  sub_menu?: Array<{ url: string }>
}

// Component for no-access state
function IsNotValidAccess() {
  return (
    <div className="bg-white h-[90vh] grid place-items-center">
      <p className="text-center text-red-600 text-[20px] font-semibold">
        You don't have any access. Please contact{' '}
        <a
          href="mailto:it.helpdesk@example.com"
          className="underline text-blue-700 hover:text-blue-900"
        >
          IT Helpdesk
        </a>
      </p>
    </div>
  )
}

// Helper for hard redirects outside app
const hardRedirect = (url: string) => {
  window.location.replace(url)
  return null
}

function Home() {
  // 1. Check if user has menu data (indicating logged-in)
  const menuLS = localStorage.getItem('smsf-mn')
  if (!menuLS) {
    // No menu data = not logged in, redirect to error page
    return hardRedirect('/error/403')
  }

  // 2. Decrypt and parse menu data
  const menus: MenuData[] = JSON.parse(decryptLS(menuLS))
  
  // 3. Find CRM menus
  const crmMenu = menus.filter((menu) => menu.app_code === 'crm')
  
  if (crmMenu.length <= 0) {
    // No access to CRM
    return <IsNotValidAccess />
  }

  // 4. Check for sub-menus
  const firstMenu = crmMenu[0]?.sub_menu
  if (Array.isArray(firstMenu) && firstMenu.length > 0) {
    // Redirect to first sub-menu
    return <Navigate to={firstMenu[0].url} />
  } else if (crmMenu[0]?.url) {
    // Redirect to main menu URL
    return <Navigate to={crmMenu[0].url.replace(/^\/crm/, '')} />
  } else {
    // No valid menu found
    return <IsNotValidAccess />
  }
}

export default Home
```

### Step 5: Complex List Page - Contacts Page

For pages with data fetching, filtering, and pagination:

```typescript
// src/pages/contacts/Contacts.tsx

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

// Components
import Button from '@/components/button/Button'
import Table from '@/components/table/Table'
import Header from '@/features/header/Header'
import Filter from '@/features/filter/Filter'
import Pagination from '@/components/table/Pagination'

// Modals/Features
import AddContactForm from '@/features/contacts/addContact/AddContactForm'
import EditPhoneNumber from '@/features/contacts/contact/EditPhoneNumber'
import BulkUpload from '@/features/contacts/bulkUpload/BulkUpload'

// Hooks
import { useCustomerList } from '@/hooks/customer/useCustomerList'
import { useAuthorize } from '@/hooks/idm/useAuthorize'

// Stores
import { useDetailStore } from '@/stores/useDetailStore'
import { useFilterStore } from '@/stores/useFilterStore'
import { usePaginationStore } from '@/stores/usePaginationStore'
import { useAuthStore } from '@/stores/useAuthStore'

// Types
import { Column } from '@/types/ColumnType'

const CONTACTS_PAGINATION_KEY = 'contacts-pagination'

interface ContactsPageProps {
  state: string
}

const Contacts: React.FC<ContactsPageProps> = ({ state }) => {
  // 1. Router setup
  const navigate = useNavigate()

  // 2. Authorization check
  const { mutate: authorize } = useAuthorize()
  const { setIsAuthLoading } = useAuthStore()

  // 3. Store initialization
  const { setDetailCode } = useDetailStore()
  const { values: filterValues } = useFilterStore()
  const { pagination, setPagination } = usePaginationStore()

  // 4. Local modal state
  const [modalState, setModalState] = useState({
    isShowAddContact: false,
    isShowPhones: false,
    isShowBulkUpload: false,
    isShowDownloadContact: false,
  })

  // 5. Local detail state for editing
  const [phonesDetail, setPhonesDetail] = useState<any>()
  const [customerCode, setCustomerCode] = useState<any>()

  // 6. Authorization on mount
  useEffect(() => {
    authorize(2) // Module code for contacts
  }, [authorize])

  // 7. Build API params from filters
  const apiParams = useMemo(
    () => ({
      show_pagination: true,
      per_page: pagination.per_page,
      page: pagination.page,
      start_date: filterValues?.duration?.from
        ? moment(filterValues.duration.from).format('YYYY-MM-DD')
        : '',
      end_date: filterValues?.duration?.to
        ? moment(filterValues.duration.to).format('YYYY-MM-DD')
        : '',
      lead_statuses: filterValues?.lead_status?.join(','),
      tags: filterValues?.tags?.join(','),
      pic_codes: Array.isArray(filterValues.pic_handling)
        ? filterValues.pic_handling.map((item: any) => item.code).join(',')
        : undefined,
      branch_codes: Array.isArray(filterValues.branch)
        ? filterValues.branch.map((item: any) => item.code).join(',')
        : undefined,
    }),
    [pagination, filterValues]
  )

  // 8. Fetch customer list
  const {
    data: dataCustomerList,
    isLoading: isLoadingCustomerList,
  } = useCustomerList(apiParams)

  // 9. Define table columns
  const columns: Column[] = useMemo(
    () => [
      { key: 'customer_code', label: 'Code', width: '10%' },
      { key: 'customer_name', label: 'Name', width: '20%' },
      { key: 'email', label: 'Email', width: '20%' },
      { key: 'phone', label: 'Phone', width: '15%' },
      { key: 'lead_status', label: 'Lead Status', width: '15%' },
      { key: 'created_at', label: 'Created', width: '20%' },
    ],
    []
  )

  // 10. Handle row click
  const handleRowClick = useCallback(
    (row: any) => {
      setDetailCode(row.customer_code)
      navigate(`/contacts/${row.customer_code}`)
    },
    [navigate, setDetailCode]
  )

  // 11. Handle add contact success
  const handleAddContactSuccess = useCallback(() => {
    setModalState((prev) => ({ ...prev, isShowAddContact: false }))
    // Refetch list or add optimistically
  }, [])

  // 12. Render
  return (
    <div className="page-container h-screen flex flex-col">
      {/* Header */}
      <Header title="Contacts" />

      {/* Controls */}
      <div className="flex gap-3 px-6 py-4">
        <Button
          label="Add Contact"
          icon="+"
          onClick={() =>
            setModalState((prev) => ({
              ...prev,
              isShowAddContact: true,
            }))
          }
        />
        <Button
          label="Bulk Upload"
          onClick={() =>
            setModalState((prev) => ({ ...prev, isShowBulkUpload: true }))
          }
        />
      </div>

      {/* Filter */}
      <Filter />

      {/* Table with pagination */}
      <div className="flex-1 overflow-auto px-6">
        <Table
          columns={columns}
          data={dataCustomerList?.data?.list || []}
          isLoading={isLoadingCustomerList}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        pageSize={pagination.per_page}
        total={dataCustomerList?.data?.total || 0}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        onPageSizeChange={(perPage) =>
          setPagination({ ...pagination, per_page: perPage })
        }
      />

      {/* Modals */}
      {modalState.isShowAddContact && (
        <AddContactForm onSuccess={handleAddContactSuccess} />
      )}

      {modalState.isShowPhones && (
        <EditPhoneNumber
          customerCode={customerCode}
          data={phonesDetail}
          onClose={() => setModalState((prev) => ({ ...prev, isShowPhones: false }))}
        />
      )}

      {modalState.isShowBulkUpload && (
        <BulkUpload
          onClose={() =>
            setModalState((prev) => ({ ...prev, isShowBulkUpload: false }))
          }
        />
      )}
    </div>
  )
}

export default Contacts
```

### Step 6: Detail Page Example - Contact Detail

For pages showing detailed information about a single item:

```typescript
// src/pages/contacts/detail/DetailContact.tsx

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Tabs from '@/components/tabs/Tabs'
import ContactDetailsCard from '@/features/contacts/detail/information/ContactDetailsCard'
import ContactProfileCard from '@/features/contacts/detail/information/ContactProfileCard'
import ListLoanCard from '@/features/contacts/detail/additionalInformation/ListLoanCard'
import History from '@/features/contacts/detail/additionalInformation/History'
import ActivityLog from '@/features/contacts/detail/additionalInformation/ActivityList'

// Stores
import { useDetailStore } from '@/stores/useDetailStore'
import { useUIStore } from '@/stores/useUIStore'
import { useProductStore } from '@/stores/useProductStore'

// Hooks
import { useAuthorize } from '@/hooks/idm/useAuthorize'
import { useCustomerDetail } from '@/hooks/customer/useCustomerDetail'
import { useProductList } from '@/hooks/mdm/useProduct'

import type { TabItem } from '@/types/TabsType'

const DetailContact = () => {
  // 1. Get detail code from store (set from list page)
  const code = useDetailStore((state) => state.detailCode)
  const navigate = useNavigate()

  // 2. Authorization
  const { mutate: authorize } = useAuthorize()
  const hasRun = useRef(false)

  // 3. UI state management
  const { setIsSideBarShow } = useUIStore()
  const { setOption, setLoading } = useProductStore()

  // 4. Authorization on mount
  useEffect(() => {
    if (!hasRun.current) {
      authorize(2) // Module code for contacts
      hasRun.current = true
      setIsSideBarShow('minify') // Minimize sidebar on detail view
    }
  }, [authorize, setIsSideBarShow])

  // 5. Guard against missing code
  useEffect(() => {
    if (!code) {
      navigate('/contacts')
    }
  }, [code, navigate])

  // 6. Fetch detail data
  const {
    data: dataCustomer,
    isLoading: isLoadingDataCustomer,
  } = useCustomerDetail({
    show_pagination: false,
    code: code,
  })

  // 7. Fetch product options
  const {
    data: productOption,
    isLoading: isLoadingProductOption,
  } = useProductList({ code: 'prd' })

  // 8. Initialize product store
  useEffect(() => {
    setLoading(isLoadingProductOption)
    if (productOption?.data?.details) {
      setOption(productOption.data.details)
    }
  }, [productOption, setLoading, setOption])

  // 9. Define tab configuration
  const tabs: TabItem[] = [
    {
      key: 'information',
      label: 'Information',
      content: (
        <div className="space-y-4">
          <ContactProfileCard data={dataCustomer} />
          <ContactDetailsCard data={dataCustomer} />
        </div>
      ),
    },
    {
      key: 'loans',
      label: 'Loans',
      content: (
        <div>
          <ListLoanCard data={dataCustomer?.loan_applications} />
        </div>
      ),
    },
    {
      key: 'history',
      label: 'History',
      content: <History code={code} />,
    },
    {
      key: 'activity',
      label: 'Activity Log',
      content: <ActivityLog code={code} />,
    },
  ]

  // 10. Render
  return (
    <div className="detail-page h-full flex flex-col">
      {/* Back button */}
      <div className="px-6 py-4">
        <button
          onClick={() => navigate('/contacts')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Contacts
        </button>
      </div>

      {/* Tabs */}
      {isLoadingDataCustomer ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <Tabs items={tabs} />
      )}
    </div>
  )
}

export default DetailContact
```

### Step 7: Page-Level State Management

For complex pages, organize state management:

```typescript
// Page-level state organization
interface PageState {
  // Data state
  data: any[] | null
  isLoading: boolean
  error: Error | null

  // UI state
  isModalOpen: boolean
  selectedId: string | null
  filter: FilterParams
  pagination: PaginationParams

  // Detail state
  detailData: any | null
  isDetailLoading: boolean
}

// Using multiple stores instead of one large state
const ContactsPage = () => {
  // 1. Data store
  const { data, isLoading } = useCustomerList(params)

  // 2. UI store
  const { isModalOpen, setIsModalOpen } = useUIStore()

  // 3. Filter store
  const { values: filters, setValues: setFilters } = useFilterStore()

  // 4. Pagination store
  const { pagination, setPagination } = usePaginationStore()

  // 5. Detail store
  const { detailCode, setDetailCode } = useDetailStore()

  return (
    // Use composed stores
  )
}
```

## Best Practices

### ✅ DO

- **Check Authorization First** - Verify user access on mount
- **Load Required Data** - Fetch all page data eagerly
- **Manage Page State Clearly** - Organize modals, filters, pagination logically
- **Handle Loading States** - Show spinners/skeletons during data fetch
- **Guard Navigation** - Validate required params before rendering
- **Initialize Stores** - Set up page-specific store state on mount
- **Use useCallback** - Memoize handlers to prevent unnecessary re-renders
- **Document Props** - Document page props and their purposes
- **Handle Errors** - Show user-friendly error messages
- **Clean Up Effects** - Prevent memory leaks in useEffect cleanup

### ❌ AVOID

- **Hard-coding Routes** - Use route definitions from router config
- **Multiple useEffect Fetches** - Consolidate data fetching
- **Props Drilling** - Use stores for deeply nested data
- **Mixing Business Logic** - Keep features separate from page logic
- **Unhandled Errors** - Always catch and display errors
- **Bloated Components** - Extract sub-components or features
- **Storing Everything in State** - Use stores for persistent data
- **Missing Loading States** - Always show feedback during async
- **Ignoring Accessibility** - Add proper ARIA labels and semantic HTML
- **Tight Coupling** - Keep pages loosely coupled to features

## Common Page Patterns

### Pattern 1: Protected Page with Authorization

```typescript
const ProtectedPage = () => {
  const { mutate: authorize } = useAuthorize()
  const user = useAuthStore((s) => s.user)
  
  useEffect(() => {
    authorize(MODULE_CODE)
  }, [authorize])

  if (!user) return <Unauthorized />
  
  return <PageContent />
}
```

### Pattern 2: List Page with Filters & Pagination

```typescript
const ListPage = () => {
  const { pagination, setPagination } = usePaginationStore()
  const { values: filters } = useFilterStore()
  
  const { data } = useList({ ...filters, ...pagination })
  
  return (
    <>
      <Filter />
      <Table data={data} />
      <Pagination {...pagination} onChange={setPagination} />
    </>
  )
}
```

### Pattern 3: Detail Page with Tabs

```typescript
const DetailPage = () => {
  const id = useDetailStore((s) => s.detailCode)
  const { data } = useDetail(id)
  
  const tabs = [
    { key: 'info', label: 'Info', content: <Info /> },
    { key: 'related', label: 'Related', content: <Related /> },
  ]
  
  return <Tabs items={tabs} />
}
```

## Troubleshooting

### Page shows unauthorized when user is logged in

**Cause**: Authorization hook not called or not awaiting response
**Solution**:
```typescript
useEffect(() => {
  authorize(MODULE_CODE) // Call on mount
}, [authorize])
```

### Data not loading on page mount

**Cause**: Query params not passed or hook not triggered
**Solution**:
```typescript
const { data } = useList(params) // Include all dependencies
```

### Modal opens multiple times or doesn't close

**Cause**: State not properly reset or modal state issues
**Solution**:
```typescript
const handleClose = useCallback(() => {
  setModalOpen(false)
  // Reset detail state
  setDetailData(null)
}, [])
```

### Back button doesn't work or loses state

**Cause**: Navigating without preserving store state
**Solution**:
```typescript
const handleBack = () => {
  // Store already persists state
  navigate('/previous-page')
  // Or use router historystate
}
```

### Page re-renders too many times

**Cause**: Missing dependencies in useEffect or unoptimized hooks
**Solution**:
```typescript
useEffect(() => {
  // Effect logic
}, [dependency]) // Include all dependencies

const memoized = useMemo(() => processData(), [data])
```

## Related Skills

**Prerequisites**
- [react-router-configuration](../react-router-configuration/SKILL.md) - For understanding routing and navigation in pages
- [layout-wrapper-components](../layout-wrapper-components/SKILL.md) - For layout structure wrapping pages

**Often Used Together**
- [custom-react-hooks](../custom-react-hooks/SKILL.md) - For data fetching and state management in pages
- [feature-specific-business-logic](../feature-specific-business-logic/SKILL.md) - For composing feature logic into pages

**Can Reference**
- [global-state-management-zustand](../global-state-management-zustand/SKILL.md) - For page-wide state management
- [reusable-ui-components](../reusable-ui-components/SKILL.md) - For composing UI components in pages

## References

- [React Router Documentation](https://reactrouter.com/)
- [React Hooks Best Practices](https://react.dev/reference/react/hooks)
- [Store Management Patterns](https://zustand-demo.pmnd.rs/)
- [Data Fetching in React](https://tanstack.com/query/latest)
- [Page Architecture Patterns](https://patterns.dev/posts/react-patterns)

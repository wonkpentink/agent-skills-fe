---
name: feature-specific-business-logic
description: 'Complete guide for building feature-specific business logic components in src/features/. Use when creating domain-focused modules like contact management, assignment workflows, bulk operations, and filters. Learn component composition, custom hooks integration, state management, API mutations, and form handling patterns. Includes step-by-step workflows, real-world examples from the codebase, and best practices for organizing feature logic.'
---

# Feature-Specific Business Logic

Complete guide for building domain-focused feature modules that contain business logic not reusable across the app.

## When to Use This Skill

- Creating domain-specific features (contacts, assignments, filters, etc.)
- Building multi-step workflows or complex interactions
- Integrating custom hooks with form components
- Handling API mutations and data synchronization
- Creating composite components that combine multiple sub-components
- Managing local state for feature-specific flows
- Adding drag-and-drop, search, filtering, or bulk operations
- Organizing large feature modules into sub-folders

## Key Differences: Components vs Features

| Aspect | `src/components/` | `src/features/` |
|--------|------------------|-----------------|
| **Scope** | Generic, reusable | Domain-specific, feature-focused |
| **Business Logic** | None (pure UI) | Contains business logic |
| **Dependencies** | UI library, basic hooks | Custom hooks, API clients, stores |
| **Reusability** | High (used in many features) | Low (specific to one domain) |
| **Examples** | Button, Input, Modal | AddAddressForm, BranchHandling, TagsHandle |
| **Props** | UI-related (label, variant, size) | Domain data (customerCode, branchData) |

## Core Feature Structure

### Folder Organization

```
src/features/
├── contacts/                       # Feature domain
│   ├── AddAddressForm.tsx          # Top-level components
│   ├── BranchHandling.tsx
│   ├── TagsHandle.tsx
│   ├── addContact/                 # Sub-feature for adding contacts
│   │   ├── AddContactForm.tsx
│   │   ├── AddressSection.tsx
│   │   └── PhoneNumberSection.tsx
│   ├── contact/                    # Sub-feature for editing
│   │   ├── EditEmail.tsx
│   │   └── EmailItem.tsx
│   └── detail/                     # Sub-feature for details & activities
│       ├── ContactDetailsCard.tsx
│       └── additionalInformation/
├── assign/                         # Another feature domain
│   ├── Assign.tsx
│   ├── DownloadContact.tsx
│   └── updateBulk/
├── filter/                         # Filter feature
├── header/                         # Header feature
└── layouts/                        # Layout features
```

### Feature Component Pattern

```typescript
import { useState, useCallback, useMemo, useEffect } from 'react'
import { CustomComponentFromComponents } from '@/components/input/Custom'
import { useCustomHook } from '@/hooks/domain/useCustomHook'
import { useStore } from '@/stores/useStore'

// 1. Define Props Interface
interface FeatureComponentProps {
  // Data from parent/page
  customerId: string
  initialData?: any
  
  // Callbacks
  onSuccess?: () => void
  onError?: (error: Error) => void
}

// 2. Define Feature Component
const FeatureComponent: React.FC<FeatureComponentProps> = ({
  customerId,
  initialData,
  onSuccess,
  onError,
}) => {
  // 3. State management
  const [localState, setLocalState] = useState<any>(null)
  
  // 4. Custom hooks for API/business logic
  const { mutate: updateData, isPending: isLoading } = useCustomHook()
  const storeData = useStore((state) => state.data)
  
  // 5. Initialize from props
  useEffect(() => {
    if (initialData) {
      setLocalState(initialData)
    }
  }, [initialData])
  
  // 6. Memoized computed values
  const processedData = useMemo(() => {
    return localState ? transformData(localState) : null
  }, [localState])
  
  // 7. Stable callback references
  const handleChange = useCallback((newValue: any) => {
    setLocalState(newValue)
  }, [])
  
  const handleSubmit = useCallback(() => {
    updateData(
      { customer_id: customerId, data: localState },
      {
        onSuccess: () => onSuccess?.(),
        onError: (error) => onError?.(error),
      }
    )
  }, [customerId, localState, updateData, onSuccess, onError])
  
  // 8. Render
  return (
    <div className="feature-container">
      <SubComponent data={processedData} onChange={handleChange} />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

export default FeatureComponent
```

## Workflow: Creating a Feature Module

### Step 1: Analyze Requirements

Before coding, understand:

**Feature Purpose**
- What domain does it belong to? (contacts, assignments, filters)
- What specific problem does it solve?
- What are the main workflows/interactions?

**Data Flow**
- Where does initial data come from? (props, API, store)
- What mutations are needed? (create, update, delete)
- What local state is needed for UI?

**Complexity**
- Is it a simple component or complex workflow?
- Does it need sub-components?
- Is it reusable or one-time use?

### Step 2: Create Feature Folder Structure

For simple features:
```bash
# Single file feature
touch src/features/domain/FeatureName.tsx
```

For complex features:
```bash
# Create sub-folder for related components
mkdir -p src/features/domain/featureName
cd src/features/domain/featureName
touch MainComponent.tsx
touch SubComponent1.tsx
touch SubComponent2.tsx
touch types.ts
touch index.ts
```

### Step 3: Define TypeScript Types

Always define clear types for domain data:

```typescript
// src/features/contacts/types.ts

export interface ContactData {
  customer_code: string
  customer_name: string
  email?: string
  phone?: string
  address?: string
}

export interface BranchData {
  code: string | number
  name: string
}

export interface AddressFormData {
  line1: string
  line2?: string
  city: string
  province: string
  postal_code: string
}

export interface TagOption {
  label: string
  value: string
}
```

### Step 4: Create Main Feature Component

Start with single responsibility and build up:

```typescript
// src/features/contacts/BranchHandling.tsx

import { useCallback, useMemo, useState } from 'react'
import { CustomSelectV3 } from '@/components/input/CustomSelectV3'
import { useChangeBranch } from '@/hooks/customer/useChangeBranch'
import { useBranchList } from '@/hooks/mdm/useBranch'
import { useRemoveBranch } from '@/hooks/customer/useRemoveBranch'
import type { BranchData } from './types'

interface BranchHandlingProps {
  code?: string | number
  data: any
  onSuccess?: () => void
}

const BranchHandling: React.FC<BranchHandlingProps> = ({
  code,
  data,
  onSuccess,
}) => {
  // 1. Mutations for API calls
  const { mutate: updateBranch, isPending: isLoadingUpdate } = useChangeBranch()
  const { mutate: removeBranch, isPending: isLoadingRemove } = useRemoveBranch()
  
  // 2. Query hooks for fetching data
  const { data: optionBranchList, isLoading: isLoadingOptions } = useBranchList(
    { show_pagination: true, per_page: 1000, status: 1 },
    true
  )
  
  // 3. Local state for UI
  const [open, setOpen] = useState(false)
  
  // 4. Memoize current value
  const value = useMemo(
    () => ({
      code: data,
    }),
    [data]
  )
  
  // 5. Merge API options with current value
  const mergedOptions = useMemo(() => {
    const options = optionBranchList?.data?.list || []
    
    if (!value?.code) return options
    
    // Check if current value already in options
    const exists = options.some((opt: any) => opt.code === value.code)
    if (exists) return options
    
    // Prepend current value to options if not found
    return [value, ...options]
  }, [optionBranchList, value])
  
  // 6. Stable change handler
  const handleChange = useCallback(
    (val: BranchData | null) => {
      if (val) {
        updateBranch(
          { branch_code: val.code, customer_code: code },
          { onSuccess }
        )
      } else {
        removeBranch(
          { customer_code: code },
          { onSuccess }
        )
      }
    },
    [updateBranch, removeBranch, code, onSuccess]
  )
  
  // 7. Render
  return (
    <CustomSelectV3
      options={mergedOptions}
      value={value}
      onChange={handleChange}
      isLoading={isLoadingOptions || isLoadingUpdate || isLoadingRemove}
      isOpen={open}
      onOpenChange={setOpen}
      isClearable
      placeholder="Select Branch"
    />
  )
}

export default BranchHandling
```

### Step 5: Pattern 1 - Drag & Drop Feature

For features with drag-and-drop interactions:

```typescript
// src/features/contacts/AddAddressForm.tsx

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { SectionType } from '@/types/SectionType'
import { AddressSection } from './Sections'

const initialSections: SectionType[] = [
  'occupation',
  'phone',
  'wa',
  'email',
  'address',
]

interface AddAddressFormProps {
  onOrderChange?: (sections: SectionType[]) => void
  readOnly?: boolean
}

const AddAddressForm: React.FC<AddAddressFormProps> = ({
  onOrderChange,
  readOnly = false,
}) => {
  const [sections, setSections] = useState<SectionType[]>(initialSections)
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.indexOf(active.id as SectionType)
      const newIndex = sections.indexOf(over.id as SectionType)
      
      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections(newSections)
      onOrderChange?.(newSections)
    }
  }
  
  return (
    <div className="overflow-auto h-[60vh]">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext 
          items={sections} 
          strategy={verticalListSortingStrategy}
          disabled={readOnly}
        >
          <div className="flex flex-col gap-3">
            {sections.map((section) => (
              <AddressSection
                key={section}
                id={section}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default AddAddressForm
```

### Step 6: Pattern 2 - Search & Filter Feature

For features with search and filtering:

```typescript
// src/features/contacts/TagsHandle.tsx

import { useEffect, useState, useCallback } from 'react'
import { CustomCreatableSelect } from '@/components/input/CustomCreatableSelect'
import { useTagList } from '@/hooks/customer/useTagList'
import { useDebounce } from '@/hooks/custom/useDebounce'
import { useUpdateTag } from '@/hooks/customer/useUpdateTag'
import type { TagOption } from './types'

// Utility functions outside component
const mapOptions = (options?: any[]): TagOption[] =>
  (options ?? []).map((item) => ({
    label: item.tag_code,
    value: item.tag_code,
  }))

const mapForSubmit = (val?: TagOption[]) =>
  (val ?? []).map((item) => ({
    tag_code: item.value,
    tag_name: item.value,
  }))

interface TagsHandleProps {
  customerCode: string
  tags_information?: any[]
  onSuccess?: () => void
}

const TagsHandle: React.FC<TagsHandleProps> = ({
  customerCode,
  tags_information,
  onSuccess,
}) => {
  // 1. Local state for form
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  // 2. Custom hooks
  const debouncedSearch = useDebounce(inputValue, 400)
  const { data, isLoading } = useTagList({ v: debouncedSearch }, isOpen)
  const { mutate, isPending } = useUpdateTag()
  
  // 3. Initialize from parent/API
  useEffect(() => {
    if (tags_information) {
      setSelectedTags(mapOptions(tags_information))
    }
  }, [tags_information])
  
  // 4. Handle selection change
  const handleChange = useCallback(
    (val: TagOption[]) => {
      setSelectedTags(val ?? [])
      
      // Immediately update API
      mutate(
        {
          customer_code: customerCode,
          tags: mapForSubmit(val),
        },
        { onSuccess }
      )
    },
    [customerCode, mutate, onSuccess]
  )
  
  // 5. Render
  return (
    <CustomCreatableSelect
      options={mapOptions(data?.data?.list)}
      value={selectedTags}
      onChange={handleChange}
      onInputChange={setInputValue}
      onOpenChange={setIsOpen}
      isLoading={isLoading || isPending}
      isMulti
      isClearable
      isCreatable
      placeholder="Search or create tags..."
    />
  )
}

export default TagsHandle
```

### Step 7: Pattern 3 - Form Workflow Feature

For multi-step forms with validation:

```typescript
// src/features/contacts/addContact/AddContactForm.tsx

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { Button } from '@/components/button'
import { contactValidationSchema } from '@/lib/validation/contactSchema'
import { useCreateContact } from '@/hooks/customer/useCreateContact'
import type { ContactData } from '../types'
import {
  FullNameAvatarSection,
  PhoneNumberSection,
  EmailSection,
  AddressSection,
  NotesSection,
} from './sections'

interface AddContactFormProps {
  onSuccess?: (contact: ContactData) => void
  defaultValues?: Partial<ContactData>
}

const AddContactForm: React.FC<AddContactFormProps> = ({
  onSuccess,
  defaultValues,
}) => {
  const [step, setStep] = useState(1)
  
  // Form setup with validation
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(contactValidationSchema),
    mode: 'onBlur',
    defaultValues,
  })
  
  // API mutation
  const { mutate: createContact, isPending } = useCreateContact()
  
  // Form submission
  const onSubmit = (data: ContactData) => {
    createContact(data, {
      onSuccess: (newContact) => {
        onSuccess?.(newContact)
      },
    })
  }
  
  // Multi-step logic
  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <FullNameAvatarSection control={control} />
          <Button label="Next" onClick={handleNext} />
        </div>
      )}
      
      {/* Step 2: Contact Details */}
      {step === 2 && (
        <div className="space-y-4">
          <PhoneNumberSection control={control} />
          <EmailSection control={control} />
          <div className="flex gap-2">
            <Button label="Back" variant="outline" onClick={handleBack} />
            <Button label="Next" onClick={handleNext} />
          </div>
        </div>
      )}
      
      {/* Step 3: Address */}
      {step === 3 && (
        <div className="space-y-4">
          <AddressSection control={control} />
          <div className="flex gap-2">
            <Button label="Back" variant="outline" onClick={handleBack} />
            <Button label="Next" onClick={handleNext} />
          </div>
        </div>
      )}
      
      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <div className="space-y-4">
          <NotesSection control={control} />
          <div className="flex gap-2">
            <Button label="Back" variant="outline" onClick={handleBack} />
            <Button
              label="Create Contact"
              type="submit"
              loading={isPending}
              disabled={isPending}
            />
          </div>
        </div>
      )}
    </form>
  )
}

export default AddContactForm
```

### Step 8: Create Sub-Components

Break complex features into smaller, focused sub-components:

```typescript
// src/features/contacts/addContact/PhoneNumberSection.tsx

import { Control } from 'react-hook-form'
import { InputField } from '@/components/input/InputField'
import { SectionHeader } from './SectionHeader'
import type { ContactData } from '../types'

interface PhoneNumberSectionProps {
  control: Control<ContactData>
}

const PhoneNumberSection: React.FC<PhoneNumberSectionProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Phone Number"
        description="Add customer's contact numbers"
        icon="📱"
      />
      
      <InputField
        control={control}
        name="phone"
        label="Phone Number"
        placeholder="081234567890"
        type="tel"
        required
      />
      
      <InputField
        control={control}
        name="wa_number"
        label="WhatsApp Number (Optional)"
        placeholder="081234567890"
        type="tel"
      />
    </div>
  )
}

export default PhoneNumberSection
```

## Best Practices

### ✅ DO

- **Single Purpose** - Each feature handles one domain/workflow
- **Extract Sub-Components** - Break complex features into smaller parts
- **Use Custom Hooks** - Move API/business logic to hooks
- **Memoize Computed Values** - Use useMemo for expensive computations
- **Stable Callbacks** - Use useCallback to prevent unnecessary re-renders
- **Initialize from Props** - Use useEffect to sync with parent data
- **Type Everything** - Define clear TypeScript interfaces for domain data
- **Handle Loading/Error** - Show loading states and error messages
- **Clear Naming** - Use descriptive names (not `comp1`, `data2`)
- **Document Props** - JSDoc comments for feature props

### ❌ AVOID

- **Mixing UI and Logic** - Keep presentation separate from business logic
- **Props Drilling** - Use context/stores for deeply nested data
- **Hard-coded Values** - Extract to configuration/constants
- **Direct API Calls in Components** - Use custom hooks instead
- **Overly Complex Components** - Split into sub-components
- **Ignoring Error States** - Always handle API errors
- **Uncontrolled Forms** - Use react-hook-form for form state
- **Missing Loading States** - Show feedback during async operations
- **Poor File Organization** - Use logical folder structure
- **Duplicated Logic** - Extract to hooks or utility functions

## Common Feature Patterns

### Pattern: Simple Selector with API

```typescript
// Quick pattern for dropdowns/selects connected to APIs
const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
}) => {
  const { data: options } = useBranchList()
  const { mutate } = useUpdateBranch()
  
  const handleChange = useCallback((val) => {
    mutate({ value: val })
    onChange?.(val)
  }, [mutate, onChange])
  
  return <CustomSelect options={options} value={value} onChange={handleChange} />
}
```

### Pattern: Search with Debounce

```typescript
// Quick pattern for searchable lists
const SearchableList: React.FC<SearchableListProps> = () => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: results } = useSearch(debouncedSearch)
  
  return (
    <>
      <input onChange={(e) => setSearch(e.target.value)} />
      {results?.map((item) => <Item key={item.id} data={item} />)}
    </>
  )
}
```

### Pattern: List with Bulk Operations

```typescript
// Quick pattern for multi-select actions
const BulkActions: React.FC<BulkActionsProps> = () => {
  const [selected, setSelected] = useState<string[]>([])
  const { mutate: bulkUpdate } = useBulkUpdate()
  
  const handleBulkUpdate = (action: string) => {
    bulkUpdate({ ids: selected, action })
    setSelected([])
  }
  
  return (
    <>
      <ItemList selected={selected} onSelect={setSelected} />
      {selected.length > 0 && (
        <BulkActionBar
          count={selected.length}
          onUpdate={handleBulkUpdate}
        />
      )}
    </>
  )
}
```

## Troubleshooting

### Feature component re-renders too often

**Cause**: Props or callback references changing, missing useMemo/useCallback
**Solution**:
```typescript
// Wrap expensive computations
const memoizedData = useMemo(() => processData(data), [data])

// Wrap callbacks
const handleClick = useCallback(() => {
  mutate(value)
}, [mutate, value])
```

### Form state not syncing with parent/API

**Cause**: Missing useEffect to initialize from props
**Solution**:
```typescript
useEffect(() => {
  if (initialData) {
    reset(initialData) // For react-hook-form
    setLocalState(initialData) // For local state
  }
}, [initialData])
```

### API mutations don't trigger callback

**Cause**: Callback not included in onSuccess handler
**Solution**:
```typescript
const handleUpdate = () => {
  mutate(data, {
    onSuccess: () => onSuccess?.(), // Include callback
    onError: (error) => onError?.(error),
  })
}
```

### Feature shows stale data from API

**Cause**: Not invalidating/refetching query after mutation
**Solution**:
```typescript
const { mutate } = useUpdateContact({
  onSuccess: () => {
    // Refetch related queries
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
    onSuccess?.()
  },
})
```

### Debounced search not working properly

**Cause**: useDebounce hook not implemented or search not in dependency
**Solution**:
```typescript
const debouncedSearch = useDebounce(searchValue, 300)
const { data } = useFetchResults(debouncedSearch) // Include debounced value
```

## Related Skills

**Prerequisites**
- [custom-react-hooks](../custom-react-hooks/SKILL.md) - For data fetching and state management in features
- [reusable-ui-components](../reusable-ui-components/SKILL.md) - For composing UI components in features

**Often Used Together**
- [form-validation-schemas](../form-validation-schemas/SKILL.md) - For validating forms in feature workflows
- [full-page-screen-components](../full-page-screen-components/SKILL.md) - Features integrated into pages

**Can Reference**
- [constants-static-data](../constants-static-data/SKILL.md) - For feature configuration and option data
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For typing feature component props and state

## References

- [React Hooks Official Guide](https://react.dev/reference/react/hooks)
- [react-hook-form Documentation](https://react-hook-form.com/)
- [dnd-kit for Drag & Drop](https://docs.dndkit.com/)
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Custom Hook Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Component Composition](https://react.dev/learn/passing-props-to-a-component)

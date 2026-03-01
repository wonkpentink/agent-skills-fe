---
name: constants-static-data
description: Complete guide for creating and organizing constants and static data in src/lib/options/ and src/lib/utils/. Learn dropdown option arrays, enum-like constants, configuration constants, status mappings, and type definitions. Covers reusable fixed values used across components, forms, and features without dynamic computation.
---

## What Are Constants & Static Data?

Constants & Static Data are immutable values in `src/lib/options/` (and utilities) that define:

- **Dropdown Options:** Arrays of `{ label, value }` for form selects
- **Status Constants:** Fixed values for statuses (active, approved, pending)
- **Type Enums:** Predefined types (contact types, identity types)
- **Configuration:** Pagination, API limits, timeouts
- **Mappings:** Code → Label mappings for display
- **Localization:** Messages, labels in different languages

These values are defined once and reused across components to maintain consistency and avoid duplication.

## When to Use

  - Creating dropdown/select options for forms
  - Defining status constants (active/inactive, approved/rejected)
  - Creating type/enum-like constants
  - Storing configuration values (pagination defaults, API limits)
  - Mapping codes to display labels
  - Defining feature flags and application-wide settings
  - Creating options for radio buttons and checkboxes
  - Storing currency, timezone, and locale constants

## Prerequisites

  - Installation & Initial Setup skill completed
  - Understanding of TypeScript types and interfaces
  - Familiarity with form libraries (react-hook-form, react-select)
  - Basic understanding of application requirements

## Folder Structure Overview

```
src/lib/
├── options/
│   ├── contactOption.ts        # Contact-related constants
│   ├── loanOption.ts           # Loan application options
│   ├── addressOption.ts        # Address/location options
│   ├── statusOption.ts         # Status constants
│   └── typeOption.ts           # Type/enum constants
└── utils/
    ├── Constant.ts             # Application-wide defaults
    └── MessageList.ts          # Error message mappings
```

**Key Points:**
- Organize options by feature (contactOption, loanOption)
- Group related constants together
- Export as named exports or arrays
- Use consistent naming conventions
- Document the purpose and usage of each constant

## Core Patterns

### Pattern 1: Dropdown/Select Options (Label-Value Pairs)

Arrays of objects with `label` and `value` for form select components.

```typescript
// src/lib/options/contactOption.ts
// Define options for phone number status select
export const phoneStatusOptions = [
    { label: "Number Inactive", value: 1 },
    { label: "Number Active", value: 2 },
];

// Options for lead type (sales pipeline stages)
export const leadTypeOptions = [
    { label: 'New', value: 'new' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Not Qualified', value: 'not qualified' },
    { label: 'Proposal', value: 'proposal' },
    { label: 'Request Proposal', value: 'request proposal' },
    { label: 'Deal', value: 'deal' },
    { label: 'Deal Lost', value: 'deal lost' },
    { label: 'Debtor', value: 'debtor' },
];

// Options for contact status after calling
export const contactedStatusOptions = [
    { label: 'Answered', value: 'answered' },
    { label: 'Unanswered', value: 'unanswered' },
    { label: 'Voicemail', value: 'voicemail' },
    { label: 'Talked', value: 'talked' }
];

// Options for call outcome
export const callStatusOptions = [
    { label: 'Prospect', value: 'PROSPECT' },
    { label: 'Not Process', value: 'NOT_PROCESS' },
    { label: 'Reminder', value: 'REMINDER' },
    { label: 'Wrong Number', value: 'WRONG NUMBER' },
    { label: 'Unprospect', value: 'UNPROSPECT' },
];
```

**Key Characteristics:**
- Objects have `label` (display text) and `value` (stored value)
- Arrays ordered by frequency or logical flow
- Values can be strings or numbers
- Easy to pass to react-select, HTML select, radio groups
- Exported as named constants for reuse

**Usage Example:**
```typescript
import { phoneStatusOptions, leadTypeOptions } from "@/lib/options/contactOption";
import { CustomSelect } from "@/components/input/CustomSelect";

export function ContactForm() {
    return (
        <>
            <CustomSelect
                name="phone_status"
                label="Phone Status"
                options={phoneStatusOptions}
            />
            
            <CustomSelect
                name="lead_type"
                label="Lead Type"
                options={leadTypeOptions}
            />
        </>
    );
}
```

---

### Pattern 2: Status Constants (Single Source of Truth)

Fixed values for statuses to use in validation, display, and logic.

```typescript
// src/lib/options/statusOption.ts
// Account/user status constants
export const accountStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Locked', value: 'locked' },
];

// Application/loan status constants
export const loanStatusOptions = [
    { label: 'Submitted', value: 'submitted' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Disbursed', value: 'disbursed' },
    { label: 'Closed', value: 'closed' },
];

// Task/assignment status
export const taskStatusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

// Approval status for documents
export const approvalStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Revised', value: 'revised' },
];

// Export status codes as enum-like object
export const STATUS_CODES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

// Export for type checking
export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];
```

**Key Characteristics:**
- One object per status category
- Values match backend API exactly
- Optional: separate enum-like object for code constants
- Consistent naming (camelCase values, UPPERCASE codes)
- Type-safe when using `as const`

**Usage Example:**
```typescript
import { loanStatusOptions, STATUS_CODES } from "@/lib/options/statusOption";

// In component (form select)
<CustomSelect options={loanStatusOptions} name="status" />

// In logic (conditional)
if (loan.status === STATUS_CODES.APPROVED) {
    showDisbursalButton();
}

// In validation
if (![STATUS_CODES.PENDING, STATUS_CODES.UNDER_REVIEW].includes(status)) {
    disableEdit();
}
```

---

### Pattern 3: Type/Category Constants (Enums)

Fixed enumeration of types or categories.

```typescript
// src/lib/options/typeOption.ts
// Contact type: phone vs email
export const contactTypeOptions = [
    { label: 'Phone Number', value: 1 },
    { label: 'Email', value: 2 },
    { label: 'WhatsApp', value: 3 },
];

// Identity document type
export const identityTypeOptions = [
    { label: 'KTP (ID Card)', value: 1 },
    { label: 'SIM (Driver License)', value: 2 },
    { label: 'Passport', value: 3 },
    { label: 'KITAS (Residence Permit)', value: 4 },
];

// Gender type
export const genderOptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 },
    { label: 'Other', value: 3 },
];

// Marital status type
export const maritalStatusOptions = [
    { label: 'Single', value: 1 },
    { label: 'Married', value: 2 },
    { label: 'Divorced', value: 3 },
    { label: 'Widowed', value: 4 },
];

// Vehicle/collateral type
export const vehicleTypeOptions = [
    { label: 'Car', value: 'car' },
    { label: 'Motorcycle', value: 'motorcycle' },
    { label: 'Truck', value: 'truck' },
    { label: 'Bus', value: 'bus' },
];

// Employment type
export const employmentTypeOptions = [
    { label: 'Employee', value: 'employee' },
    { label: 'Self-Employed', value: 'self_employed' },
    { label: 'Entrepreneur', value: 'entrepreneur' },
    { label: 'Unemployed', value: 'unemployed' },
];

// As enum-like object (for type inference)
export const CONTACT_TYPE = {
    PHONE: 1,
    EMAIL: 2,
    WHATSAPP: 3,
} as const;

export type ContactType = typeof CONTACT_TYPE[keyof typeof CONTACT_TYPE];
```

**Key Characteristics:**
- Represents fixed categorical choices
- Value doesn't change (unlike status which can transition)
- Can be string or number based on backend
- Optional: export enum-like object for code references
- Type definitions for TypeScript safety

**Usage Example:**
```typescript
import { contactTypeOptions, CONTACT_TYPE } from "@/lib/options/typeOption";

// In form select
<CustomSelect
    options={contactTypeOptions}
    name="contact_type"
    label="Contact Type"
/>

// In conditional logic
if (contact.contact_type === CONTACT_TYPE.PHONE) {
    validatePhoneNumber(contact.value);
} else if (contact.contact_type === CONTACT_TYPE.EMAIL) {
    validateEmail(contact.value);
}

// Type-safe
const identifyContact = (type: ContactType) => {
    // TypeScript ensures type is valid
};
```

---

### Pattern 4: Configuration Constants (Defaults & Limits)

Application-wide settings and default values.

```typescript
// src/lib/utils/Constant.ts
// Pagination defaults
export const defaultPagination = {
    total_data: 0,
    count_data: 0,
    max_page: 0,
    min_page: 0,
    page: 1,
    per_page: 10,
};

// API limits and constraints
export const API_LIMITS = {
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024,  // 5MB
    MAX_BATCH_SIZE: 100,
    REQUEST_TIMEOUT: 30000,            // 30 seconds
    RETRY_COUNT: 3,
} as const;

// Pagination options
export const PAGINATION_OPTIONS = {
    ITEMS_PER_PAGE: 10,
    MAX_ITEMS_PER_PAGE: 100,
    DEFAULT_PAGE: 1,
} as const;

// Timing constants
export const TIMING = {
    DEBOUNCE_DELAY: 300,              // ms
    THROTTLE_DELAY: 500,              // ms
    CACHE_DURATION: 5 * 60 * 1000,    // 5 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000,  // 30 minutes
} as const;

// Application routes
export const APP_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    CONTACTS: '/crm/contacts',
    CONTACT_DETAIL: '/crm/contacts/:id',
    LOANS: '/crm/loans',
    TASKS: '/crm/tasks',
    SETTINGS: '/crm/settings',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
    ENABLE_BULK_OPERATIONS: true,
    ENABLE_EXPORT: true,
    ENABLE_IMPORT: false,
    ENABLE_ANALYTICS: true,
} as const;
```

**Key Characteristics:**
- Centralized configuration
- Single source of truth for defaults
- Use `as const` for type inference
- Group by category
- Add comments explaining purpose
- Easy to update across application

**Usage Example:**
```typescript
import { defaultPagination, PAGINATION_OPTIONS, TIMING } from "@/lib/utils/Constant";

// Default values for form
const form = useForm({
    defaultValues: {
        page: defaultPagination.page,
        per_page: defaultPagination.per_page,
    }
});

// Debounce hook with timing constant
const handleSearch = debounce(
    (query) => fetchResults(query),
    TIMING.DEBOUNCE_DELAY
);

// Feature-gated functionality
if (FEATURE_FLAGS.ENABLE_BULK_OPERATIONS) {
    showBulkActionButtons();
}

// API limit checking
if (fileSize > API_LIMITS.MAX_UPLOAD_SIZE) {
    showError("File too large");
}
```

---

### Pattern 5: Mapping Objects (Code → Label)

Map backend codes to display labels.

```typescript
// src/lib/options/mappings.ts
// Map status code to display label
export const statusLabelMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
} as const;

// Map contact type to display label
export const contactTypeLabelMap = {
    1: 'Phone Number',
    2: 'Email',
    3: 'WhatsApp',
} as const;

// Map gender code to display label
export const genderLabelMap = {
    1: 'Male',
    2: 'Female',
    3: 'Other',
} as const;

// Map vehicle type to display label
export const vehicleLabelMap = {
    'car': 'Car',
    'motorcycle': 'Motorcycle',
    'truck': 'Truck',
    'bus': 'Bus',
} as const;

// Helper function to get label from code
export const getLabel = <T extends string | number>(
    code: T,
    map: Record<T, string>
): string => {
    return map[code] || code.toString();
};

// Helper function to get color based on status
export const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'cancelled': 'bg-orange-100 text-orange-800',
    };
    return colorMap[status] || '';
};
```

**Key Characteristics:**
- Maps backend codes to user-friendly labels
- Centralizes display logic
- Prevents duplicate label definitions
- Helper functions for common operations
- Type-safe with `as const`

**Usage Example:**
```typescript
import { statusLabelMap, contactTypeLabelMap, getLabel } from "@/lib/options/mappings";

// Display status label
<span>{statusLabelMap[loan.status]}</span>

// Generic helper function
<span>{getLabel(contact.type, contactTypeLabelMap)}</span>

// In table columns
{
    header: 'Status',
    cell: (status) => statusLabelMap[status] || 'Unknown'
}
```

---

## Complete Workflows

### Workflow 1: Create New Option Set

**Goal:** Add constants for a new form feature

**Prerequisites:** Identify all possible values from backend API docs

**Steps:**

1. **Identify Options** - List all possible values
   ```
   Contact Type: Phone (1), Email (2), WhatsApp (3)
   Contact Status: Active, Inactive
   Contact Priority: Low, Medium, High
   ```

2. **Create Options File** - New file (or extend existing)
   ```typescript
   // src/lib/options/contactOption.ts
   export const contactTypeOptions = [
       { label: 'Phone', value: 1 },
       { label: 'Email', value: 2 },
       { label: 'WhatsApp', value: 3 },
   ];
   ```

3. **Define Arrays** - One per option category
   ```typescript
   export const contactStatusOptions = [
       { label: 'Active', value: 'active' },
       { label: 'Inactive', value: 'inactive' },
   ];

   export const contactPriorityOptions = [
       { label: 'Low', value: 1 },
       { label: 'Medium', value: 2 },
       { label: 'High', value: 3 },
   ];
   ```

4. **Add Type Definitions** (Optional - if needed)
   ```typescript
   export const CONTACT_TYPE = {
       PHONE: 1,
       EMAIL: 2,
       WHATSAPP: 3,
   } as const;

   export type ContactType = typeof CONTACT_TYPE[keyof typeof CONTACT_TYPE];
   ```

5. **Export for Use** - Make accessible
   ```typescript
   // Export all options
   export {
       contactTypeOptions,
       contactStatusOptions,
       contactPriorityOptions,
   };
   ```

6. **Use in Components** - Import and use
   ```typescript
   import { contactTypeOptions } from "@/lib/options/contactOption";

   <CustomSelect options={contactTypeOptions} name="type" />
   ```

7. **Test All Values** - Verify options work
   ```typescript
   // Test in component
   const [selected, setSelected] = useState<1 | 2 | 3>(1);
   
   // Should work with any option value
   contactTypeOptions.forEach(option => {
       setSelected(option.value);  // ✅ Works
   });
   ```

---

### Workflow 2: Create Status Mapping System

**Goal:** Map backend status codes to user-friendly display values

**Prerequisites:** Know all status values from API

**Steps:**

1. **List All Statuses** - Document from backend
   ```
   pending
   under_review
   approved
   rejected
   disbursed
   closed
   ```

2. **Create Status Options** - Array of label-value pairs
   ```typescript
   export const loanStatusOptions = [
       { label: 'Pending', value: 'pending' },
       { label: 'Under Review', value: 'under_review' },
       { label: 'Approved', value: 'approved' },
       { label: 'Rejected', value: 'rejected' },
       { label: 'Disbursed', value: 'disbursed' },
       { label: 'Closed', value: 'closed' },
   ];
   ```

3. **Create Label Mapping** - For quick lookup
   ```typescript
   export const loanStatusLabelMap = {
       pending: 'Pending',
       under_review: 'Under Review',
       approved: 'Approved',
       rejected: 'Rejected',
       disbursed: 'Disbursed',
       closed: 'Closed',
   } as const;
   ```

4. **Create Color Mapping** - For styling
   ```typescript
   export const loanStatusColorMap = {
       pending: 'bg-yellow-100 text-yellow-800',
       under_review: 'bg-blue-100 text-blue-800',
       approved: 'bg-green-100 text-green-800',
       rejected: 'bg-red-100 text-red-800',
       disbursed: 'bg-green-100 text-green-800',
       closed: 'bg-gray-100 text-gray-800',
   } as const;
   ```

5. **Create Status Badge Component** - Use mappings
   ```typescript
   // Component that uses mappings
   export function StatusBadge({ status }: { status: string }) {
       const label = loanStatusLabelMap[status];
       const color = loanStatusColorMap[status];
       
       return <span className={color}>{label}</span>;
   }
   ```

6. **Use Throughout App** - Consistent display
   ```typescript
   // In table
   <StatusBadge status={row.status} />

   // In details
   <p>Status: {loanStatusLabelMap[loan.status]}</p>

   // In select
   <CustomSelect options={loanStatusOptions} />
   ```

---

### Workflow 3: Create Application Configuration Constants

**Goal:** Centralize application settings and limits

**Prerequisites:** Know application requirements and constraints

**Steps:**

1. **Identify Configuration Needs** - Document all settings
   ```
   Pagination: items per page, default page
   Timing: debounce delay, cache duration
   API: limits, timeouts, retry count
   Features: which features are enabled
   Routes: application route paths
   ```

2. **Create Constant File** - Or add to existing
   ```typescript
   // src/lib/utils/Constant.ts
   export const APP_CONFIG = {
       // Pagination
       defaultPage: 1,
       itemsPerPage: 10,
       maxItemsPerPage: 100,
       
       // Timing (milliseconds)
       debounceDelay: 300,
       cacheExpiry: 5 * 60 * 1000,
       requestTimeout: 30000,
       
       // Features
       enableBulkExport: true,
       enableImport: false,
   } as const;
   ```

3. **Group by Purpose** - Separate related settings
   ```typescript
   export const PAGINATION_DEFAULTS = {
       PAGE: 1,
       LIMIT: 10,
       MAX_LIMIT: 100,
   } as const;

   export const TIMING_DEFAULTS = {
       DEBOUNCE_MS: 300,
       THROTTLE_MS: 500,
       SESSION_TIMEOUT_MS: 30 * 60 * 1000,
   } as const;

   export const API_DEFAULTS = {
       TIMEOUT_MS: 30000,
       RETRY_COUNT: 3,
       MAX_BATCH_SIZE: 100,
   } as const;
   ```

4. **Document Each Constant** - Add comments
   ```typescript
   export const TIMING_DEFAULTS = {
       // Debounce delay for search input (ms)
       DEBOUNCE_MS: 300,
       
       // Throttle delay for scroll events (ms)
       THROTTLE_MS: 500,
       
       // Session timeout before auto-logout (ms)
       SESSION_TIMEOUT_MS: 30 * 60 * 1000,
   } as const;
   ```

5. **Use in Hooks** - For consistent behavior
   ```typescript
   import { TIMING_DEFAULTS } from "@/lib/utils/Constant";

   export const useDebounce = (value: string) => {
       const [debouncedValue, setDebouncedValue] = useState(value);

       useEffect(() => {
           const handler = setTimeout(() => {
               setDebouncedValue(value);
           }, TIMING_DEFAULTS.DEBOUNCE_MS);  // Use constant

           return () => clearTimeout(handler);
       }, [value]);

       return debouncedValue;
   };
   ```

6. **Use in Components** - For defaults
   ```typescript
   import { PAGINATION_DEFAULTS } from "@/lib/utils/Constant";

   const useContactList = (page = PAGINATION_DEFAULTS.PAGE) => {
       // ...
   };

   const form = useForm({
       defaultValues: {
           page: PAGINATION_DEFAULTS.PAGE,
           limit: PAGINATION_DEFAULTS.LIMIT,
       }
   });
   ```

---

### Workflow 4: Create Option Array with Helper Functions

**Goal:** Build reusable option sets with filtering/searching

**Prerequisites:** Know all possible options and use cases

**Steps:**

1. **Create Base Options** - Complete list
   ```typescript
   export const allContactTypeOptions = [
       { label: 'Phone', value: 1, category: 'direct' },
       { label: 'Email', value: 2, category: 'indirect' },
       { label: 'WhatsApp', value: 3, category: 'direct' },
       { label: 'LinkedIn', value: 4, category: 'social' },
       { label: 'Instagram', value: 5, category: 'social' },
   ];
   ```

2. **Create Filter Functions** - Get subset of options
   ```typescript
   export const getDirectContactOptions = () => {
       return allContactTypeOptions.filter(opt => opt.category === 'direct');
   };

   export const getSocialContactOptions = () => {
       return allContactTypeOptions.filter(opt => opt.category === 'social');
   };

   export const getPhoneOptions = () => {
       return allContactTypeOptions.filter(opt => opt.category === 'direct');
   };
   ```

3. **Create Search Function** - Find by label or value
   ```typescript
   export const searchContactOptions = (query: string) => {
       const lower = query.toLowerCase();
       return allContactTypeOptions.filter(opt =>
           opt.label.toLowerCase().includes(lower) ||
           opt.value.toString().includes(lower)
       );
   };
   ```

4. **Create Type Utility** - Get types from options
   ```typescript
   export const getContactTypeValue = (label: string) => {
       const option = allContactTypeOptions.find(
           opt => opt.label === label
       );
       return option?.value;
   };

   export const getContactTypeLabel = (value: number) => {
       const option = allContactTypeOptions.find(
           opt => opt.value === value
       );
       return option?.label;
   };
   ```

5. **Use in Components** - With helpers
   ```typescript
   import {
       allContactTypeOptions,
       getDirectContactOptions,
       searchContactOptions,
   } from "@/lib/options/contactOption";

   // Show only direct contact types
   <CustomSelect options={getDirectContactOptions()} />

   // Search options
   const results = searchContactOptions(query);
   <CustomSelect options={results} />
   ```

---

## Advanced Patterns

### Pattern A: Multi-Language Options

Support options in multiple languages.

```typescript
type Language = 'en' | 'id';

export const contactTypeOptionsMap: Record<Language, typeof contactTypeOptions> = {
    en: [
        { label: 'Phone', value: 1 },
        { label: 'Email', value: 2 },
    ],
    id: [
        { label: 'Telepon', value: 1 },
        { label: 'Email', value: 2 },
    ]
};

export const getContactTypeOptions = (language: Language = 'en') => {
    return contactTypeOptionsMap[language];
};

// Usage
<CustomSelect options={getContactTypeOptions('id')} />
```

---

### Pattern B: Dynamic Options from Derivation

Create options dynamically from other data.

```typescript
export const getCurrentYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 25 }, (_, i) => {
        const year = currentYear - i;
        return {
            label: year.toString(),
            value: year
        };
    });
};

export const getMonthOptions = () => {
    return [
        { label: 'January', value: 1 },
        { label: 'February', value: 2 },
        // ... etc
    ];
};

// Usage
<CustomSelect options={getCurrentYearOptions()} name="year" />
<CustomSelect options={getMonthOptions()} name="month" />
```

---

### Pattern C: Hierarchical/Nested Options

Groups and sub-options (country → state → city).

```typescript
export interface RegionOption {
    label: string;
    value: string;
    children?: RegionOption[];
}

export const regionOptions: RegionOption[] = [
    {
        label: 'Indonesia',
        value: 'id',
        children: [
            {
                label: 'Java',
                value: 'java',
                children: [
                    { label: 'Jakarta', value: 'jakarta' },
                    { label: 'Bandung', value: 'bandung' },
                ]
            },
            {
                label: 'Sumatra',
                value: 'sumatra',
                children: [
                    { label: 'Medan', value: 'medan' },
                ]
            }
        ]
    }
];

// Helper: get sub-options
export const getSubRegions = (parentValue: string) => {
    const parent = regionOptions.find(r => r.value === parentValue);
    return parent?.children || [];
};

// Helper: flatten for searching
export const flattenRegions = (regions = regionOptions): RegionOption[] => {
    return regions.flatMap(region => [
        region,
        ...(region.children ? flattenRegions(region.children) : [])
    ]);
};
```

---

## Best Practices

### 1. Single Source of Truth
```typescript
// ✅ GOOD: Define once, reference everywhere
export const CONTACT_TYPE = {
    PHONE: 1,
    EMAIL: 2,
} as const;

export const contactTypeOptions = [
    { label: 'Phone', value: CONTACT_TYPE.PHONE },
    { label: 'Email', value: CONTACT_TYPE.EMAIL },
];

// ❌ AVOID: Duplicate definitions
export const contactTypeOptions = [
    { label: 'Phone', value: 1 },
    { label: 'Email', value: 2 },
];
export const CONTACT_TYPE_PHONE = 1;
export const CONTACT_TYPE_EMAIL = 2;
```

---

### 2. Use TypeScript `as const` for Type Safety
```typescript
// ✅ GOOD: Type-safe inference
export const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
] as const;

type Status = typeof statusOptions[number]['value']; // 'active' | 'inactive'

// ❌ AVOID: Loses type information
export const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];
```

---

### 3. Organize by Feature/Domain
```typescript
// ✅ GOOD: Group related options together
src/lib/options/
├── contactOption.ts       (all contact-related)
├── loanOption.ts          (all loan-related)
├── addressOption.ts       (all address-related)

// ❌ AVOID: Scattered organization
src/lib/options/
├── phoneStatusOption.ts
├── emailStatusOption.ts
├── contactTypeOption.ts
├── ...
```

---

### 4. Document Purpose and Examples
```typescript
// ✅ GOOD: Clear documentation
/**
 * Phone number status options
 * Used in contact forms and contact list display
 * Value: 1 = Inactive, 2 = Active
 * 
 * @example
 * <Select options={phoneStatusOptions} />
 */
export const phoneStatusOptions = [
    { label: 'Inactive', value: 1 },
    { label: 'Active', value: 2 },
];

// ❌ AVOID: No documentation
export const phoneStatusOptions = [
    { label: 'Inactive', value: 1 },
    { label: 'Active', value: 2 },
];
```

---

### 5. Use Consistent Naming Conventions
```typescript
// ✅ GOOD: Clear, consistent names
export const contactTypeOptions = [];        // Array of options
export const CONTACT_TYPE = {};             // Enum-like constants
export const contactTypeLabelMap = {};       // Lookup map
export const getContactTypeLabel = () => {}; // Helper function

// ❌ AVOID: Inconsistent naming
export const ctOptions = [];
export const CONTACT_T = {};
export const contactTypes = {};
export const getContactType = () => {};
```

---

### 6. Keep Options Ordered Logically
```typescript
// ✅ GOOD: Logical ordering (by frequency, workflow, alphabet)
export const statusOptions = [
    { label: 'Pending', value: 'pending' },      // Most common first
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Archived', value: 'archived' },     // Least common last
];

// ❌ AVOID: Random ordering
export const statusOptions = [
    { label: 'Archived', value: 'archived' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
];
```

---

## Troubleshooting

### Issue: Values Not Matching Between Options and Backend

**Cause:** Value in options doesn't match API response

**Solution:** Verify and synchronize
```typescript
// Debug: Log values from API
console.log('From API:', response.status);  // "active"
console.log('Option value:', contactTypeOptions[0].value);  // 1

// Fix: Ensure values match exactly
export const statusOptions = [
    { label: 'Active', value: 'active' },  // Match API: "active"
    { label: 'Inactive', value: 'inactive' },
];
```

---

### Issue: TypeScript Error with Custom Select

**Cause:** Option types don't match component expectations

**Solution:** Make types explicit
```typescript
interface OptionType {
    label: string;
    value: string | number;
}

export const contactTypeOptions: OptionType[] = [
    { label: 'Phone', value: 1 },
    { label: 'Email', value: 2 },
];
```

---

### Issue: Options Ordered Unexpectedly in UI

**Cause:** Component sorts or filters options

**Solution:** Document expected behavior
```typescript
// NOTE: Options should be displayed in this order
// If component sorts, disable sorting:
<CustomSelect
    options={contactTypeOptions}
    isSortable={false}
/>
```

---

### Issue: Translation/Label Not Updating

**Cause:** Options are static, need dynamic translation

**Solution:** Use translation helper
```typescript
import { useTranslation } from 'react-i18next';

export const useContactTypeOptions = () => {
    const { t } = useTranslation();
    
    return [
        { label: t('contact.type.phone'), value: 1 },
        { label: t('contact.type.email'), value: 2 },
    ];
};

// Usage
const options = useContactTypeOptions();
<CustomSelect options={options} />
```

---

### Issue: Options Growing Too Large

**Cause:** Too many options in single array

**Solution:** Split and use helper functions
```typescript
// ❌ Avoid: Massive array
export const allOptions = [
    // 1000+ items
];

// ✅ Better: Split by category
export const getOptions = (category: string) => {
    switch(category) {
        case 'vehicle':
            return vehicleOptions;
        case 'location':
            return locationOptions;
        // ...
    }
};
```

---

## References

### Related Skills
- **Reusable UI Components:** Uses these constants for form inputs
- **Form Validation Schemas:** References option values in validation
- **Custom React Hooks:** Uses constants for configuration

### External Documentation
- **React Select:** https://react-select.com/ - Select component accepting options
- **TypeScript `as const`:** https://www.typescriptlang.org/docs/handbook/const-assertions.html

### Related Code Files
- `src/lib/options/contactOption.ts` - Contact options
- `src/lib/utils/Constant.ts` - Configuration constants
- `src/lib/utils/MessageList.ts` - Message mappings
- `src/components/input/CustomSelect.tsx` - Component using options

### Common Patterns Summary

| Pattern | Usage | Example |
|---------|-------|---------|
| Dropdown Options | Form selects | `phoneStatusOptions` |
| Status Constants | Conditional logic | `STATUS.APPROVED` |
| Type Enums | Type checking | `CONTACT_TYPE.PHONE` |
| Config Constants | App defaults | `PAGINATION_DEFAULTS.LIMIT` |
| Label Maps | Display conversion | `statusLabelMap[status]` |

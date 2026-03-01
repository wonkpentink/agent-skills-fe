---
name: typescript-type-definitions
description: 'Complete guide for building TypeScript type definitions in src/types/. Learn data models, interfaces, form types, component prop types, and union types for type safety. Use when creating new domain types, API response models, form input types, component prop interfaces, and ensuring type consistency across the application. Covers snake_case API conventions, optional fields, nested structures, and real-world patterns from Contact, Address, Lead, Column, and User domains.'
---

# TypeScript Type Definitions

A comprehensive guide for creating and organizing TypeScript type definitions in `src/types/`. These definitions ensure type safety across the entire application, map to API response structures, and provide clear contracts for components and business logic.

## When to Use This Skill

- Creating new domain data models (Contact, Address, User, Lead, etc.)
- Defining form input types derived from data models
- Building component prop interfaces
- Creating union types for status values or enums
- Establishing API response type mappings
- Ensuring type consistency across features and components
- Working with nested or complex data structures
- Integrating API data with React components

## Prerequisites

- Understanding of TypeScript basics (types, interfaces, generics)
- Knowledge of the API response structure for your domain
- Familiarity with the codebase's naming conventions
- React and component patterns if defining prop types

## File Organization

```
src/types/
├── ContactType.ts          # Contact, form inputs, nested structures
├── AddressType.ts          # Address models and form types
├── LeadType.ts             # Lead status unions and sort types
├── ColumnType.ts           # Generic Column types for tables, component props
├── UserType.ts             # User models and authentication types
└── TabsType.ts             # Component-specific prop interfaces
```

## Core Patterns

### Pattern 1: API Response Data Models

Map API responses to TypeScript types using snake_case field names (matching API conventions):

```typescript
export type ContactInformation = {
    contact_type: number;
    handphone?: string;           // Optional field
    email?: string;
    contact_status: number;
    is_whatsapp_number: boolean;
    contact_code?: string;
    is_primary?: boolean;
};

export type AddressInformation = {
    address_address_1: string;
    address_rt: string;
    address_rw: string;
    address_country_code: string;
    address_country_name: string;
    address_province_code: string;
    address_province_name: string;
    address_zipcode: string;
    address_address_type: number;
    address_is_primary?: boolean;
    address_is_same_as_id?: boolean;
};
```

**Key conventions:**
- Use `snake_case` to match API field names
- Mark truly optional fields with `?`
- Use `number` for status/type codes
- Use `boolean` for flags and toggles
- Use `string` for IDs, codes, names, addresses
- Group related fields logically

### Pattern 2: Form Input Types

Create separate form types derived from data models. These optimize for form handling, validation, and submission:

```typescript
// API response type
export type ContactInformation = {
    contact_type: number;
    handphone?: string;
    contact_status: number;
    is_whatsapp_number: boolean;
};

// Form input type - optimized for react-hook-form
export type ContactInformationForm = {
    contact_type: number;
    contact_value: string;        // Combined field for form input
    contact_status: number;
    is_whatsapp_number: boolean;
    contact_code?: string;
};

// Customer form combining multiple types
export type CustomerContactForm = {
    customer_code: string;
    contact_information: ContactInformation[];
    unmask_contact?: UnmaskContact;   // Nested optional type
};
```

**Guidelines:**
- Create form types when fields differ from API structure
- Use simple field names optimized for form inputs
- Combine related API fields when needed (e.g., `handphone + email` → `contact_value`)
- Use arrays for collections of items
- Mark nested types as optional when appropriate

### Pattern 3: Union Types for Status/Enums

Create literal union types for status values, avoiding magic strings:

```typescript
// Status union types
export type LeadType = "Lead" | "Qualified" | "Not Qualified" | "Proposal" | "Deal" | "Go Live" | "Deal Lost";
export type SortType = "A to Z" | "Z to A" | "Last Contacted" | "Created Date";
export type ContactStatus = "active" | "inactive" | "pending" | "archived";
```

**Benefits:**
- Type-safe status values
- IDE autocomplete for status checks
- Compile-time validation
- Self-documenting code

### Pattern 4: Generic Component Prop Types

Build reusable component prop interfaces with generics for type flexibility:

```typescript
import { JSX, ReactNode } from "react";

// Generic Column type for tables
export type Column<T> = {
    key: keyof T | string;           // Column references row data
    label: string | ReactNode;       // Display label
    fixed?: "left" | "right";        // Sticky columns
    width?: string;                  // Custom width
    sortable?: boolean;              // Enable sorting
    render?: (value: T[keyof T], row: T) => JSX.Element;  // Custom render
    getValue?: (row: T) => any;      // Extract value for sorting/filtering
};

// Use generic Column type
type ContactColumns = Column<ContactInformation>;
type UserColumns = Column<User>;
```

### Pattern 5: Form-Specific Input Types

Create validation-optimized types for form workflows:

```typescript
// Create User form inputs
export type CreateUserFormInputs = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    phone?: string | null;
};

// Update User form inputs (most fields optional)
export type UpdateUserFormInputs = {
    name: string;
    email: string;
    password?: string;           // Optional for updates
    confirmPassword?: string;
    role?: string | null;        // Can be string or null
    phone?: string | null;
};

// Forget password minimal form
export type ForgetPasswordTypes = {
    email: string;
};
```

**Patterns:**
- Create separate types for Create vs Update operations
- Mark unchanged fields as required, changed fields as optional
- Use `string | null` when field can be cleared
- Keep form types focused on form requirements, not full data models

### Pattern 6: Nested and Complex Types

Organize complex types with proper nesting for clarity:

```typescript
// Primary data type
export type ContactInformation = {
    contact_type: number;
    contact_status: number;
    is_whatsapp_number: boolean;
    contact_code?: string;
};

// Unmask/verification type
export type UnmaskContact = {
    customer_code: string;
    is_primary: boolean;
    contact_code: string;
    password: string;           // For verification/security
};

// Composite form combining types
export type CustomerContactForm = {
    customer_code: string;
    contact_information: ContactInformation[];
    unmask_contact?: UnmaskContact;  // Optional nested type
};
```

**Best practices:**
- Use nested types to group related data
- Import and reuse types to avoid duplication
- Mark composite sections as optional when appropriate
- Document complex relationships in comments

## Step-by-Step Workflows

### Workflow 1: Create API Response Type

1. **Review API documentation** - Note field names, types, and required vs optional
2. **Define base type** using `type` keyword for data models:
   ```typescript
   export type AddressInformation = {
       address_address_1: string;
       address_rt: string;
       address_country_code: string;
       address_is_primary?: boolean;
   };
   ```
3. **Use snake_case naming** - Match API field names exactly
4. **Mark optional fields** - Use `?` for nullable/optional API fields
5. **Use appropriate TypeScript types** - `number` for codes/IDs, `boolean` for flags, `string` for text
6. **Export type** - Make available to components and hooks

### Workflow 2: Create Form-Specific Type

1. **Start from API type** - Use data model as reference
2. **Identify form differences** - Which fields are combined, renamed, or restructured?
3. **Create separate form type** with optimized field names:
   ```typescript
   export type ContactInformationForm = {
       contact_type: number;
       contact_value: string;        // Combines handphone/email
       contact_status: number;
       is_whatsapp_number: boolean;
   };
   ```
4. **Keep form types focused** - Only include fields needed for the form
5. **Use react-hook-form naming** - Simple, flat structure preferred
6. **Export and integrate** with validation schemas and form components

### Workflow 3: Create Union Type for Status

1. **Identify all valid states** - List all possible status values
2. **Create literal union type**:
   ```typescript
   export type LeadStatus = "Lead" | "Qualified" | "Proposal" | "Deal" | "Go Live" | "Deal Lost";
   ```
3. **Use readonly array** for reference lists (if needed):
   ```typescript
   export const LEAD_STATUSES = ["Lead", "Qualified", "Proposal", "Deal", "Go Live", "Deal Lost"] as const;
   export type LeadStatus = typeof LEAD_STATUSES[number];
   ```
4. **Export status type** - Use throughout app for type safety
5. **Integrate with components** - Use in selects, filters, and validation

### Workflow 4: Create Generic Component Prop Type

1. **Identify type parameter** - What data type does component display/handle?
2. **Define generic type** with `<T>`:
   ```typescript
   export type Column<T> = {
       key: keyof T | string;
       label: string;
       render?: (value: T[keyof T], row: T) => JSX.Element;
   };
   ```
3. **Use keyof T** - Ensure keys match actual data properties
4. **Document template parameter** - What should T be?
5. **Create specific instances** for each usage:
   ```typescript
   type ContactColumns = Column<ContactInformation>;
   ```

## Real-World Examples

### Example 1: Contact Domain

```typescript
// API response structure
export type ContactInformation = {
    contact_type: number;           // 1=phone, 2=email, 3=whatsapp
    handphone?: string;
    email?: string;
    contact_status: number;         // 1=active, 2=inactive
    is_whatsapp_number: boolean;
    contact_code?: string;
    is_primary?: boolean;
};

// Form version optimized for input
export type ContactInformationForm = {
    contact_type: number;
    contact_value: string;          // Single input field
    contact_status: number;
    is_whatsapp_number: boolean;
    contact_code?: string;
};

// For unmask/verify operations
export type UnmaskContact = {
    customer_code: string;
    is_primary: boolean;
    contact_code: string;
    password: string;
};

// Customer form combining contacts
export type CustomerContactForm = {
    customer_code: string;
    contact_information: ContactInformation[];
    unmask_contact?: UnmaskContact;
};
```

### Example 2: Address Domain

```typescript
export interface AddressInformation {
    address_address_1: string;
    address_rt: string;
    address_rw: string;
    address_country_code: string;
    address_country_name: string;
    address_province_code: string;
    address_province_name: string;
    address_city_code: string;
    address_city_name: string;
    address_district_code: string;
    address_district_name: string;
    address_sub_district_code: string;
    address_sub_district_name: string;
    address_zipcode: string;
    address_address_type: number;
    address_is_primary?: boolean;
    address_is_same_as_id?: boolean;
}

// Form combining address with customer code
export interface FormValuesAddress {
    address_information: AddressInformation[];
    customer_code: string;
}
```

### Example 3: Status and Sort Types

```typescript
// Lead pipeline stages
export type LeadType = "Lead" | "Qualified" | "Not Qualified" | "Proposal" | "Deal" | "Go Live" | "Deal Lost";

// Sorting options
export type SortType = "A to Z" | "Z to A" | "Last Contacted" | "Created Date";

// Use in filters and queries
const handleSort = (sort: SortType) => {
    // Type-safe sorting
};
```

### Example 4: Generic Column Type

```typescript
import { JSX, ReactNode } from "react";

export type Column<T> = {
    key: keyof T | string;
    label: string | ReactNode;
    fixed?: "left" | "right";
    width?: string;
    sortable?: boolean;
    render?: (value: T[keyof T], row: T) => JSX.Element;
    getValue?: (row: T) => any;
};

// Usage in table component
interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
}

// Specific instances
type ContactColumns = Column<ContactInformation>;
type UserColumns = Column<User>;
```

### Example 5: User Management Types

```typescript
// Full user data model
export type User = {
    id?: number | string;
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string | null;
    status?: boolean;
    image?: string;
    createdDate?: string;
};

// Create new user form
export type CreateUserFormInputs = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    phone?: string | null;
};

// Update existing user (most fields optional)
export type UpdateUserFormInputs = {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    role?: string | null;
    phone?: string | null;
};

// Minimal password reset form
export type ForgetPasswordTypes = {
    email: string;
};
```

## Naming Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `TypeName` | Type/Interface names | `ContactInformation`, `User`, `AddressType` |
| `snake_case` | API field names | `contact_code`, `is_primary`, `address_country_code` |
| `camelCase` | Form field names | `contactValue`, `isWhatsapp`, `accountNumber` |
| `TypeNameForm` | Form-specific types | `ContactInformationForm`, `CreateUserFormInputs` |
| `TypeNameStatus` | Status unions | `LeadStatus`, `ContactStatus` |
| `TypeNameTypes` | Minimal/specific types | `ForgetPasswordTypes`, `OccupationForm` |
| `<T>` | Generic type parameters | `Column<T>`, `Response<T>` |

## Integration with Components

### Using Types in Components

```typescript
import { ContactInformation, ContactInformationForm } from "@/types/ContactType";
import { useContactMutation } from "@/hooks/custom/useContactMutation";

interface ContactFormProps {
    initialData?: ContactInformation;
    onSubmit: (data: ContactInformationForm) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ initialData, onSubmit }) => {
    const form = useForm<ContactInformationForm>();
    
    return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
};
```

### Using Types with Hooks

```typescript
import { ContactInformation, CustomerContactForm } from "@/types/ContactType";
import { useQuery } from "@tanstack/react-query";

// Hook returns typed data
const useContactData = (customerId: string) => {
    return useQuery<ContactInformation[]>({
        queryKey: ["contacts", customerId],
        queryFn: () => fetchContacts(customerId),
    });
};

// Hook accepts typed form data
const useContactMutation = () => {
    return useMutation<void, Error, CustomerContactForm>({
        mutationFn: (data) => submitContacts(data),
    });
};
```

### Using Types with Validation

```typescript
import { yup } from "@/lib/validation";
import { ContactInformationForm } from "@/types/ContactType";

const contactValidationSchema = yup.object().shape<ContactInformationForm>({
    contact_type: yup.number().required("Contact type required"),
    contact_value: yup.string().required("Contact value required"),
    contact_status: yup.number().required("Status required"),
    is_whatsapp_number: yup.boolean().required(),
});
```

## Best Practices

### ✅ Do's

- **Match API naming** - Use `snake_case` for API-mapped fields
- **Create form-specific types** - Don't force API types into forms
- **Use union types for statuses** - Avoid magic strings
- **Export from index files** - Create barrel exports for easy imports
- **Document complex types** - Add comments for non-obvious fields
- **Use generics for reusability** - `Column<T>`, `Response<T>`, `Pagination<T>`
- **Keep types focused** - One domain per file (Contact, Address, User, etc.)
- **Mark optional fields clearly** - Use `?` and comments to explain why optional

### ❌ Don'ts

- **Don't use `any`** - Use `unknown` or proper types
- **Don't mix API and form fields** - Create separate types
- **Don't use string unions carelessly** - Create proper union types
- **Don't over-nest types** - Keep nesting to max 2-3 levels
- **Don't forget exports** - All public types should be exported
- **Don't duplicate type definitions** - Reuse and compose types
- **Don't ignore API response structure** - Understand the source of truth

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Type not found" error | Ensure type is exported and imported with correct path |
| API field mismatches | Review API docs, verify field names match exactly (including snake_case) |
| Form validation errors | Create separate form type, ensure field names match Yup schema |
| Generic type confusion | Ensure `<T>` is used consistently; create specific instances for clarity |
| Too many optional fields | May indicate wrong type being used; review if subset type needed |
| Type conflicts across files | Consolidate related types; use consistent naming |
| Circular dependencies | Move shared types to common file; use `import type` syntax |


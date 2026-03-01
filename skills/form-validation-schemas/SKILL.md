---
name: form-validation-schemas
description: Complete guide for building form validation schemas with Yup in src/lib/validation/. Learn declarative schema definition, conditional validation based on field values, regex pattern matching, nested schemas, custom validation messages, and integration with react-hook-form. Covers all validation patterns from simple required fields to complex multi-step forms.
---

## What Are Form Validation Schemas?

Form Validation Schemas are declarative Yup objects in `src/lib/validation/` that define:

- **Field Requirements:** Which fields are required vs optional
- **Field Types:** Expected data types (string, number, boolean, date)
- **Field Constraints:** Min/max length, patterns, custom rules
- **Conditional Rules:** Different validation based on other field values
- **Error Messages:** User-friendly messages for each validation failure
- **Nested Structures:** Complex objects and arrays

These schemas are used with react-hook-form's `yupResolver` to validate forms automatically and display errors.

## When to Use

  - Creating validation schemas for form data
  - Validating form inputs before submission
  - Displaying field-specific error messages
  - Creating conditional validation (show/hide fields based on values)
  - Validating arrays of objects (multi-item forms)
  - Composing complex nested schemas
  - Integrating validation with react-hook-form
  - Validating phone numbers, emails, dates

## Prerequisites

  - Installation & Initial Setup skill completed
  - Basic TypeScript knowledge
  - Familiarity with react-hook-form library
  - Understanding of form validation concepts
  - Knowledge of regular expressions (regex)
  - Yup library installed (@3.x or higher)

## Folder Structure Overview

```
src/lib/validation/
├── contactSchema.ts        # Contact information validation
├── addressSchema.ts        # Address data validation
├── assignContactSchema.ts  # Task assignment validation
├── submitLoanSchema.ts     # Loan application validation
└── historySchema.ts        # Activity history validation
```

**Key Points:**
- One schema file per major form feature
- Export multiple schemas if same feature has multiple form variations
- Regex patterns defined at top for reuse
- Schemas compose together for complex forms
- TypeScript typing inferred from schemas

## Core Patterns

### Pattern 1: Basic Field Validation (Required/Optional)

Simple schemas with required and optional fields with type checking.

```typescript
// src/lib/validation/contactSchema.ts
import * as yup from "yup";

// Define regex patterns at top for reuse
const phoneRegExp = /^[+\dx*]{6,20}$/i;
const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Basic schema with required and optional fields
export const contactInformationSchema = yup.object({
    // Required field: must have a value
    contact_type: yup.number()
        .required(),
    
    // Optional field: can be empty or null
    contact_code: yup.string()
        .optional(),
    
    // Required string with custom error message
    contact_status: yup.number()
        .required("Status is required"),
    
    // Boolean required field
    is_whatsapp_number: yup.boolean()
        .required(),
    
    is_primary: yup.boolean()
        .required(),
});
```

**Key Characteristics:**
- `.required()` - field is mandatory
- `.optional()` - field can be empty
- `.notRequired()` - same as optional
- `.nullable()` - can be null without error
- Custom error message as parameter to `.required()`
- Type safety: `yup.number()`, `yup.string()`, `yup.boolean()`

**Usage Example:**
```typescript
import { contactInformationSchema } from "@/lib/validation/contactSchema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const form = useForm({
    resolver: yupResolver(contactInformationSchema),
    defaultValues: {
        contact_type: 1,
        is_whatsapp_number: false,
    }
});
```

---

### Pattern 2: Pattern Matching Validation (Regex)

Validate phone numbers, emails, and other formatted strings using regex.

```typescript
// src/lib/validation/contactSchema.ts
const phoneRegExp = /^[+\dx*]{6,20}$/i;
const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactInformationSchema = yup.object({
    // Phone number validation
    handphone: yup.string()
        .required("Handphone is required")
        .matches(phoneRegExp, "Must be a valid phone number (e.g. 08XXXXXXXXXX)"),
    
    // Email validation
    email: yup.string()
        .required("Email is required")
        .matches(emailRegExp, "Must be a valid email"),
});

// Alternative: Use built-in email validation
export const emailSchema = yup.object({
    email: yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
});

// Alternative: Year format validation
export const yearSchema = yup.object({
    year: yup.string()
        .matches(/^\d{4}$/, "Enter a valid year")
        .required("Year is required"),
});
```

**Key Characteristics:**
- `yup.string().matches(regex, errorMessage)` - pattern matching
- `yup.string().email()` - built-in email validation
- `yup.string().url()` - built-in URL validation
- Regex patterns stored at top for reuse
- Clear error messages describe expected format

**Common Regex Patterns:**
```typescript
// Phone: 6-20 chars with +, digits, x, *
const phoneRegExp = /^[+\dx*]{6,20}$/i;

// Email: standard format
const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Year: exactly 4 digits
const yearRegExp = /^\d{4}$/;

// Identity number: 16 digits
const idRegExp = /^\d{16}$/;

// Digits only
const digitsOnly = /^\d+$/;

// Alphanumeric only
const alphanumeric = /^[a-zA-Z0-9]+$/;
```

---

### Pattern 3: Conditional Validation (When)

Different validation rules based on another field's value.

```typescript
// src/lib/validation/contactSchema.ts
export const contactInformationFormSchema = yup.object({
    contact_type: yup.number().required(),
    
    // Validation changes based on contact_type value
    contact_value: yup.string()
        .required("Contact value is required")
        .when('contact_type', {
            is: 1, // When contact_type === 1 (Phone)
            then: schema => schema
                .matches(phoneRegExp, "Must be a valid phone number"),
            otherwise: schema => schema.when('contact_type', {
                is: 2, // When contact_type === 2 (Email)
                then: schema => schema
                    .matches(emailRegExp, "Must be a valid email"),
                otherwise: schema => schema,
            })
        }),
    
    contact_status: yup.number().required(),
    is_whatsapp_number: yup.boolean().required(),
});

// Simpler conditional: spouse name required only if married
export const submitNewLoanSchema = yup.object({
    marital_status: yup.number().required("Marital status is required"),
    
    // Only required if marital_status === 2 (Married)
    spouse_name: yup.string()
        .when("marital_status", {
            is: 2,
            then: schema => schema.required("Spouse name is required"),
            otherwise: schema => schema.notRequired(),
        }),
    
    spouse_identity_type: yup.string()
        .when("marital_status", {
            is: 2,
            then: schema => schema.required("Spouse identity type is required"),
            otherwise: schema => schema.notRequired(),
        }),
});
```

**Key Characteristics:**
- `.when(fieldName, { is, then, otherwise })` - conditional validation
- `is` can be exact value or function: `is: 1` or `is: (val) => val > 0`
- `then` schema applied when condition matches
- `otherwise` schema applied when condition doesn't match
- Can chain multiple `.when()` calls
- Enables dynamic form behavior

**Usage Pattern:**
```typescript
// Simple conditional (exact value)
.when('type', {
    is: 'phone',
    then: schema => schema.required(),
    otherwise: schema => schema.notRequired(),
})

// Conditional with function (complex logic)
.when('amount', {
    is: (amount) => amount > 10000000,
    then: schema => schema.required("High amounts need approval"),
    otherwise: schema => schema.notRequired(),
})

// Chained conditionals (nested)
.when('field1', {
    is: 'value1',
    then: schema => schema.when('field2', {
        is: 'value2',
        then: schema => schema.required(),
        otherwise: schema => schema.notRequired(),
    }),
    otherwise: schema => schema.notRequired(),
})
```

---

### Pattern 4: Nested Schema Objects and Arrays

Complex forms with nested objects and arrays of schemas.

```typescript
// src/lib/validation/contactSchema.ts
export const contactInformationSchema = yup.object({
    contact_type: yup.number().required(),
    handphone: yup.string().optional(),
    email: yup.string().optional(),
});

// Nested object: customer with array of contacts
export const customerContactSchema = yup.object({
    customer_code: yup.string().required(),
    
    // Array of contact objects
    contact_information: yup.array()
        .of(contactInformationSchema)  // Each item validated with schema
        .required(),
    
    // Nested object for unmask operation
    unmask_contact: yup.object({
        index: yup.number(),
        customer_code: yup.string(),
        contact_code: yup.string(),
        password: yup.string(),
        is_primary: yup.boolean(),
        is_whatsapp_number: yup.boolean(),
    })
});

// src/lib/validation/submitLoanSchema.ts
export const submitNewLoanSchema = yup.object({
    amount: yup.number()
        .required("Price is required")
        .moreThan(0, "Price must be greater than 0"),
    
    customer_code: yup.string().required("Customer is required"),
    customer_name: yup.string().required("Customer name is required"),
    
    // Nested collateral information (object)
    collateral_information: yup.object({
        collateral_type_code: yup.string().required("Type is required"),
        collateral_brand_code: yup.string().required("Brand is required"),
        collateral_model_code: yup.string().required("Model is required"),
        collateral_manufacture_year: yup.string().required("Year is required"),
    }).required(),
    
    // Nested address (extends existing schema)
    address_information: yup.object({
        ...addressSchema.fields,  // Reuse existing schema fields
        address_area_code: yup.string().notRequired(),
    }).required(),
});
```

**Key Characteristics:**
- `.array().of(schema)` - array of objects with same schema
- `.object({ field1, field2, ... })` - nested object
- `.min(1, message)` - array must have at least 1 item
- `...schema.fields` - spread fields to extend schema
- `.required()` on nested structures ensures they exist

**Array Validation Examples:**
```typescript
// Require at least one item
contact_information: yup.array()
    .of(contactSchema)
    .min(1, 'At least one contact required')
    .required(),

// Allow empty array
contact_information: yup.array()
    .of(contactSchema)
    .notRequired(),

// Require exactly 2 items
items: yup.array()
    .of(itemSchema)
    .length(2, 'Must have exactly 2 items')
    .required(),
```

---

### Pattern 5: Numeric and Date Validation

Validate numbers, ranges, and date constraints.

```typescript
// src/lib/validation/submitLoanSchema.ts
export const submitNewLoanSchema = yup.object({
    // Number validation
    amount: yup.number()
        .required("Amount is required")
        .moreThan(0, "Amount must be greater than 0")
        .max(10000000000, "Amount exceeds maximum limit"),
    
    gender: yup.number()
        .required("Gender is required"),
    
    identity_type: yup.number()
        .required("Identity type is required"),
    
    // String that contains date (to handle timezone safely)
    date_of_birth: yup.string()
        .required("Date of birth is required"),
    
    // String number (year as string)
    year: yup.string()
        .matches(/^\d{4}$/, "Enter a valid year")
        .required("Year is required"),
});

export const collateralInformationSchema = yup.object({
    collateral_manufacture_year: yup.string()
        .required("Manufacture year is required"),
});
```

**Key Characteristics:**
- `yup.number()` - numeric validation
- `.moreThan(value, message)` - greater than
- `.lessThan(value, message)` - less than
- `.min(value, message)` - minimum value
- `.max(value, message)` - maximum value
- Dates stored as ISO strings (timezone-safe)
- Use `.matches(/^\d{4}$/)` for year validation

**Numeric Validation Examples:**
```typescript
amount: yup.number()
    .required()
    .positive("Must be positive")
    .integer("Must be whole number")
    .moreThan(100, "Minimum 100")
    .lessThan(1000000, "Maximum 1000000"),

year: yup.number()
    .min(1900)
    .max(new Date().getFullYear()),

age: yup.number()
    .min(18, "Must be 18 or older")
    .max(100, "Invalid age"),
```

---

## Complete Workflows

### Workflow 1: Create New Simple Validation Schema

**Goal:** Add validation for a new form with basic fields

**Prerequisites:** Identify all form fields and their types

**Steps:**

1. **Create Schema File** - New file `src/lib/validation/newFeatureSchema.ts`
   ```typescript
   import * as yup from "yup";
   
   export const newFeatureSchema = yup.object({
       // Implementation
   });
   ```

2. **Define Required Fields** - Fields user must fill
   ```typescript
   export const newFeatureSchema = yup.object({
       name: yup.string()
           .required("Name is required"),
       
       email: yup.string()
           .email("Enter a valid email")
           .required("Email is required"),
       
       age: yup.number()
           .required("Age is required"),
   });
   ```

3. **Define Optional Fields** - Fields user can skip
   ```typescript
   export const newFeatureSchema = yup.object({
       name: yup.string().required("Name is required"),
       email: yup.string().email().required(),
       
       // Optional fields
       phone: yup.string().notRequired(),
       notes: yup.string().nullable(),
       middleName: yup.string().optional(),
   });
   ```

4. **Add Pattern Matching** - For formatted fields
   ```typescript
   const phoneRegExp = /^[0-9+\-\s()]{6,20}$/;
   
   export const newFeatureSchema = yup.object({
       // ... other fields
       phone: yup.string()
           .matches(phoneRegExp, "Invalid phone format")
           .required(),
   });
   ```

5. **Add Error Messages** - User-friendly validation messages
   ```typescript
   export const newFeatureSchema = yup.object({
       name: yup.string()
           .required("Please enter your full name"),
       
       email: yup.string()
           .email("Please enter a valid email address")
           .required("Email is required"),
       
       age: yup.number()
           .required("Age is required")
           .min(18, "You must be at least 18 years old"),
   });
   ```

6. **Integrate with Form** - Use in react-hook-form
   ```typescript
   import { useForm } from "react-hook-form";
   import { yupResolver } from "@hookform/resolvers/yup";
   import { newFeatureSchema } from "@/lib/validation/newFeatureSchema";
   
   const form = useForm({
       resolver: yupResolver(newFeatureSchema),
       defaultValues: {
           name: "",
           email: "",
           age: 0,
       }
   });
   ```

7. **Test Validation** - Verify all scenarios
   ```typescript
   // Valid data
   newFeatureSchema.validate({
       name: "John Doe",
       email: "john@example.com",
       age: 25
   }); // ✅ Passes
   
   // Invalid data
   newFeatureSchema.validate({
       name: "",
       email: "invalid-email",
       age: 15
   }); // ❌ Multiple errors
   ```

---

### Workflow 2: Create Conditional Validation Schema

**Goal:** Build a form where fields are required/optional based on other fields

**Prerequisites:** Understand field dependencies

**Steps:**

1. **Identify Conditional Logic** - Document which fields trigger which rules
   ```
   If payment_method === 'credit_card':
     - card_number required
     - card_holder required
     - expiry_date required
   
   If marital_status === 'married':
     - spouse_name required
     - spouse_id_number required
   ```

2. **Create Base Schema** - Start with independent fields
   ```typescript
   export const paymentSchema = yup.object({
       amount: yup.number()
           .required("Amount is required"),
       
       payment_method: yup.string()
           .required("Payment method is required"),
       
       // Will add conditional fields below
   });
   ```

3. **Add Conditional Fields** - Use `.when()` for dependencies
   ```typescript
   export const paymentSchema = yup.object({
       amount: yup.number().required(),
       payment_method: yup.string().required(),
       
       // Conditional: only required if payment_method === 'credit_card'
       card_number: yup.string()
           .when('payment_method', {
               is: 'credit_card',
               then: schema => schema.required("Card number is required"),
               otherwise: schema => schema.notRequired(),
           }),
       
       card_holder: yup.string()
           .when('payment_method', {
               is: 'credit_card',
               then: schema => schema.required("Card holder is required"),
               otherwise: schema => schema.notRequired(),
           }),
       
       // Conditional: only required if payment_method === 'bank_transfer'
       account_number: yup.string()
           .when('payment_method', {
               is: 'bank_transfer',
               then: schema => schema.required("Account number is required"),
               otherwise: schema => schema.notRequired(),
           }),
   });
   ```

4. **Handle Complex Conditions** - Use function in `.when()`
   ```typescript
   export const loanSchema = yup.object({
       loan_amount: yup.number().required(),
       loan_type: yup.string().required(),
       
       // Approval required only for large amounts
       approval_code: yup.string()
           .when('loan_amount', {
               is: (amount) => amount > 100000000,  // Function for complex logic
               then: schema => schema.required("Approval code required for large loans"),
               otherwise: schema => schema.notRequired(),
           }),
       
       // Collateral required only for loans > 50M
       collateral: yup.string()
           .when('loan_amount', {
               is: (amount) => amount > 50000000,
               then: schema => schema.required("Collateral required"),
               otherwise: schema => schema.notRequired(),
           }),
   });
   ```

5. **Test Conditional Logic** - Verify both branches work
   ```typescript
   // Test: credit_card path
   paymentSchema.validate({
       amount: 100000,
       payment_method: 'credit_card',
       card_number: '1234567890123456',
       card_holder: 'John Doe',
   }); // ✅ Valid
   
   // Test: bank_transfer path
   paymentSchema.validate({
       amount: 100000,
       payment_method: 'bank_transfer',
       account_number: '1234567890',
   }); // ✅ Valid
   
   // Test: missing required conditional field
   paymentSchema.validate({
       amount: 100000,
       payment_method: 'credit_card',
       // card_number missing!
   }); // ❌ card_number is required
   ```

---

### Workflow 3: Create Nested Array Validation Schema

**Goal:** Validate forms with multiple items (contacts, addresses)

**Prerequisites:** Schema for single item, form structure for multiple

**Steps:**

1. **Create Item Schema** - Schema for single object
   ```typescript
   export const addressItemSchema = yup.object({
       address_address_1: yup.string()
           .required('Address is required'),
       
       address_city_code: yup.string()
           .required('City is required'),
       
       address_zipcode: yup.string()
           .required('Zipcode is required'),
   });
   ```

2. **Create Form Schema** - Schema with array of items
   ```typescript
   export const addressFormSchema = yup.object({
       customer_code: yup.string()
           .required("Customer is required"),
       
       // Array of addresses
       address_information: yup.array()
           .of(addressItemSchema)  // Each item uses itemSchema
           .min(1, 'At least one address is required')
           .required(),
   });
   ```

3. **Support Dynamic Form** - Form can add/remove items
   ```typescript
   // In component:
   const form = useForm({
       resolver: yupResolver(addressFormSchema),
       defaultValues: {
           customer_code: "",
           address_information: [
               { address_address_1: "", address_city_code: "", address_zipcode: "" },
           ],
       }
   });
   
   // Add new address
   const addAddress = () => {
       form.setValue(
           "address_information",
           [
               ...form.getValues("address_information"),
               { address_address_1: "", address_city_code: "", address_zipcode: "" }
           ]
       );
   };
   ```

4. **Access Errors for Each Item** - Show field-specific errors
   ```typescript
   // In component:
   const addresses = form.watch("address_information");
   
   {addresses.map((_, index) => (
       <AddressInput
           key={index}
           index={index}
           error={form.formState.errors.address_information?.[index]}
       />
   ))}
   ```

5. **Test Array Validation** - Verify array constraints
   ```typescript
   // Valid: 1 address
   addressFormSchema.validate({
       customer_code: "CUST001",
       address_information: [
           {
               address_address_1: "Jl. Sudirman",
               address_city_code: "CGK",
               address_zipcode: "12190",
           }
       ]
   }); // ✅ Valid
   
   // Valid: 2 addresses
   addressFormSchema.validate({
       customer_code: "CUST001",
       address_information: [
           { address_address_1: "Jl. Sudirman", address_city_code: "CGK", address_zipcode: "12190" },
           { address_address_1: "Jl. Gatot", address_city_code: "TNA", address_zipcode: "15144" },
       ]
   }); // ✅ Valid
   
   // Invalid: no addresses
   addressFormSchema.validate({
       customer_code: "CUST001",
       address_information: []
   }); // ❌ At least one address required
   ```

---

### Workflow 4: Create Schema with Field-Specific Validations

**Goal:** Add custom validation beyond basic type checking

**Prerequisites:** Know validation requirements for each field

**Steps:**

1. **Identify Custom Rules** - Document special validations
   ```
   identity_number: Must be 16 digits (KTP) or specific format
   year: Must be valid (1900-now)
   email: Must not have been used before (async)
   identity_number: Must not be already registered
   ```

2. **Create Regex for Formatted Fields** - Top of schema file
   ```typescript
   // Custom regex patterns for specific formats
   const idRegExp = /^\d{16}$/;              // 16 digit ID
   const zipRegExp = /^\d{5}$/;              // 5 digit zipcode
   const accountRegExp = /^\d{10,20}$/;      // 10-20 digit account
   const identityNumberRegExp = /^\d{15,}$/; // 15+ digits
   ```

3. **Apply Pattern Matching** - Use regex in schemas
   ```typescript
   export const identitySchema = yup.object({
       identity_type: yup.number()
           .required("Identity type is required"),
       
       identity_number: yup.string()
           .required("Identity number is required")
           .when('identity_type', {
               is: 1, // KTP
               then: schema => schema
                   .matches(idRegExp, "KTP must be 16 digits"),
               otherwise: schema => schema.required(),
           }),
   });
   ```

4. **Add Range Validation** - For numeric fields
   ```typescript
   export const loanSchema = yup.object({
       loan_amount: yup.number()
           .required("Loan amount is required")
           .min(25000000, "Minimum loan is 25 million")
           .max(2000000000, "Maximum loan is 2 billion"),
       
       loan_term: yup.number()
           .required("Loan term is required")
           .min(12, "Minimum 12 months")
           .max(84, "Maximum 84 months"),
       
       manufacturing_year: yup.number()
           .min(2000, "Minimum year is 2000")
           .max(new Date().getFullYear(), "Cannot be future year"),
   });
   ```

5. **Add Custom Validation** - Using `.test()`
   ```typescript
   export const paymentSchema = yup.object({
       amount: yup.number()
           .required()
           .test(
               'amount-multiple',
               'Amount must be multiple of 1000',
               (value) => value % 1000 === 0
           ),
       
       expiration_date: yup.string()
           .test(
               'not-expired',
               'Card has expired',
               (value) => {
                   if (!value) return false;
                   const [month, year] = value.split('/');
                   const expiry = new Date(+year, +month - 1);
                   return expiry > new Date();
               }
           ),
   });
   ```

---

### Workflow 5: Create Complex Multi-Step Form Schema

**Goal:** Validate entire multi-step form with shared fields

**Prerequisites:** Identify steps and cross-step validation

**Steps:**

1. **Create Schemas for Each Step** - Individual step validation
   ```typescript
   // Step 1: Basic Information
   export const step1Schema = yup.object({
       name: yup.string().required("Name is required"),
       email: yup.string().email().required(),
       phone: yup.string().required(),
   });
   
   // Step 2: Address Information
   export const step2Schema = yup.object({
       address: yup.string().required(),
       city: yup.string().required(),
       zipcode: yup.string().required(),
   });
   
   // Step 3: Loan Details
   export const step3Schema = yup.object({
       amount: yup.number().required().moreThan(0),
       purpose: yup.string().required(),
       term: yup.number().required(),
   });
   ```

2. **Create Complete Schema** - All steps combined
   ```typescript
   export const multiStepLoanSchema = yup.object({
       // Step 1
       name: yup.string().required("Name is required"),
       email: yup.string().email().required("Email required"),
       phone: yup.string().required("Phone required"),
       
       // Step 2
       address: yup.string().required("Address required"),
       city: yup.string().required("City required"),
       zipcode: yup.string().required("Zipcode required"),
       
       // Step 3
       amount: yup.number().required().moreThan(0),
       purpose: yup.string().required(),
       term: yup.number().required(),
       
       // Optional: collateral conditional
       collateral: yup.string()
           .when('amount', {
               is: (amount) => amount > 100000000,
               then: schema => schema.required("Collateral required for large loans"),
               otherwise: schema => schema.notRequired(),
           }),
   });
   ```

3. **Step-Specific Validation** - Validate only current step
   ```typescript
   // Only validate current step fields
   const validateStep = async (stepNumber: number) => {
       try {
           if (stepNumber === 1) {
               await step1Schema.validate({
                   name,
                   email,
                   phone,
               });
           } else if (stepNumber === 2) {
               await step2Schema.validate({
                   address,
                   city,
                   zipcode,
               });
           } else {
               await step3Schema.validate({
                   amount,
                   purpose,
                   term,
               });
           }
           return true;
       } catch (error) {
           setError(error.message);
           return false;
       }
   };
   ```

4. **Final Submission** - Validate entire form
   ```typescript
   const handleSubmit = async () => {
       try {
           // Validate complete form
           const validData = await multiStepLoanSchema.validate({
               name, email, phone,
               address, city, zipcode,
               amount, purpose, term,
               collateral,
           });
           
           // Submit to API
           await submitLoan(validData);
       } catch (error) {
           setError(error.message);
       }
   };
   ```

---

## Advanced Patterns

### Pattern A: Custom Async Validation

Validate against server data (check duplicates, availability).

```typescript
// Check if email already registered
export const userSchema = yup.object({
    email: yup.string()
        .email()
        .required()
        .test(
            'email-exists',
            'This email is already registered',
            async (value) => {
                if (!value) return true;
                try {
                    const response = await fetch(`/api/check-email?email=${value}`);
                    const { exists } = await response.json();
                    return !exists;  // Valid if NOT exists
                } catch {
                    return true;  // Skip validation on error
                }
            }
        ),
});

// Check if phone number is available
export const contactSchema = yup.object({
    phone: yup.string()
        .required()
        .test(
            'phone-available',
            'This phone is already in use',
            async (value) => {
                const { available } = await checkPhoneAvailability(value);
                return available;
            }
        ),
});
```

---

### Pattern B: Cross-Field Validation

Validate one field based on another field's value.

```typescript
export const passwordSchema = yup.object({
    password: yup.string()
        .min(8, "Password must be at least 8 characters")
        .required(),
    
    confirm_password: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required("Confirm password is required"),
});

export const dateRangeSchema = yup.object({
    start_date: yup.string()
        .required("Start date is required"),
    
    end_date: yup.string()
        .required("End date is required")
        .test(
            'end-after-start',
            'End date must be after start date',
            function(value) {
                const { start_date } = this.parent;
                return new Date(value) > new Date(start_date);
            }
        ),
});
```

---

### Pattern C: Dynamic Schema Generation

Create schemas programmatically based on configuration.

```typescript
type FieldConfig = {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    pattern?: RegExp;
    message?: string;
};

export function createDynamicSchema(fields: FieldConfig[]) {
    const schemaObj: any = {};
    
    fields.forEach(field => {
        let fieldSchema;
        
        if (field.type === 'string') {
            fieldSchema = yup.string();
            if (field.pattern) {
                fieldSchema = fieldSchema.matches(field.pattern, field.message);
            }
        } else if (field.type === 'number') {
            fieldSchema = yup.number();
        } else if (field.type === 'boolean') {
            fieldSchema = yup.boolean();
        }
        
        if (field.required) {
            fieldSchema = fieldSchema.required(`${field.name} is required`);
        } else {
            fieldSchema = fieldSchema.notRequired();
        }
        
        schemaObj[field.name] = fieldSchema;
    });
    
    return yup.object(schemaObj);
}

// Usage
const fields: FieldConfig[] = [
    { name: 'email', type: 'string', required: true, pattern: emailRegExp },
    { name: 'age', type: 'number', required: true },
    { name: 'newsletter', type: 'boolean', required: false },
];

const dynamicSchema = createDynamicSchema(fields);
```

---

## Best Practices

### 1. Define Regex Patterns at Top of File
```typescript
// ✅ GOOD: Patterns defined once
const phoneRegExp = /^[+\dx*]{6,20}$/i;
const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactSchema = yup.object({
    phone: yup.string().matches(phoneRegExp, "Invalid phone"),
    email: yup.string().matches(emailRegExp, "Invalid email"),
});

// ❌ AVOID: Regex defined inline
export const contactSchema = yup.object({
    phone: yup.string().matches(/^[+\dx*]{6,20}$/i, "Invalid phone"),
    email: yup.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
});
```

---

### 2. Use Clear, User-Friendly Error Messages
```typescript
// ✅ GOOD: Specific, actionable messages
export const contactSchema = yup.object({
    phone: yup.string()
        .required("Phone number is required")
        .matches(phoneRegExp, "Phone must be 6-20 digits (e.g., 08123456789)"),
    
    email: yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
});

// ❌ AVOID: Vague messages
export const contactSchema = yup.object({
    phone: yup.string().required("Phone error"),
    email: yup.string().required("Email error"),
});
```

---

### 3. Compose Schemas for Reuse
```typescript
// ✅ GOOD: Create base schema, then extend
export const addressBaseSchema = yup.object({
    address: yup.string().required(),
    city: yup.string().required(),
    zipcode: yup.string().required(),
});

export const addressFormSchema = yup.object({
    customer_code: yup.string().required(),
    address_information: yup.array()
        .of(addressBaseSchema)
        .required(),
});

// ❌ AVOID: Duplicate validation logic
export const addressFormSchema = yup.object({
    address: yup.string().required(),
    city: yup.string().required(),
    zipcode: yup.string().required(),
    customer_code: yup.string().required(),
});
```

---

### 4. Use TypeScript Inference for Data Types
```typescript
// ✅ GOOD: Type safety from schema
export const contactSchema = yup.object({
    name: yup.string().required(),
    age: yup.number().required(),
    email: yup.string().email().required(),
});

type Contact = yup.InferType<typeof contactSchema>;

// TypeScript knows types:
// type Contact = { name: string; age: number; email: string }
```

---

### 5. Organize Related Schemas Together
```typescript
// ✅ GOOD: Related schemas in same file
// contactSchema.ts
export const contactInformationSchema = yup.object({ /* ... */ });
export const contactInformationFormSchema = yup.object({ /* ... */ });
export const customerContactSchema = yup.object({ /* ... */ });

// ❌ AVOID: Scattered across files
// file1.ts: contactInformationSchema
// file2.ts: contactInformationFormSchema
// file3.ts: customerContactSchema
```

---

### 6. Handle Nullability Explicitly
```typescript
// ✅ GOOD: Clear nullable intent
export const contactSchema = yup.object({
    phone: yup.string().nullable().notRequired(),
    notes: yup.string().nullable(),
    email: yup.string().required(),
});

// ❌ AVOID: Unclear null handling
export const contactSchema = yup.object({
    phone: yup.string().optional(),
    notes: yup.string(),
});
```

---

## Troubleshooting

### Issue: "Field is required" Even When Filled

**Cause:** Validation runs before form state updates

**Solution:** Ensure form state is properly connected to schema
```typescript
const form = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',  // Validate on blur, not on render
    defaultValues: {
        email: "",  // Ensure default matches schema
    }
});

// Or use mode: 'onChange' for real-time validation
const form = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
});
```

---

### Issue: Conditional Field Always Required

**Cause:** Conditional logic has wrong `is` value

**Solution:** Verify condition matches exactly
```typescript
// Debug: Log the value being checked
const schemaWithDebug = yup.object({
    marital_status: yup.number().required(),
    spouse_name: yup.string()
        .when('marital_status', {
            // Check what value is actually being passed
            is: (val) => {
                console.log('marital_status value:', val);
                return val === 2;  // Ensure this is the correct value
            },
            then: schema => schema.required("Spouse name required"),
            otherwise: schema => schema.notRequired(),
        }),
});
```

---

### Issue: Array Validation Error Message Unhelpful

**Cause:** Error message from Yup doesn't show which item failed

**Solution:** Handle array errors specifically
```typescript
// In component:
const addressErrors = form.formState.errors.address_information;

{addresses.map((address, index) => (
    <div key={index}>
        <AddressInput 
            index={index}
            error={addressErrors?.[index]}
        />
        {addressErrors?.[index]?.address && (
            <span>{addressErrors[index].address?.message}</span>
        )}
    </div>
))}
```

---

### Issue: Custom Test Never Validates

**Cause:** `.test()` result is not a boolean

**Solution:** Ensure `.test()` returns boolean or Promise<boolean>
```typescript
// ❌ WRONG: Returns undefined
export const schema = yup.object({
    email: yup.string().test(
        'unique-email',
        'Email taken',
        (value) => {
            checkEmailExists(value);  // Forgot return!
        }
    ),
});

// ✅ CORRECT: Returns boolean
export const schema = yup.object({
    email: yup.string().test(
        'unique-email',
        'Email taken',
        async (value) => {
            const exists = await checkEmailExists(value);
            return !exists;  // Return boolean
        }
    ),
});
```

---

### Issue: Nested Schema Fields Not Validating

**Cause:** Schema fields not properly defined in nested object

**Solution:** Ensure nested schema has all required fields
```typescript
// ❌ WRONG: Missing field in nested schema
export const submitSchema = yup.object({
    collateral: yup.object({
        type: yup.string().required(),
        // Missing brand field!
    }),
});

// ✅ CORRECT: All fields defined
export const submitSchema = yup.object({
    collateral: yup.object({
        type: yup.string().required(),
        brand: yup.string().required(),
        model: yup.string().required(),
    }),
});
```

---

## Related Skills

**Prerequisites**
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For typing form schemas and API responses

**Often Used Together**
- [reusable-ui-components](../reusable-ui-components/SKILL.md) - Form input components that use yupResolver with these schemas
- [feature-specific-business-logic](../feature-specific-business-logic/SKILL.md) - Features containing forms using these validation schemas

**Can Reference**
- [constants-static-data](../constants-static-data/SKILL.md) - For form option constants in conditional validation

## References

### External Documentation
- **Yup Documentation:** https://github.com/jquense/yup - Schema validation
- **react-hook-form:** https://react-hook-form.com/ - Form state management
- **@hookform/resolvers:** https://github.com/react-hook-form/resolvers

### Dependencies Used
```json
{
  "yup": "^1.6.1",
  "react-hook-form": "^7.54.2",
  "@hookform/resolvers": "^3.3.4"
}
```

### Related Code Files
- `src/lib/validation/contactSchema.ts` - Contact validation
- `src/lib/validation/addressSchema.ts` - Address validation
- `src/lib/validation/assignContactSchema.ts` - Task assignment validation
- `src/lib/validation/submitLoanSchema.ts` - Loan submission validation
- `src/lib/validation/historySchema.ts` - History recording validation

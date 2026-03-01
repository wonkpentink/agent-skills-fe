---
name: reusable-ui-components
description: 'Complete guide for building presentational UI components in the src/components/ folder. Use when creating Button, Input, Modal, Avatar, Table, Tabs, Tooltip, or other reusable components. Learn component structure, TypeScript patterns, state management, styling with Tailwind, and integration with react-hook-form. Includes step-by-step workflows, prop design patterns, and real-world examples from the codebase.'
---

# Reusable UI Components

Complete guide for building presentational, reusable UI components that are used across multiple features and pages.

## When to Use This Skill

- Creating new reusable UI components (buttons, inputs, modals, etc.)
- Building component libraries for consistent design system
- Designing component props and TypeScript interfaces
- Integrating components with form libraries (react-hook-form)
- Implementing component variants and styling strategies
- Adding features to existing components (loading states, disabled states, etc.)
- Documenting component APIs and usage patterns

## Prerequisites

- Basic React & TypeScript knowledge
- Understanding of component composition
- Familiarity with Tailwind CSS
- Node.js and npm installed
- IDE with TypeScript support

## Core Component Structure

All UI components in `src/components/` follow a consistent pattern:

### File Organization

```
src/components/
├── component-name/
│   ├── ComponentName.tsx      # Main component file
│   ├── index.ts               # Optional named export
│   └── types.ts               # Optional prop types (if complex)
└── Button.tsx                 # Simple components (root level)
```

### Component Pattern: TypeScript Functional Component

```typescript
import React from 'react'

// 1. Define Props Interface
interface ComponentNameProps {
  // Required props
  label: string | ReactNode
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  
  // Callback props
  onClick?: () => void
  onHover?: (isHover: boolean) => void
}

// 2. Implement Component
const ComponentName: React.FC<ComponentNameProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  onHover,
}) => {
  // 3. Define styles/classes
  const variantClasses = {
    primary: 'bg-[#F68833] text-white',
    secondary: 'bg-gray-200 text-black',
    outline: 'bg-white border border-gray-300 text-black',
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // 4. Render component
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
        transition-all duration-200
      `}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {label}
    </button>
  )
}

export default ComponentName
```

## Workflow: Creating a New Component

### Step 1: Plan Component Requirements

Before writing code, define:

**What is the component's purpose?**
- Single responsibility principle
- What problem does it solve?
- Where will it be used?

**What props does it need?**
- Required vs optional
- Prop types and defaults
- Callback functions (onClick, onChange, etc.)

**What variants/states does it have?**
- Visual variants (primary, secondary, danger)
- Size variants (sm, md, lg)
- States (disabled, loading, active, error)

### Step 2: Create Folder Structure

```bash
# For complex components with sub-components or styles
mkdir -p src/components/component-name
cd src/components/component-name

# Create files
touch ComponentName.tsx
touch index.ts
```

### Step 3: Define TypeScript Props Interface

Always define a clear props interface following conventions:

```typescript
// ✅ GOOD: Clear, well-organized props
interface ButtonProps {
  // Content
  label: string | ReactNode
  icon?: ReactNode
  
  // Styling
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  
  // State
  disabled?: boolean
  loading?: boolean
  
  // Callbacks
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

// ❌ AVOID: Unclear, unorganized props
interface BadButtonProps {
  l?: string
  v?: string
  s?: number
  cls?: string
  onClick?: any
}
```

### Step 4: Implement Component with Variants

Use variant pattern for styling multiple component states:

```typescript
interface InputFieldProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number'
  value?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  onChange?: (value: string) => void
  placeholder?: string
  maxLength?: number
  prefix?: ReactNode
  className?: string
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = 'text',
  value = '',
  disabled = false,
  error = false,
  errorMessage,
  onChange,
  placeholder = '',
  maxLength,
  prefix,
  className = '',
}) => {
  // Base classes
  const baseClasses = 'px-3 py-2 border rounded transition-colors'
  
  // Variant classes for states
  const borderClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:ring-blue-500'

  const bgClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed'
    : 'bg-white'

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            ${baseClasses}
            ${borderClasses}
            ${bgClasses}
            ${prefix ? 'pl-8' : ''}
            ${className}
          `}
        />
      </div>
      {error && errorMessage && (
        <span className="text-xs text-red-500 mt-1">
          {errorMessage}
        </span>
      )}
    </div>
  )
}

export default InputField
```

### Step 5: Handle Form Integration (react-hook-form)

For form components, integrate with react-hook-form `Controller`:

```typescript
import { Controller, Control, FieldValues, Path } from 'react-hook-form'

interface FormInputProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string
  placeholder?: string
  required?: boolean
  type?: string
  disabled?: boolean
}

const FormInput = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required = false,
  type = 'text',
  disabled = false,
}: FormInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ 
        required: required ? `${label} is required` : false 
      }}
      render={({ field, fieldState: { error } }) => (
        <div>
          {label && (
            <label className="block text-sm font-medium mb-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100' : 'bg-white'}
            `}
          />
          {error && (
            <span className="text-xs text-red-500 mt-1">
              {error.message}
            </span>
          )}
        </div>
      )}
    />
  )
}

export default FormInput
```

### Step 6: Advanced Patterns

#### Pattern 1: Component with Config/Options

```typescript
// Define configuration outside component
const BUTTON_STYLES = {
  primary: {
    bg: 'bg-[#F68833]',
    text: 'text-white',
    hover: 'hover:bg-[#E67D2D]',
  },
  secondary: {
    bg: 'bg-gray-200',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-300',
  },
  outline: {
    bg: 'bg-white',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-50',
    border: 'border border-gray-300',
  },
} as const

type ButtonStyle = keyof typeof BUTTON_STYLES

interface ButtonProps {
  label: string
  style?: ButtonStyle
  onClick?: () => void
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  style = 'primary', 
  onClick 
}) => {
  const styles = BUTTON_STYLES[style]
  
  return (
    <button
      className={`px-4 py-2 rounded transition ${styles.bg} ${styles.text} ${styles.hover} ${styles.border || ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default Button
```

#### Pattern 2: Component with Utility Functions

```typescript
// Utility functions defined outside component
function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 70%, 80%)`
}

function getInitials(name: string): string {
  const names = name.trim().split(/\s+/).filter(Boolean)
  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase()
  }
  return (names[0][0] + names[1][0]).toUpperCase()
}

interface AvatarInitialProps {
  name: string
  size?: number
  fontSize?: number
  className?: string
}

const AvatarInitial: React.FC<AvatarInitialProps> = ({
  name,
  size = 24,
  fontSize = 12,
  className = '',
}) => {
  const initials = getInitials(name)
  const bgColor = stringToColor(name)

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: '600',
      }}
      className={className}
    >
      {initials}
    </div>
  )
}

export default AvatarInitial
```

#### Pattern 3: Component with States (Loading, Disabled, Error)

```typescript
interface SubmitButtonProps {
  label: string
  loading?: boolean
  disabled?: boolean
  error?: boolean
  onClick?: () => void
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  loading = false,
  disabled = false,
  error = false,
  onClick,
}) => {
  const isDisabled = disabled || loading

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  const bgColor = error ? 'bg-red-600' : 'bg-[#F68833]'
  const cursorClass = isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        px-4 py-2 rounded text-white
        ${bgColor}
        ${cursorClass}
        flex items-center justify-center gap-2
        transition-all duration-200
      `}
    >
      {loading && <Spinner />}
      <span>{loading ? 'Loading...' : label}</span>
    </button>
  )
}

export default SubmitButton
```

### Step 7: Export Component

Create `index.ts` for named exports:

```typescript
// src/components/component-name/index.ts
export { default as ComponentName } from './ComponentName'
export type { ComponentNameProps } from './types' // if using separate types file

// Or in root level for simple components
// export { default as Button } from './Button'
```

### Step 8: Use Component in Features/Pages

```typescript
// In a feature or page component
import { Button } from '@/components/button'
import InputField from '@/components/input/InputField'

function MyFeature() {
  return (
    <div>
      <InputField 
        name="email"
        label="Email"
        placeholder="Enter email"
        type="email"
      />
      <Button 
        label="Submit"
        variant="primary"
        size="md"
        onClick={() => console.log('Clicked')}
      />
    </div>
  )
}

export default MyFeature
```

## Best Practices

### ✅ DO

- **Single Responsibility** - Each component does one thing well
- **Type Everything** - Use TypeScript interfaces for props
- **Provide Defaults** - Default values for optional props
- **Use Composition** - Build complex components from simpler ones
- **Extract Variants** - Use configuration objects for styling variants
- **Support Customization** - Accept `className` prop for extensions
- **Document Props** - Clear prop naming and JSDoc comments
- **Test Accessibility** - Add `aria-*` attributes where relevant
- **Handle Edge Cases** - Loading states, disabled states, error states
- **Keep Components Simple** - No business logic, only presentation

### ❌ AVOID

- **Props Drilling Too Deep** - Keep component depth shallow
- **Inline Complex Logic** - Extract helper functions outside component
- **Hard-coded Values** - Use configuration objects instead
- **Global State in Components** - Components should be pure
- **Mixing Concerns** - Don't mix UI and business logic
- **Overly Generic Props** - Be specific with prop types
- **Poor Naming** - Use clear, descriptive names (not `c`, `v`, `cls`)
- **Ignoring Accessibility** - Always consider a11y attributes
- **Missing Prop Validation** - Use TypeScript interfaces

## Common Component Examples

### Simple Button Component

```typescript
interface ButtonProps {
  label: string | ReactNode
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
}) => {
  const variants = {
    primary: 'bg-[#F68833] text-white hover:bg-[#E67D2D]',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    outline: 'bg-white border border-gray-300 text-black hover:bg-gray-50',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        flex items-center justify-center gap-2 rounded transition
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="animate-spin">⌛</span>}
      {icon && !loading && icon}
      {label}
    </button>
  )
}

export default Button
```

### Modal Component with Portal

```typescript
import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  size = 'md',
  footer,
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-lg shadow-lg ${sizeClasses[size]}`}>
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 p-6 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
```

## Troubleshooting

### Component not re-rendering when props change

**Cause**: Using `React.memo()` incorrectly or complex prop objects
**Solution**: 
```typescript
// Remove React.memo if props are objects/functions
// Or use useMemo for stable prop references
const MyComponent = React.memo(({ items }: Props) => {
  // components
})
```

### Prop validation errors in TypeScript

**Cause**: Missing or incorrect prop type definitions
**Solution**:
```typescript
// ✅ Correct - Define clear interfaces
interface MyComponentProps {
  name: string
  age?: number
  onClick?: () => void
}

const MyComponent: React.FC<MyComponentProps> = (props) => {}
```

### Styling conflicts between components

**Cause**: Overly specific CSS classes or conflicting Tailwind
**Solution**:
```typescript
// Use className prop for customization
<Component className="custom-override" />

// In component, append className at end to allow overrides
<div className={`base-classes ${className}`}>
```

### Component too large/complex

**Cause**: Mixing too many responsibilities
**Solution**: Split into smaller, focused components
```typescript
// Break down into sub-components
const Modal = ({ children, onClose }) => {
  return (
    <div>
      <ModalHeader onClose={onClose} />
      <ModalBody>{children}</ModalBody>
      <ModalFooter />
    </div>
  )
}
```

## Related Skills

**Prerequisites**
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For component prop interfaces and type safety

**Often Used Together**
- [theme-replication](../theme-replication/SKILL.md) - For consistent design tokens and styling
- [form-validation-schemas](../form-validation-schemas/SKILL.md) - For integration with form validation in components

**Can Reference**
- [constants-static-data](../constants-static-data/SKILL.md) - For component option data and configuration
- [static-files-assets](../static-files-assets/SKILL.md) - For icons and images used in components

## References

- [React Functional Components](https://react.dev/learn#components)
- [TypeScript React Components](https://www.typescriptlang.org/docs/handbook/react.html)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs)
- [react-hook-form Integration](https://react-hook-form.com/)
- [Component Design Patterns](https://patterns.dev/posts/react-patterns)

/**
 * Component Examples: Before & After Using Theme
 * 
 * This file demonstrates how to refactor components from hardcoded colors
 * to using the centralized theme configuration.
 * 
 * Each example shows:
 *   - BEFORE: Original component with hardcoded color values
 *   - AFTER: Refactored component using theme.ts
 */

// @ts-nocheck

import { theme, getAvatarColor, getStatusColor, getBadgeColor } from '@/lib/config/theme'

// ============================================================================
// Example 1: Avatar Component - Avatar Initials with Color Rotation
// ============================================================================

/**
 * BEFORE: Hardcoded color palette scattered in component
 * 
 * Location: src/features/layouts/sidebar/Avatar.tsx (original)
 */
const AvatarComponentBEFORE = ({ name }: { name: string }) => {
  // Colors hardcoded directly in component ❌
  const colors = [
    '#F68833', '#8E63F7', '#1DAEFF', '#FE7062', '#56CA00',
    '#FFB400', '#00B9AE', '#AB47BC', '#F06292', '#90A4AE',
  ]
  
  const color = colors[name.length % colors.length]
  
  return (
    <div
      style={{
        background: color,
        color: '#fff',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/**
 * AFTER: Using centralized theme configuration
 * 
 * Location: src/features/layouts/sidebar/Avatar.tsx (refactored)
 */
const AvatarComponentAFTER = ({ name }: { name: string }) => {
  // Color comes from theme, single source of truth ✓
  const color = getAvatarColor(name.length)
  
  return (
    <div
      style={{
        background: color,
        color: '#fff',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ============================================================================
// Example 2: Status Badge - Badge with Status Color and Background
// ============================================================================

/**
 * BEFORE: Status colors hardcoded in StyleSheet format
 * 
 * Location: src/components/statusBadge/StatusBadge.tsx (original)
 */
type StatusType = 'assigned' | 'pending' | 'danger'

const StatusBadgeBEFORE = ({ status, label }: { status: StatusType; label: string }) => {
  // Hardcoded status color styles ❌
  const statusStyles: Record<StatusType, { bg: string; text: string }> = {
    assigned: {
      bg: '#E9F7EF',
      text: 'text-green-500',
    },
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-500',
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-500',
    },
  }
  
  const styles = statusStyles[status]
  
  return (
    <span
      className={`px-3 py-1 rounded-md font-medium ${styles.text}`}
      style={{ backgroundColor: styles.bg }}
    >
      {label}
    </span>
  )
}

/**
 * AFTER: Using theme configuration with helper function
 * 
 * Location: src/components/statusBadge/StatusBadge.tsx (refactored)
 */
const StatusBadgeAFTER = ({ status, label }: { status: StatusType; label: string }) => {
  // Status styles come from theme helper function ✓
  const styles = getBadgeColor(status)
  
  return (
    <span
      className={`px-3 py-1 rounded-md font-medium ${styles.text}`}
      style={{ backgroundColor: styles.bg }}
    >
      {label}
    </span>
  )
}

// ============================================================================
// Example 3: Button Component - Primary and Outline Variants
// ============================================================================

/**
 * BEFORE: Button variants with hardcoded colors
 * 
 * Location: src/components/button/Button.tsx (original)
 */
interface ButtonProps {
  variant?: 'primary' | 'outline' | 'primary-outline'
  children: React.ReactNode
}

const ButtonComponentBEFORE = ({ variant = 'primary', children }: ButtonProps) => {
  // Hardcoded color values in variant styles ❌
  const classStyles = {
    primary: 'bg-[#F68833] text-white hover:bg-[#EF6C00]',
    outline: 'bg-white border-[#ECECEC] border text-black hover:bg-gray-50',
    'primary-outline': 'bg-white border-[#F68833] border text-[#F68833] hover:bg-[#FEF3EB]',
  }
  
  return <button className={classStyles[variant]}>{children}</button>
}

/**
 * AFTER: Button variants using theme colors
 * 
 * Location: src/components/button/Button.tsx (refactored)
 */
const ButtonComponentAFTER = ({ variant = 'primary', children }: ButtonProps) => {
  // Button colors derived from theme ✓
  const getButtonClass = () => {
    switch (variant) {
      case 'primary':
        return `bg-[${theme.colors.primary.main}] text-white hover:bg-[${theme.colors.primary.dark}]`
      case 'outline':
        return `bg-white border-[${theme.colors.neutral.border}] border text-black hover:bg-gray-50`
      case 'primary-outline':
        return `bg-white border-[${theme.colors.primary.main}] border text-[${theme.colors.primary.main}] hover:bg-[${theme.colors.primary.light}]`
    }
  }
  
  return <button className={getButtonClass()}>{children}</button>
}

// ============================================================================
// Example 4: Loan Status Component - Status Label with Color
// ============================================================================

/**
 * BEFORE: Status colors hardcoded with manual mapping
 * 
 * Location: src/features/contacts/detail/GetStatusStyle.tsx (original)
 */
type LoanStatus = 'new' | 'deal' | 'rejected' | 'default'

const LoanStatusComponentBEFORE = ({ status }: { status: LoanStatus }) => {
  // Status color mapping hardcoded ❌
  const styleMap: Record<LoanStatus, { color: string; bg: string }> = {
    new: { color: '#4285F4', bg: '#ECF3FE' },
    deal: { color: '#27AE60', bg: '#E9F7EF' },
    rejected: { color: '#E40000', bg: '#FCE6E6' },
    default: { color: '#344054', bg: '#F2F4F7' },
  }
  
  const style = styleMap[status]
  
  return (
    <div style={{ color: style.color, background: style.bg, padding: '8px', borderRadius: '4px' }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

/**
 * AFTER: Using theme helper function for status colors
 * 
 * Location: src/features/contacts/detail/GetStatusStyle.tsx (refactored)
 */
const LoanStatusComponentAFTER = ({ status }: { status: LoanStatus }) => {
  // Status styling from theme helper ✓
  const style = getStatusColor(status)
  
  return (
    <div style={{ color: style.color, background: style.bg, padding: '8px', borderRadius: '4px' }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

// ============================================================================
// Example 5: Input Field Component - Prefix Color Based on Type
// ============================================================================

/**
 * BEFORE: Dynamic color selection with hardcoded values
 * 
 * Location: src/components/input/InputField.tsx (original)
 */
interface InputFieldProps {
  prefix?: string
  prefixColor?: string
  value: string
  onChange: (value: string) => void
}

const InputFieldComponentBEFORE = ({
  prefix,
  prefixColor = '#F68833',
  value,
  onChange,
}: InputFieldProps) => {
  // Default prefix color hardcoded ❌
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECECEC', borderRadius: '4px' }}>
      {prefix && (
        <span style={{ color: prefixColor, marginRight: '8px', fontWeight: 500 }}>
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: 'none', padding: '8px' }}
      />
    </div>
  )
}

/**
 * AFTER: Using theme color for input prefix
 * 
 * Location: src/components/input/InputField.tsx (refactored)
 */
const InputFieldComponentAFTER = ({
  prefix,
  prefixColor = theme.colors.primary.main, // Theme color as default ✓
  value,
  onChange,
}: InputFieldProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${theme.colors.neutral.border}`, // Theme border ✓
        borderRadius: '4px',
      }}
    >
      {prefix && (
        <span style={{ color: prefixColor, marginRight: '8px', fontWeight: 500 }}>
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: 'none', padding: '8px' }}
      />
    </div>
  )
}

// ============================================================================
// Example 6: Filter Badge Component - Filter Tag with Color
// ============================================================================

/**
 * BEFORE: Color selected manually with string interpolation
 * 
 * Location: src/components/filter/FilterBadge.tsx (original)
 */
const FilterBadgeBEFORE = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  // Hardcoded styles ❌
  return (
    <div
      style={{
        backgroundColor: '#FEF3EB',
        color: '#F68833',
        padding: '6px 12px',
        borderRadius: '20px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#F68833', cursor: 'pointer' }}>
        ✕
      </button>
    </div>
  )
}

/**
 * AFTER: Using theme primary colors for filter badge
 * 
 * Location: src/components/filter/FilterBadge.tsx (refactored)
 */
const FilterBadgeAFTER = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  // Badge colors from theme ✓
  return (
    <div
      style={{
        backgroundColor: theme.colors.primary.light,
        color: theme.colors.primary.main,
        padding: '6px 12px',
        borderRadius: '20px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: theme.colors.primary.main,
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  )
}

// ============================================================================
// Summary: Key Observations
// ============================================================================

/**
 * Key Benefits of Using Theme Configuration:
 * 
 * ✅ Single Source of Truth: All colors defined in one file (theme.ts)
 * ✅ Consistency: Same colors reused across all components automatically
 * ✅ Type Safety: TypeScript ensures color tokens exist before use
 * ✅ Maintainability: Update one color value, affects entire app
 * ✅ Reusability: Theme can be exported and used in other projects
 * ✅ Extensibility: Easy to add new colors or create dark mode
 * ✅ Testing: Theme object can be mocked in tests
 * ✅ Documentation: Theme structure serves as visual specification
 * 
 * Migration Path:
 * 1. Start with theme.ts containing all extracted colors
 * 2. Update high-impact components first (Button, Avatar, Badge)
 * 3. Gradually refactor remaining components
 * 4. Remove hardcoded color values from codebase
 * 5. Use theme helpers for common patterns (getAvatarColor, getStatusColor)
 */

// Export examples for documentation purposes
export {
  AvatarComponentBEFORE,
  AvatarComponentAFTER,
  StatusBadgeBEFORE,
  StatusBadgeAFTER,
  ButtonComponentBEFORE,
  ButtonComponentAFTER,
  LoanStatusComponentBEFORE,
  LoanStatusComponentAFTER,
  InputFieldComponentBEFORE,
  InputFieldComponentAFTER,
  FilterBadgeBEFORE,
  FilterBadgeAFTER,
}

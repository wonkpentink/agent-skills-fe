/**
 * Theme Configuration Template
 * 
 * This is a complete implementation of the SMSF Frontend CRM theme,
 * extracted and centralized from the current codebase.
 * 
 * Usage:
 *   1. Copy this file to src/lib/config/theme.ts in your project
 *   2. Import in components: import { theme } from '@/lib/config/theme'
 *   3. Reference colors: theme.colors.primary.main, theme.colors.status.new.color, etc.
 * 
 * To customize:
 *   - Modify hex values directly in the appropriate color group
 *   - Add new color groups following the same pattern
 *   - Keep semantic naming (primary, status, etc.)
 */

// @ts-nocheck

import type { Theme } from '@/types/theme-types'

/**
 * Centralized Theme Object
 * Contains all design tokens: colors, typography, spacing, border-radius
 */
export const theme: Theme = {
  /**
   * Color Palette
   * Organized by purpose: primary, secondary, status, avatar, badge, neutral
   */
  colors: {
    /**
     * Primary brand colors
     * Used for main actions, links, and primary UI elements
     */
    primary: {
      main: '#F68833',      // Primary orange - main brand color
      dark: '#EF6C00',      // Darker variant for hover/active states
      light: '#FEF3EB',     // Light background for primary context
    },

    /**
     * Secondary colors
     * Used for secondary actions and accents
     */
    secondary: {
      main: '#F68833',      // Secondary accent (can differ from primary)
      dark: '#EF6C00',
      light: '#FFF3ED',     // Lighter variant
    },

    /**
     * Status colors for loan/contact statuses
     * Each status has semantic color + background for badge display
     * Reference: src/features/contacts/detail/GetStatusStyle.tsx
     */
    status: {
      new: {
        color: '#4285F4',   // Blue
        bg: '#ECF3FE',      // Light blue background
      },
      deal: {
        color: '#27AE60',   // Green
        bg: '#E9F7EF',      // Light green background
      },
      rejected: {
        color: '#E40000',   // Red
        bg: '#FCE6E6',      // Light red background
      },
      default: {
        color: '#344054',   // Dark gray
        bg: '#F2F4F7',      // Light gray background
      },
    },

    /**
     * Avatar initials colors
     * Rotates through this palette for user avatars
     * Reference: src/features/layouts/sidebar/Avatar.tsx
     */
    avatar: {
      palette: [
        '#F68833', // Orange
        '#8E63F7', // Purple
        '#1DAEFF', // Blue
        '#FE7062', // Red
        '#56CA00', // Green
        '#FFB400', // Yellow
        '#00B9AE', // Teal
        '#AB47BC', // Deep purple
        '#F06292', // Pink
        '#90A4AE', // Grey
      ],
    },

    /**
     * Badge/state colors for tags, indicators, and state badges
     * Reference: src/components/statusBadge/StatusBadge.tsx
     */
    badge: {
      assigned: {
        bg: '#E9F7EF',        // Light green
        text: 'text-green-500', // Green text
      },
      pending: {
        bg: 'bg-yellow-50',   // Light yellow
        text: 'text-yellow-500', // Yellow text
      },
      danger: {
        bg: 'bg-red-100',     // Light red
        text: 'text-red-500', // Red text
      },
    },

    /**
     * Neutral colors
     * Grayscale palette for text, borders, backgrounds
     * Includes Tailwind gray scale for consistency
     */
    neutral: {
      white: '#FFFFFF',
      offWhite: '#F4F5F6',
      border: '#ECECEC',     // Main border color
      lightBorder: '#A8A8A8', // Lighter border variant
      darkBorder: '#CBD5E0',  // Darker border variant
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray300: '#D1D5DB',
      gray400: '#9CA3AF',
      gray700: '#374151',
    },
  },

  /**
   * Typography Configuration
   * Font families, weights for consistent typography across the app
   * Reference: src/index.css (Roboto imported from Google Fonts)
   */
  typography: {
    fontFamily: {
      sans: '"Roboto", sans-serif', // Primary font
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },

  /**
   * Spacing Scale
   * Uses Tailwind's default spacing scale
   * Reference: https://tailwindcss.com/docs/customizing-spacing
   * Values in rem units (1 unit = 0.25rem = 4px)
   */
  spacing: {
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },

  /**
   * Border Radius
   * Uses Tailwind defaults + custom values
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
}

/**
 * Export theme for use in components and utilities
 * 
 * Example usage in a component:
 * 
 *   import { theme } from '@/lib/config/theme'
 *   
 *   const buttonStyle = {
 *     backgroundColor: theme.colors.primary.main,
 *     color: '#fff',
 *     borderColor: theme.colors.neutral.border
 *   }
 */

// Optional: Export individual color groups for convenience
export const colors = theme.colors
export const typography = theme.typography
export const spacing = theme.spacing
export const borderRadius = theme.borderRadius

/**
 * Utility function to get avatar color by index
 * Useful in loops where you want to cycle through avatar colors
 * 
 * Usage:
 *   const color = getAvatarColor(0) // Returns first color
 *   const color = getAvatarColor(users.length + 1) // Cycles through palette
 */
export const getAvatarColor = (index: number): string => {
  return theme.colors.avatar.palette[index % theme.colors.avatar.palette.length]
}

/**
 * Utility function to get status styling by status name
 * 
 * Usage:
 *   const statusStyle = getStatusColor('new')
 *   // Returns: { color: '#4285F4', bg: '#ECF3FE' }
 */
export const getStatusColor = (
  status: 'new' | 'deal' | 'rejected' | 'default'
) => {
  return theme.colors.status[status]
}

/**
 * Utility function to get badge styling by badge type
 * 
 * Usage:
 *   const badgeStyle = getBadgeColor('assigned')
 *   // Returns: { bg: '#E9F7EF', text: 'text-green-500' }
 */
export const getBadgeColor = (
  badgeType: 'assigned' | 'pending' | 'danger'
) => {
  return theme.colors.badge[badgeType]
}

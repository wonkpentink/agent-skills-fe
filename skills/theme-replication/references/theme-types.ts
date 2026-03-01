/**
 * Theme Type Definitions
 * 
 * This file defines TypeScript interfaces and types for the centralized theme configuration.
 * Use these types to ensure type safety when creating your theme.ts and using theme values in components.
 */

/**
 * Primary color variant with main, dark, and light shades
 */
export interface ColorVariant {
  main: string
  dark?: string
  light?: string
}

/**
 * Status colors for loan/contact statuses (e.g., New, Deal, Rejected)
 * Each status has a text color and background color
 */
export interface StatusColor {
  color: string
  bg: string
}

/**
 * Badge/state colors for tags, badges, and indicators
 * Each badge state maps to background and text colors
 */
export interface BadgeColor {
  bg: string
  text: string
}

/**
 * Avatar initials colors - rotates through palette for user avatars
 */
export interface AvatarColors {
  palette: string[]
}

/**
 * Neutral colors - grayscale palette for text, borders, backgrounds
 */
export interface NeutralColors {
  white: string
  offWhite: string
  border: string
  lightBorder: string
  darkBorder: string
  gray50?: string
  gray100?: string
  gray200?: string
  gray300?: string
  gray400?: string
  gray700?: string
  [key: string]: string | undefined
}

/**
 * All color definitions in the theme
 */
export interface ThemeColors {
  primary: ColorVariant
  secondary: ColorVariant
  status: {
    new: StatusColor
    deal: StatusColor
    rejected: StatusColor
    default: StatusColor
  }
  avatar: AvatarColors
  badge: {
    assigned: BadgeColor
    pending: BadgeColor
    danger: BadgeColor
  }
  neutral: NeutralColors
}

/**
 * Typography configuration
 */
export interface Typography {
  fontFamily: {
    sans: string
    serif?: string
    mono?: string
  }
  fontWeight: {
    regular: number
    medium: number
    bold: number
  }
  lineHeight?: {
    tight: number
    normal: number
    relaxed: number
  }
}

/**
 * Spacing scale (can reference Tailwind scale or custom values)
 */
export interface Spacing {
  [key: string]: string | number
}

/**
 * Border radius values
 */
export interface BorderRadius {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  full: string
  [key: string]: string
}

/**
 * Complete theme object shape
 * This is what your theme.ts file should export
 */
export interface Theme {
  colors: ThemeColors
  typography: Typography
  spacing: Spacing
  borderRadius: BorderRadius
}

/**
 * Configuration for creating extended or custom themes
 */
export interface ThemeConfig {
  baseTheme?: Theme
  overrides?: Partial<Theme>
}

/**
 * Type helper to get color token paths
 * Usage: type PrimaryColor = ColorToken<'primary'>
 */
export type ColorToken<T extends keyof ThemeColors = keyof ThemeColors> = ThemeColors[T]

/**
 * Type helper to ensure theme values are accessed correctly
 * Usage: const color: ColorValue = theme.colors.primary.main
 */
export type ColorValue = string

/**
 * Hook return type for useTheme hook
 */
export interface UseThemeReturn {
  theme: Theme
  isDark?: boolean
  toggleTheme?: () => void
}

---
name: theme-replication
description: Extract and centralize the complete theme/design system from the Frontend App project into a standalone, reusable configuration.
---

# Theme Replication & Configuration Skill

## Overview

This skill teaches you how to extract, centralize, and replicate the complete theme/design system from the Frontend App project into a standalone, reusable configuration. The current codebase uses **Tailwind CSS v4** with colors, typography, and spacing scattered across components. This skill shows how to consolidate all design tokens into a single TypeScript configuration module that can be:

- **Replicated** into other projects
- **Used as default theme** for new projects
- **Extended and customized** without losing consistency
- **Versioned and shared** across teams

## Current Theme Architecture

### Styling Stack
- **CSS Framework**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Approach**: Utility classes + inline styles for dynamic values
- **Typography**: Roboto font (weights: 400, 500, 700) from Google Fonts
- **Configuration**: Zero-config Tailwind v4 (no `tailwind.config.js`)
- **Application**: Imported in [src/index.css](../../../src/index.css) via `@import "tailwindcss"`

### Design Tokens Currently in Codebase

#### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary Orange | `#F68833` | Main action buttons, links, accents |
| Secondary Orange | `#EF6C00` | Hover/active states for primary actions |
| Light Orange BG | `#FEF3EB`, `#FFF3ED` | Background highlights |

#### Status Colors (Loan Statuses)
| Status | Color | Background | File |
|--------|-------|------------|------|
| New | `#4285F4` | `#ECF3FE` | GetStatusStyle.tsx |
| Deal | `#27AE60` | `#E9F7EF` | GetStatusStyle.tsx |
| Rejected | `#E40000` | `#FCE6E6` | GetStatusStyle.tsx |
| Default | `#344054` | `#F2F4F7` | GetStatusStyle.tsx |

#### Avatar Initials Colors (10-color rotation)
| Name | Color |
|------|-------|
| Orange | `#F68833` |
| Purple | `#8E63F7` |
| Blue | `#1DAEFF` |
| Red | `#FE7062` |
| Green | `#56CA00` |
| Yellow | `#FFB400` |
| Teal | `#00B9AE` |
| Deep Purple | `#AB47BC` |
| Pink | `#F06292` |
| Grey | `#90A4AE` |

#### Badge/State Colors
| State | Background | Text |
|-------|-----------|------|
| Assigned | `#E9F7EF` | `text-green-500` |
| Pending | `bg-yellow-50` | `text-yellow-500` |
| Danger | `bg-red-100` | `text-red-500` |

#### Neutral Palette
- **Whites**: `#FFFFFF`, `#F4F5F6`
- **Grays**: Tailwind defaults (`gray-50` through `gray-900`)
- **Borders**: `#ECECEC`, `#A8A8A8`, `#CBD5E0`

#### Typography
| Property | Value |
|----------|-------|
| Font Family | Roboto, sans-serif |
| Font Weight Regular | 400 |
| Font Weight Medium | 500 |
| Font Weight Bold | 700 |

#### Spacing Scale
Uses Tailwind's default spacing: `0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96`

#### Border Radius
- Tailwind defaults: `none, sm, base, md, lg, xl, 2xl, 3xl, full`
- Custom: `rounded-[4px]`, `rounded-full`

---

## Theme Configuration Pattern

### Directory Structure
```
src/
└── lib/
    └── config/
        └── theme.ts          # Centralized theme configuration
src/
└── types/
    └── theme-types.ts        # TypeScript interfaces for theme
```

### Theme Module Structure

The theme configuration exports a single `theme` object with the following shape:

```typescript
const theme = {
  colors: {
    primary: { ... },
    secondary: { ... },
    status: { ... },
    avatar: { ... },
    badge: { ... },
    neutral: { ... }
  },
  typography: { ... },
  spacing: { ... },
  borderRadius: { ... }
}
```

### Design Token Organization

**Colors** are organized by purpose:
- **primary**: Main brand color and variants
- **secondary**: Accent and secondary actions
- **status**: Semantic colors for loan/contact statuses
- **avatar**: Rotation colors for user avatars
- **badge**: Colors for badge/tag states
- **neutral**: Grayscale for text, borders, backgrounds

**Typography** includes:
- Font families
- Font weights
- Line heights (optional)

**Spacing** references Tailwind scale or custom values.

---

## How to Use This Skill

### Step 1: Understand Current Theme Distribution
Review how colors are currently scattered:
- [Avatar.tsx](../../../src/features/layouts/sidebar/Avatar.tsx) - Avatar palette (lines with `colors` array)
- [StatusBadge.tsx](../../../src/components/statusBadge/StatusBadge.tsx) - Badge color mapping
- [GetStatusStyle.tsx](../../../src/features/contacts/detail/GetStatusStyle.tsx) - Loan status colors
- [Button.tsx](../../../src/components/button/Button.tsx) - Primary/outline variants
- [InputField.tsx](../../../src/components/input/InputField.tsx) - Input styling with dynamic colors

### Step 2: Create Centralized Theme Config
Follow the reference implementation in `references/theme-template.ts` to create `src/lib/config/theme.ts`. This consolidates all design tokens into a single source of truth.

### Step 3: Create Theme TypeScript Types
Use `references/theme-types.ts` as a template to create `src/types/theme-types.ts`. This ensures type safety when using theme values in components.

### Step 4: Integrate Theme into Components
Replace hardcoded color values with imports from the centralized theme. See `references/component-examples.tsx` for before/after examples.

### Step 5: Use as Default Theme
Import theme config in `src/providers/AppProviders.tsx` or create a theme context to make it globally accessible. Components can then consume it via import or context.

---

## Implementation Workflow

### Creating the Theme Module

1. **Extract all color tokens** from the current codebase:
   ```bash
   grep -r "#[A-Fa-f0-9]\{6\}" src/  # Find hex colors
   grep -r "bg-\|text-" src/components  # Find Tailwind colors
   ```

2. **Create `src/lib/config/theme.ts`**:
   ```typescript
   export const theme = {
     colors: {
       primary: {
         main: '#F68833',
         dark: '#EF6C00',
         light: '#FEF3EB'
       },
       status: { /* ... */ },
       // ... other color groups
     },
     typography: { /* ... */ },
     spacing: { /* ... */ }
   }
   ```

3. **Create `src/types/theme-types.ts`**:
   Define interfaces describing the theme shape for TypeScript completeness.

4. **Update components** to use `import { theme } from '@/lib/config/theme'` instead of hardcoded values.

5. **Export from `src/lib/config/index.ts`** for convenience:
   ```typescript
   export { theme } from './theme'
   ```

### Using in Components

**Before (hardcoded):**
```typescript
const colors = ['#F68833', '#8E63F7', '#1DAEFF']
const styles = {
  background: color,
  borderColor: '#ECECEC'
}
```

**After (theme-based):**
```typescript
import { theme } from '@/lib/config/theme'

const colors = theme.colors.avatar.palette
const styles = {
  background: color,
  borderColor: theme.colors.neutral.border
}
```

### Making it the Default Theme

To apply the theme as your project's default:

1. **Create a theme context** (optional):
   ```typescript
   const ThemeContext = React.createContext(theme)
   ```

2. **Apply theme on app init** in `src/App.tsx` or `src/main.tsx`:
   ```typescript
   document.documentElement.style.setProperty('--color-primary', theme.colors.primary.main)
   ```

3. **Import and use in components** automatically via centralized imports.

---

## Replicating Theme in Other Projects

### For New React/Tailwind Projects

1. **Copy `config/theme.ts`** from this project to your new project's `src/lib/config/`

2. **Update colors** if customizing:
   ```typescript
   export const theme = {
     colors: {
       primary: {
         main: '#YOUR_COLOR'  // Modify as needed
       }
     }
   }
   ```

3. **Import in components**:
   ```typescript
   import { theme } from '@/lib/config/theme'
   ```

4. **Use CSS variables** (optional, for dynamic theming):
   ```css
   :root {
     --color-primary: #F68833;
     --color-status-new: #4285F4;
   }
   ```

### For Next.js/Vue/Svelte Projects

The same `theme.ts` can be used as a data source. The theme object is framework-agnostic TypeScript:

```typescript
// In a Vue component
<script setup>
import { theme } from '@/lib/config/theme'
const primaryColor = theme.colors.primary.main
</script>

<template>
  <button :style="{ background: primaryColor }">Click me</button>
</template>
```

---

## Customization & Extension

### Adding New Color Tokens

To add a new semantic color group (e.g., `error`, `success`):

```typescript
export const theme = {
  colors: {
    // ... existing
    success: {
      main: '#27AE60',
      light: '#E9F7EF'
    },
    error: {
      main: '#E40000',
      light: '#FCE6E6'
    }
  }
}
```

### Environment-Specific Themes

Create separate theme files for different environments:

```
src/lib/config/
├── theme.base.ts      # Shared tokens
├── theme.light.ts     # Light theme
├── theme.dark.ts      # Dark theme (future)
└── index.ts           # Export active theme based on env
```

### Extending Tailwind with Theme Colors

Create `tailwind.config.ts` to use your theme:

```typescript
import { theme } from './src/lib/config/theme'

export default {
  theme: {
    colors: {
      primary: theme.colors.primary,
      status: theme.colors.status,
      // ...
    }
  }
}
```

---

## Real-World Examples

### Example 1: Button Component Using Theme

**Before:**
```typescript
// src/components/button/Button.tsx
const classStyles = {
  primary: 'bg-[#F68833] text-white hover:bg-[#EF6C00]',
  outline: 'bg-white border-[#ECECEC] border text-black'
}
```

**After:**
```typescript
import { theme } from '@/lib/config/theme'

const classStyles = {
  primary: `bg-[${theme.colors.primary.main}] text-white hover:bg-[${theme.colors.primary.dark}]`,
  outline: `bg-white border-[${theme.colors.neutral.border}] border text-black`
}
```

### Example 2: Avatar Component Using Theme

**Before:**
```typescript
// src/features/layouts/sidebar/Avatar.tsx
const colors = ['#F68833', '#8E63F7', '#1DAEFF', '#FE7062', '#56CA00', '#FFB400', '#00B9AE', '#AB47BC', '#F06292', '#90A4AE']
```

**After:**
```typescript
import { theme } from '@/lib/config/theme'

const colors = theme.colors.avatar.palette
```

### Example 3: Status Badge Using Theme

**Before:**
```typescript
// src/components/statusBadge/StatusBadge.tsx
const statusStyles = {
  assigned: { bg: '#E9F7EF', text: 'text-green-500' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-500' }
}
```

**After:**
```typescript
import { theme } from '@/lib/config/theme'

const statusStyles = {
  assigned: theme.colors.badge.assigned,
  pending: theme.colors.badge.pending
}
```

---

## File References

### Current Color Usage in Codebase
- [Avatar.tsx](../../../src/features/layouts/sidebar/Avatar.tsx) - Avatar color palette
- [StatusBadge.tsx](../../../src/components/statusBadge/StatusBadge.tsx) - Badge colors
- [GetStatusStyle.tsx](../../../src/features/contacts/detail/GetStatusStyle.tsx) - Loan status colors
- [Button.tsx](../../../src/components/button/Button.tsx) - Button variants
- [InputField.tsx](../../../src/components/input/InputField.tsx) - Input styling
- [index.css](../../../src/index.css) - Global styles, Tailwind import

### New Files to Create
- `src/lib/config/theme.ts` - Centralized theme configuration
- `src/lib/config/index.ts` - Theme barrel export
- `src/types/theme-types.ts` - TypeScript type definitions (optional)

---

## Best Practices

1. **Single Source of Truth**: Always reference the theme config, never duplicate color values
2. **Type Safety**: Use TypeScript interfaces to ensure theme shape consistency
3. **Semantic Naming**: Use functional names (`primary`, `status`) instead of color names (`blue123`)
4. **Export Consistently**: Always export from `src/lib/config` for easy imports
5. **Document Changes**: When updating theme values, document the rationale
6. **Test Visually**: After centralization, verify all components still look correct
7. **Version Control**: Keep theme in version control for team consistency

---

## Related Skills

**Prerequisites**
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For creating robust theme type interfaces

**Often Used Together**
- [reusable-ui-components](../reusable-ui-components/SKILL.md) - Components that consume theme values and design tokens

**Can Reference**
- [static-files-assets](../static-files-assets/SKILL.md) - For organizing icon and image assets that align with theme
- [global-context-providers](../global-context-providers/SKILL.md) - For creating ThemeProvider to wrap app with theme context

---

## Reference Materials

- See `references/theme-template.ts` for a complete theme.ts implementation
- See `references/theme-types.ts` for TypeScript type definitions
- See `references/component-examples.tsx` for before/after component usage examples

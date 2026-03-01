```skill
---
name: static-files-assets
description: 'Complete guide for organizing static files and assets in src/assets/ and public/assets/. Use when managing project images, icons, SVGs, logos, and illustrations. Learn when to bundle assets with Vite (src/assets/) versus serving publicly without optimization (public/assets/). Covers icon naming conventions, image optimization, asset imports in components, and proper directory structure.'
---

# Static Files & Assets

A comprehensive guide for managing project static files, images, icons, and assets across bundled and public asset directories.

## When to Use This Skill

- Adding new icons, images, or illustrations to the project
- Creating icon sets or SVG sprite sheets
- Organizing reusable visual assets
- Deciding between bundled (src/assets/) and public (public/assets/) asset locations
- Importing assets into components
- Optimizing images for bundle size
- Understanding asset serving and loading patterns

## Asset Structure Overview

### `src/assets/` - Bundled Static Files

**Purpose**: Project-specific images and icons bundled by Vite during the build process.

**Characteristics**:
- Imported directly into components using ES6 imports
- Optimized and processed by Vite during build
- Included in the final production bundle
- Hash-based filenames in production (automatic cache busting)
- Ideal for icons and illustrations used by components
- Best for assets that might change or be updated

**Current Structure**:
```
src/assets/
└── react.svg
```

**Real Example**: React logo included in project.

### `public/assets/` - Public Static Assets

**Purpose**: Static files served directly by the web server without Vite optimization or bundling.

**Characteristics**:
- Served as-is without processing or optimization
- Accessed via URL path (e.g., `/assets/icons/ic-user.svg`)
- Not bundled into application code
- Ideal for large image collections or unoptimized assets
- Better for assets that are served publicly without modification

**Current Structure**:
```
public/assets/
├── icons/
│   ├── ic-adddoc.svg
│   ├── ic-archive.svg
│   ├── ic-arrow-down.svg
│   ├── ic-bell.svg
│   ├── ic-binding-account.svg
│   ├── ic-bookmark.svg
│   ├── ic-briefcase.svg
│   ├── ic-burger.svg
│   ├── ic-calendar.svg
│   ├── ic-car.svg
│   ├── ic-cash.svg
│   ├── ic-chart-bar.svg
│   ├── ic-chevrons-left.svg
│   ├── ic-chevron_down.svg
│   ├── ic-clock.svg
│   ├── ic-close-circle.svg
│   ├── ic-close.svg
│   ├── ic-closecircle.svg
│   ├── ic-copy.svg
│   ├── ic-database.svg
│   ├── ic-dollar-sign.svg
│   ├── ic-download-thin.svg
│   ├── ic-download.svg
│   ├── ic-drag.svg
│   ├── ic-edit.svg
│   ├── ic-envelope.svg
│   ├── ic-eye.svg
│   ├── ic-eye_off.svg
│   ├── ic-file-text.svg
│   ├── ic-filter.svg
│   ├── ic-fire.svg
│   ├── ic-folder-download.svg
│   ├── ic-handshake.svg
│   ├── ic-help-circle.svg
│   ├── ic-link.svg
│   ├── ic-loading.svg
│   ├── ic-location-marker.svg
│   ├── ic-log-out.svg
│   ├── ic-mail.svg
│   ├── ic-map.svg
│   ├── ic-menu.svg
│   ├── ic-note-outlined.svg
│   ├── ic-note.svg
│   ├── ic-password.svg
│   ├── ic-pencil.svg
│   ├── ic-people.svg
│   ├── ic-phone-missed-call.svg
│   ├── ic-phone-plus.svg
│   ├── ic-phone.svg
│   ├── ic-plus.svg
│   ├── ic-profile.svg
│   ├── ic-radio-button.svg
│   ├── ic-receipt.svg
│   ├── ic-report.svg
│   ├── ic-save-as.svg
│   ├── ic-sealquestion.svg
│   ├── ic-search.svg
│   ├── ic-selector.svg
│   ├── ic-settings.svg
│   ├── ic-sidebar.svg
│   ├── ic-sidebar_expand.svg
│   ├── ic-signature.svg
│   ├── ic-sorting.svg
│   ├── ic-speakerphone.svg
│   ├── ic-star.svg
│   ├── ic-storefront.svg
│   ├── ic-tag.svg
│   ├── ic-trash.svg
│   ├── ic-upload-leads.svg
│   ├── ic-upload.svg
│   ├── ic-user-add.svg
│   ├── ic-user-group.svg
│   ├── ic-user-upload.svg
│   ├── ic-user.svg
│   ├── ic-user2.svg
│   ├── ic-users.svg
│   ├── ic-whatsapp-color.svg
│   ├── ic-whatsapp-logo.svg
│   └── ic-whatsapp.svg
└── images/
    ├── auth.jpg
    ├── img-data-not-found.png
    └── user.png
```

**Real Examples**:
- **icons/**: Application utility icons (ic-user.svg, ic-trash.svg, ic-download.svg, etc.)
- **images/**: Standalone images (auth.jpg for login page, user.png for profile placeholder, img-data-not-found.png for empty states)

## Decision Tree: Which Asset Location?

### Use `src/assets/` When:

```
Is the asset:
├─ Used by multiple components? → YES → src/assets/
├─ Small SVG icon or illustration? → YES → src/assets/
├─ Part of your branding/UI system? → YES → src/assets/
├─ Referenced in code frequently? → YES → src/assets/
```

**Benefits**:
- Vite optimizes and bundles
- Cache busting with hashed filenames
- Tree-shaking (unused assets removed)
- Direct imports for better code organization
- Smaller HTTP requests

### Use `public/assets/` When:

```
Is the asset:
├─ Served publicly without bundling? → YES → public/assets/
├─ Large image file or bulk asset collection? → YES → public/assets/
├─ Never imported in code (URL-based access only)? → YES → public/assets/
├─ Should remain externally accessible? → YES → public/assets/
```

**Benefits**:
- No build-time processing
- Can be updated without rebuilding
- Reduces application bundle size
- Better for large image collections

## Implementation Patterns

### Pattern 1: Import Asset from `src/assets/` (Bundled)

**When**: Asset is used in a component and needs optimization.

**Example** - Component importing React logo:

```tsx
import reactLogo from '@/assets/react.svg';

export function LogoDisplay() {
  return <img src={reactLogo} alt="React Logo" className="w-12 h-12" />;
}
```

**Vite Behavior**:
- During build: `react.svg` is processed, optimized, and hashed
- Output: `assets/react-a1b2c3d4.svg` in production
- SSR-safe and type-checked

### Pattern 2: URL-based Asset from `public/assets/` (Unbundled)

**When**: Asset is served publicly without component import, accessed via URL path.

**Example** - Icon referenced by URL path:

```tsx
export function UserIcon() {
  return (
    <img 
      src="/assets/icons/ic-user.svg" 
      alt="User Icon" 
      className="w-6 h-6" 
    />
  );
}
```

**Vite Behavior**:
- Assets served as-is from public folder
- URL remains `/assets/icons/ic-user.svg` in development and production
- No optimization or bundling

### Pattern 3: Dynamic Icon Selection from `public/assets/`

**When**: Icon name is dynamic or data-driven.

**Example** - Utility function for icon URLs:

```tsx
// src/lib/utils/assetPath.ts
export function getIconPath(iconName: string): string {
  return `/assets/icons/${iconName}.svg`;
}

// In component:
import { getIconPath } from '@/lib/utils/assetPath';

interface IconProps {
  name: string;
  alt: string;
}

export function DynamicIcon({ name, alt }: IconProps) {
  return (
    <img 
      src={getIconPath(name)} 
      alt={alt}
      className="w-6 h-6"
    />
  );
}

// Usage:
<DynamicIcon name="ic-user" alt="User Icon" />
```

**Real Usage**: Select multiple action icons based on data.

### Pattern 4: Image Asset with Alt Text

**When**: Displaying images (not icons) with proper accessibility.

**Example** - Auth or placeholder image:

```tsx
export function AuthBanner() {
  return (
    <img 
      src="/assets/images/auth.jpg" 
      alt="Authentication page banner"
      className="w-full h-auto"
    />
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center">
      <img 
        src="/assets/images/img-data-not-found.png" 
        alt="No data found illustration"
        className="w-48 h-48"
      />
      <p>No results found</p>
    </div>
  );
}
```

## Icon Naming Convention

The project follows a consistent icon naming pattern:

```
ic-[feature].svg
└─ ic- prefix identifies icons
   └─ Feature describes the icon purpose
```

**Examples from project**:
- `ic-user.svg` - User profile icon
- `ic-trash.svg` - Delete/remove action
- `ic-download.svg` - Download action
- `ic-filter.svg` - Filter/search icon
- `ic-calendar.svg` - Date/time selection
- `ic-phone.svg` - Phone/contact icon
- `ic-whatsapp.svg` - WhatsApp integration
- `ic-bell.svg` - Notifications icon
- `ic-settings.svg` - Configuration/settings

**When Adding New Icons**:
1. Use lowercase name
2. Start with `ic-` prefix
3. Describe the icon purpose: `ic-[feature].svg`
4. Store in `public/assets/icons/`
5. Document in type definitions if used programmatically

## Asset Organization Best Practices

### Directory Structure

```
public/assets/
├── icons/          # Application UI icons and symbols
├── images/         # Photographs, illustrations, backgrounds
└── (optional)
    ├── logos/      # Brand logos and wordmarks
    ├── patterns/   # Texture and pattern assets
    └── banners/    # Hero and promotional images

src/assets/
├── react.svg       # Framework/library logos
└── (optional)
    └── illustrations/  # Custom SVG illustrations
```

### File Organization Rules

| Asset Type | Location | Naming | Format |
|---|---|---|---|
| **UI Icons** | `public/assets/icons/` | `ic-[name].svg` | SVG |
| **Logos** | `public/assets/logos/` | `logo-[name].svg` or `[brand].svg` | SVG or PNG |
| **Illustrations** | `src/assets/` or `public/assets/illustrations/` | Descriptive name | SVG or PNG |
| **Photos/Images** | `public/assets/images/` | Descriptive name | JPG or PNG |
| **Backgrounds** | `public/assets/patterns/` or `images/` | `bg-[name].jpg` | JPG |
| **Component Assets** | `src/assets/` | Asset type prefix | SVG |

### File Size Optimization

**For `public/assets/` files**:
- Compress PNG/JPG before adding to repository
- Use SVG for icons (smaller than rasterized images)
- Target max 100KB for JPG images
- Consider WebP format for modern browsers

**For `src/assets/` files**:
- Vite handles some optimization
- Keep SVGs clean and optimized
- Remove unnecessary fills, strokes, filters

## Importing Assets in Components

### Import Pattern 1: Direct Import (Bundled)

```tsx
import logo from '@/assets/react.svg';

// Static usage
<img src={logo} alt="Logo" />
```

### Import Pattern 2: URL Template Strings (Public)

```tsx
// Using template string for dynamic paths
const iconUrl = `/assets/icons/ic-${action}.svg`;
<img src={iconUrl} alt={action} />
```

### Import Pattern 3: Utility Functions

```tsx
// src/lib/utils/iconHelper.ts
export const ICON_PATH = '/assets/icons';

export function getIconUrl(name: string): string {
  return `${ICON_PATH}/${name}.svg`;
}

// In component
import { getIconUrl } from '@/lib/utils/iconHelper';
<img src={getIconUrl('ic-user')} alt="User" />
```

### Import Pattern 4: Object Maps (For Type Safety)

```tsx
// src/lib/options/iconMap.ts
export const ICON_MAP = {
  user: '/assets/icons/ic-user.svg',
  trash: '/assets/icons/ic-trash.svg',
  download: '/assets/icons/ic-download.svg',
  filter: '/assets/icons/ic-filter.svg',
} as const;

export type IconType = keyof typeof ICON_MAP;

// In component
import { ICON_MAP, type IconType } from '@/lib/options/iconMap';

interface IconProps {
  name: IconType;
  alt: string;
}

export function Icon({ name, alt }: IconProps) {
  return <img src={ICON_MAP[name]} alt={alt} />;
}
```

## Common Patterns from Project

### Pattern 1: Icon + Text Button

```tsx
export function ActionButton({ 
  icon, 
  label, 
  onClick 
}: { icon: string; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded"
    >
      <img 
        src={`/assets/icons/${icon}.svg`} 
        alt={label}
        className="w-5 h-5"
      />
      <span>{label}</span>
    </button>
  );
}

// Usage:
<ActionButton icon="ic-download" label="Download" onClick={handleDownload} />
```

### Pattern 2: Status Icon Selection

```tsx
export function StatusIcon({ status }: { status: 'active' | 'inactive' | 'pending' }) {
  const iconMap = {
    active: 'ic-check.svg',
    inactive: 'ic-close.svg',
    pending: 'ic-clock.svg',
  };
  
  return (
    <img 
      src={`/assets/icons/${iconMap[status]}`} 
      alt={status}
      className="w-4 h-4"
    />
  );
}
```

### Pattern 3: Empty State with Image

```tsx
export function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <img 
        src="/assets/images/img-data-not-found.png" 
        alt="No data found"
        className="w-40 h-40 mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-700">No Results</h3>
      <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
    </div>
  );
}
```

## Configuration & Paths

### Vite Asset Handling

Vite automatically handles assets in `src/`:

```ts
// vite.config.ts - No special config needed
// Assets in src/ are processed automatically
// Public folder serves as-is
```

### Import Aliases

Use configured alias for cleaner imports:

```tsx
// ✅ Clean and maintainable
import logo from '@/assets/react.svg';

// ❌ Avoid relative paths
import logo from '../../../assets/react.svg';
```

## Troubleshooting

### Issue: Asset not loading in production

**Solution**: 
- Check if asset is in public folder (should use `/assets/icon.svg`)
- Check if asset is imported in src/ (should use import syntax)
- Verify file exists and path is correct

### Issue: Build size unexpectedly large

**Solution**: 
- Move large images to `public/assets/` (not bundled)
- Compress images before adding
- Use SVG for icons instead of PNG/JPG

### Issue: Asset path works in dev but not production

**Solution**: 
- For `public/` assets: use absolute path `/assets/...`
- For `src/` assets: use ES6 import
- Check that public folder is served correctly

## Key Takeaways

- **`src/assets/`**: Use for component-specific, optimized, bundled assets (small icons, logos used in code)
- **`public/assets/`**: Use for publicly served, unbundled, URL-accessed assets (icon collections, images, large files)
- **Naming**: Follow `ic-[name].svg` convention for icons
- **Imports**: Use ES6 imports for bundled, URL paths for public
- **Organization**: Separate icons/ from images/ for clarity
- **Performance**: Bundled assets get hashed filenames for cache busting; public assets served as-is
```

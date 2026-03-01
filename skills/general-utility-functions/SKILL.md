---
name: general-utility-functions
description: Complete guide for building and using general-purpose utility functions in src/lib/utils/. Learn encryption/decryption patterns, formatting functions for phones and currency, device/browser detection, storage utilities, string manipulation, and type-safe object operations. Covers reusable functions with no component or feature-specific logic.
---

## What Are General Utility Functions?

General Utility Functions are reusable functions in `src/lib/utils/` that provide common operations across the entire application. They have no component or feature-specific logic and are organized by purpose:

- **Encryption/Decryption:** Secure data handling with AES encryption
- **Formatting:** Transform data to user-friendly display formats
- **Detection:** Identify user device, browser, and OS
- **Storage:** Save/retrieve encrypted data from browser storage
- **Transformation:** Manipulate strings, arrays, and objects
- **Validation:** Type checking and object verification

## When to Use:

  - Creating encryption/decryption utilities for sensitive data
  - Building format functions for phones, currency, dates
  - Detecting user device, browser, and OS information
  - Storing and retrieving encrypted data from localStorage/sessionStorage
  - Manipulating strings, arrays, and nested objects
  - Creating debounce, throttle, and other functional utilities
  - Mapping error messages to user-friendly messages
  - Building validation and type-checking utilities

## Prerequisites:

  - Installation & Initial Setup skill completed
  - Basic understanding of TypeScript types and interfaces
  - Familiarity with localStorage and sessionStorage
  - Knowledge of regular expressions for string matching
  - Understanding of encryption concepts (AES, HMAC)

## Folder Structure Overview

```
src/lib/utils/
├── Crypto.ts              # AES encryption/decryption functions
├── format.ts              # Phone, currency, date formatting
├── Access.ts              # Device/browser/OS detection, IP fetching
├── utils.ts               # General utilities (debounce, cn, nested value)
├── apiResponse.ts         # API response routing based on status
├── authHelpers.ts         # Auth-specific helpers and signature generation
├── Constant.ts            # Constants (pagination defaults)
├── menuUtils.ts           # Menu parsing and navigation helpers
├── MessageList.ts         # Error message mapping and translations
└── StoreUrl.ts            # Session storage URL utilities
```

**Key Points:**
- Single responsibility: each file handles one category
- No imports from components or features
- Pure functions with no side effects (except storage operations)
- Strong TypeScript typing for type safety
- Used across all features, hooks, and pages

## Core Patterns

### Pattern 1: Encryption & Decryption (AES)

Encrypts/decrypts sensitive data like tokens using AES with a secret key.

```typescript
// src/lib/utils/Crypto.ts
import CryptoJS from "crypto-js";

// Get encryption key from environment
const encryptionKey = import.meta.env.VITE_CRYPTO_KEY;

// Encrypt plain text data
export const encryptLS = (data: any): string => {
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    return encrypted;
};

// Decrypt encrypted data
export const decryptLS = (data: any): string => {
    const value = data ? data : '';
    let decrypted: string;
    
    try {
        // Decrypt using AES with secret key
        const bytes = CryptoJS.AES.decrypt(value, encryptionKey);
        // Convert bytes to UTF8 string
        decrypted = bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        // Return empty string on decryption failure
        decrypted = '';
    }
    
    return decrypted;
};
```

**Key Characteristics:**
- Encrypts data with AES algorithm
- Decrypts with same key
- Returns empty string on decryption error instead of throwing
- Safe for storing sensitive data in localStorage
- Used for tokens, passwords, and credentials

**Usage Example:**
```typescript
// Store encrypted token
const token = "my-secret-token-12345";
const encrypted = encryptLS(token);
localStorage.setItem("token", encrypted);

// Retrieve and decrypt
const storedEncrypted = localStorage.getItem("token");
const decrypted = decryptLS(storedEncrypted);  // "my-secret-token-12345"
```

---

### Pattern 2: Format Utilities (Phone, Currency)

Converts data to user-friendly display formats following regional standards.

```typescript
// src/lib/utils/format.ts
type PhoneAreaCodeOptions = {
    notUsePhoneAreaCode?: boolean;    // Don't convert to international format
    removeZeroFirst?: boolean;        // Remove leading 0
};

/**
 * Format phone number to international or local format
 * @param number Phone number to format (can be +62XXX, 62XXX, or 0XXX)
 * @param options Formatting options
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
    number: string,
    options: PhoneAreaCodeOptions = {}
): string => {
    const { notUsePhoneAreaCode = false, removeZeroFirst = false } = options;
    let value = number.trim();
    let formattedNumber = '';

    if (notUsePhoneAreaCode) {
        // Convert to local format (0XXXX or just XXXX)
        if (value.startsWith('+62')) {
            formattedNumber = removeZeroFirst
                ? value.slice(3)              // Remove "+62" only
                : '0' + value.slice(3);       // Convert to 0XXX format
        } else {
            formattedNumber = value;
        }
    } else {
        // Convert to international format (+62XXX)
        if (value.startsWith('+')) {
            formattedNumber = value;          // Already international
        } else if (value.startsWith('0')) {
            formattedNumber = '+62' + value.slice(1);  // 0XXX → +62XXX
        } else if (value.startsWith('62')) {
            formattedNumber = '+' + value;    // 62XXX → +62XXX
        } else {
            formattedNumber = '+62' + value;  // XXX → +62XXX
        }
    }

    return formattedNumber;
};

/**
 * Format number as Indonesian Rupiah currency
 * @param number Number to format
 * @returns Formatted string like "Rp1.000.000"
 */
export const rupiahCurrencyFormat = (number: number): string | null => {
    if (!number) return null;
    
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number).replace(/\s/g, "");
};
```

**Key Characteristics:**
- Handles multiple input formats (0XXX, 62XXX, +62XXX)
- Options for local vs international formatting
- Uses Intl API for locale-aware formatting
- Returns null/safe values on invalid input
- Chainable for multiple transformations

**Usage Examples:**
```typescript
// Phone formatting
formatPhoneNumber("8123456789");                           // "+628123456789"
formatPhoneNumber("+628123456789", { notUsePhoneAreaCode: true });  // "08123456789"
formatPhoneNumber("08123456789");                          // "+628123456789"

// Currency formatting
rupiahCurrencyFormat(1000000);                             // "Rp1.000.000"
rupiahCurrencyFormat(0);                                   // null
```

---

### Pattern 3: Device & Browser Detection

Identifies user's device type, browser, and operating system from user agent.

```typescript
// src/lib/utils/Access.ts

// Get device type (Mobile or Desktop)
export const getDevice = (): "Mobile" | "Desktop" => {
    if (typeof navigator === "undefined") return "Desktop";
    
    // Check user agent for mobile patterns
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent);
    
    return isMobile ? "Mobile" : "Desktop";
};

// Get browser name from user agent
export const getBrowser = (): string => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return "Unknown_Browser";
    }

    // Check for each browser using user agent strings and API detection
    const ua = navigator.userAgent;

    if (/OPR\/|Opera\//.test(ua)) return 'Opera';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (!/Chrome/.test(ua) && /Safari\//.test(ua)) return 'Safari';
    if (document.documentMode) return 'IE';
    if (/Edg\//.test(ua)) return 'Edge';
    if (/Chrome\//.test(ua)) return 'Chrome';
    
    return 'Unknown_Browser';
};

// Get operating system from user agent
export const getOS = (): string => {
    if (typeof navigator === "undefined") return 'Unknown_OS';
    
    const ua = navigator.userAgent;

    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Windows Phone/i.test(ua)) return "Windows_Phone";
    if (navigator.appVersion.indexOf('Win') !== -1) return 'Windows';
    if (navigator.appVersion.indexOf('Mac') !== -1) return 'MacOS';
    if (navigator.appVersion.indexOf('X11') !== -1) return 'UNIX';
    if (navigator.appVersion.indexOf('Linux') !== -1) return 'Linux';
    
    return 'Unknown_OS';
};

// Get current datetime in UTC+0700 (WIB timezone)
export const customDateTimezone = (): string => {
    return moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
};

// Fetch public IP address
export const getIpFromIpify = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org/?format=json');
        const data: { ip: string } = await response.json();
        return data.ip;
    } catch (error) {
        return "";
    }
};

// Get environment variables as getters
export const getSource = import.meta.env.VITE_APP_BASE_ENV as string | undefined;
export const getApiKey = import.meta.env.VITE_APP_API_KEY as string | undefined;
export const getPublicKey = import.meta.env.VITE_APP_PUBLIC_KEY as string | undefined;
export const getPrivateKey = import.meta.env.VITE_APP_PRIVATE_KEY as string | undefined;
export const getPasswordKey = import.meta.env.VITE_APP_PASSWORD_KEY as string | undefined;
```

**Key Characteristics:**
- Safe SSR checking (typeof window checks)
- User agent detection with regex patterns
- Environment variable exposure as constants
- IP detection with fallback
- Timezone-aware datetime generation

**Usage Examples:**
```typescript
import { getDevice, getBrowser, getOS, customDateTimezone } from "@/lib/utils/Access";

const device = getDevice();           // "Mobile" or "Desktop"
const browser = getBrowser();         // "Chrome", "Safari", etc.
const os = getOS();                   // "Windows", "MacOS", "iOS", etc.
const datetime = customDateTimezone(); // "2024-03-01 14:30:45"
```

---

### Pattern 4: Storage Utilities (Encryption + Session)

Stores and retrieves encrypted data from localStorage and sessionStorage.

```typescript
// src/lib/utils/StoreUrl.ts
import { encryptLS } from "./Crypto";
import { decryptLS } from "./Crypto";

/**
 * Store last visited URL encrypted in sessionStorage
 * Useful for remembering where user came from for back navigation
 * @param url Optional URL to store. If not provided, uses current location
 */
export const storeLastUrl = (url?: string): void => {
    const lastUrl = url ?? window.location.pathname + window.location.search;
    const encryptedUrl = encryptLS(JSON.stringify(lastUrl));
    sessionStorage.setItem("apps-lst-ul", encryptedUrl);
};

/**
 * Retrieve last stored URL from sessionStorage
 * @returns Last stored URL or null if not found
 */
export const getLastUrl = (): string | null => {
    const encrypted = sessionStorage.getItem("apps-lst-ul");
    if (!encrypted) return null;
    
    try {
        const decrypted = decryptLS(encrypted);
        return JSON.parse(decrypted);
    } catch (error) {
        return null;
    }
};

/**
 * Generic storage utility for encrypted data
 */
export const encryptedStorage = {
    setItem: (key: string, value: any): void => {
        const encrypted = encryptLS(JSON.stringify(value));
        sessionStorage.setItem(key, encrypted);
    },
    
    getItem: <T = any>(key: string): T | null => {
        const encrypted = sessionStorage.getItem(key);
        if (!encrypted) return null;
        
        try {
            const decrypted = decryptLS(encrypted);
            return JSON.parse(decrypted) as T;
        } catch (error) {
            return null;
        }
    },
    
    removeItem: (key: string): void => {
        sessionStorage.removeItem(key);
    }
};
```

**Key Characteristics:**
- Encrypts data before storage
- Safe JSON serialization/deserialization
- Type-safe retrieval with generics
- Graceful error handling
- Multiple storage options (localStorage, sessionStorage)

**Usage Examples:**
```typescript
// Store last URL for back navigation
storeLastUrl();  // Stores current URL
storeLastUrl("/contacts/list");  // Stores specific URL

// Generic encrypted storage
encryptedStorage.setItem("userPrefs", { theme: "dark", language: "id" });
const prefs = encryptedStorage.getItem<UserPrefs>("userPrefs");
encryptedStorage.removeItem("userPrefs");
```

---

## Complete Workflows

### Workflow 1: Create New Format Utility Function

**Goal:** Add a new formatting function for a specific data type

**Prerequisites:** Understand target format and input variations

**Steps:**

1. **Understand Input Formats** - Document all possible input variations
   ```
   Phone: "08123456789", "0-812-345-6789", "+62812345678", "62812345678"
   Currency: 1000000, -500000, 0, null
   Date: "2024-01-01", "2024/01/01", ISO string, Date object
   ```

2. **Create Function Skeleton** - Define clear signature with options
   ```typescript
   type FormatOptions = {
       includeSymbol?: boolean;
       separators?: boolean;
       uppercase?: boolean;
   };

   export const formatCustomData = (
       data: string | number,
       options: FormatOptions = {}
   ): string => {
       // Implementation
   }
   ```

3. **Normalize Input** - Convert all formats to standard
   ```typescript
   let normalized = String(data).trim().toLowerCase();
   // Handle different separators
   normalized = normalized.replace(/[-.\s]/g, '');
   ```

4. **Apply Transformation** - Format to target output
   ```typescript
   // Add separators, symbols, etc.
   const formatted = normalized.replace(/(\w{3})/g, '$1-');
   ```

5. **Add Options Support** - Handle configuration
   ```typescript
   if (options.includeSymbol) {
       return symbol + formatted;
   }
   return formatted;
   ```

6. **Return with Validation** - Return null on invalid input
   ```typescript
   if (!formatted || formatted.length === 0) return null;
   return formatted;
   ```

7. **Test Edge Cases** - Empty, null, special characters
   ```typescript
   // Test cases
   formatCustomData("");          // null
   formatCustomData(null);        // null
   formatCustomData("valid");     // "VALID"
   formatCustomData("123", { symbols: true });  // "📌123"
   ```

---

### Workflow 2: Create Device/Context Detection Utilities

**Goal:** Detect user environment and customize behavior

**Prerequisites:** Understand target properties (device, browser, OS)

**Steps:**

1. **Identify Detection Needs** - What to detect?
   - Device type (mobile, tablet, desktop)
   - Browser name and version
   - Operating system
   - Connection type
   - Screen size

2. **Create Detection Function** - Use user agent and browser APIs
   ```typescript
   export const getDeviceEnvironment = () => {
       return {
           device: getDevice(),
           browser: getBrowser(),
           os: getOS(),
           isTouchscreen: "ontouchstart" in window,
           isOnline: navigator.onLine,
       };
   };
   ```

3. **Add Type Safety** - Create interfaces
   ```typescript
   interface DeviceEnvironment {
       device: "Mobile" | "Desktop" | "Tablet";
       browser: string;
       os: string;
       isTouchscreen: boolean;
       isOnline: boolean;
   }
   ```

4. **Account for SSR** - Check global objects safely
   ```typescript
   if (typeof navigator === "undefined") {
       return "Unknown";
   }
   const ua = navigator.userAgent;
   ```

5. **Create Feature Detection** - Detect capabilities
   ```typescript
   export const hasGeolocation = (): boolean => {
       return typeof navigator !== "undefined" && "geolocation" in navigator;
   };

   export const hasLocalStorage = (): boolean => {
       try {
           localStorage.setItem("test", "test");
           localStorage.removeItem("test");
           return true;
       } catch {
           return false;
       }
   };
   ```

6. **Export as Constants/Getters** - Make easily accessible
   ```typescript
   export const environment = {
       isProduction: import.meta.env.PROD,
       isDevelopment: import.meta.env.DEV,
       apiUrl: import.meta.env.VITE_API_URL,
   };
   ```

---

### Workflow 3: Create Message/Error Mapping Utility

**Goal:** Map server error codes to user-friendly messages

**Prerequisites:** Document all server error responses

**Steps:**

1. **Collect All Error Messages** - From API documentation
   ```
   err_invalid_token
   err_token_expired
   err_account_locked
   err_data_not_found
   err_permission_denied
   err_server_error
   ```

2. **Create Message Mapping Object** - Organize by category
   ```typescript
   type MessageKey = string;
   type MessageListType = {
       [key: MessageKey]: string;
       getMessage: (message: string) => string;
   };

   export const MessageList: MessageListType = {
       // Authentication errors
       id_invalid_password: "password anda salah",
       id_invalid_email_or_password: "email atau password salah",
       id_token_expired: "sesi anda telah berakhir",
       
       // Validation errors
       id_email_empty: "email belum diisi",
       id_email_wrong: "format email salah",
       
       // Server errors
       id_server_busy: "server sedang sibuk, coba lagi",
       getMessage: (message: string) => message,
   };
   ```

3. **Create Translation Mapping** - Server key → Display key
   ```typescript
   const errorToIdKey: Record<string, string> = {
       err_invalid_password: 'id_invalid_password',
       err_email_empty: 'id_email_empty',
       err_server_busy: 'id_server_busy',
   };
   ```

4. **Create Lookup Function** - Get message from server response
   ```typescript
   export const getMessage = (serverError: string): string => {
       const messageKey = errorToIdKey[serverError] || 'id_unknown_error';
       return MessageList[messageKey] || serverError;
   };
   ```

5. **Support Fallback Messages** - Default for unknown errors
   ```typescript
   if (!messageKey) {
       return `Unknown error: ${serverError}`;
   }
   return MessageList[messageKey] || 'Something went wrong';
   ```

6. **Use in Error Handlers** - Throughout application
   ```typescript
   try {
       const response = await api.call();
   } catch (error: any) {
       const message = getMessage(error.response?.data?.err);
       showSnackbar(message);  // User-friendly message
   }
   ```

---

### Workflow 4: Create Validation & Type-Checking Utility

**Goal:** Safely validate and check object properties

**Prerequisites:** Understand validation rules

**Steps:**

1. **Create Type Validators** - Check data types
   ```typescript
   export const isValidString = (value: any): boolean => {
       return typeof value === 'string' && value.trim().length > 0;
   };

   export const isValidNumber = (value: any): boolean => {
       return typeof value === 'number' && !isNaN(value) && isFinite(value);
   };

   export const isValidEmail = (email: string): boolean => {
       const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       return regex.test(email);
   };
   ```

2. **Create Object Validators** - Check object/array properties
   ```typescript
   export const hasAnyValue = (obj: unknown): boolean => {
       if (!obj || typeof obj !== "object") return false;

       const isPlainObject = (v: any) =>
           v && typeof v === "object" && !Array.isArray(v);

       return Object.values(obj as Record<string, any>).some((v) => {
           // Check each value type
           if (v === null || v === undefined) return false;
           if (typeof v === "string") return v.trim().length > 0;
           if (typeof v === "number") return true;
           if (typeof v === "boolean") return v === true;

           // Recursively check nested objects/arrays
           if (Array.isArray(v)) {
               return v.length > 0 && v.some(item => 
                   isPlainObject(item) ? hasAnyValue(item) : item != null
               );
           }

           if (isPlainObject(v)) {
               return hasAnyValue(v);
           }

           return true;
       });
   };
   ```

3. **Create Null/Empty Checks** - Safe property access
   ```typescript
   export const isEmpty = (value: any): boolean => {
       return (
           value === null ||
           value === undefined ||
           value === "" ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === "object" && Object.keys(value).length === 0)
       );
   };
   ```

4. **Use in Conditional Logic** - Throughout application
   ```typescript
   if (hasAnyValue(formData)) {
       // User has entered something, enable submit
       enableSubmit();
   }

   if (isValidEmail(email)) {
       // Safe to send to API
       updateEmail(email);
   }
   ```

---

### Workflow 5: Create Functional Utilities (Debounce, Memoization)

**Goal:** Add performance optimization utilities

**Prerequisites:** Understand use cases (search, resize, scroll)

**Steps:**

1. **Create Debounce Utility** - Delay function execution
   ```typescript
   export function debounce<T extends (...args: any[]) => void>(
       fn: T,
       delay: number
   ): (...args: Parameters<T>) => void {
       let timer: ReturnType<typeof setTimeout>;
       
       return (...args: Parameters<T>) => {
           clearTimeout(timer);
           timer = setTimeout(() => fn(...args), delay);
       };
   }
   ```

2. **Create Throttle Utility** - Limit function call frequency
   ```typescript
   export function throttle<T extends (...args: any[]) => void>(
       fn: T,
       delay: number
   ): (...args: Parameters<T>) => void {
       let last = 0;
       
       return (...args: Parameters<T>) => {
           const now = Date.now();
           if (now - last >= delay) {
               fn(...args);
               last = now;
           }
       };
   }
   ```

3. **Test Debounce** - Verify timing
   ```typescript
   const handleSearch = debounce((query: string) => {
       fetchResults(query);  // Called once after 300ms inactivity
   }, 300);
   ```

4. **Type-Safe Implementation** - Preserve function signature
   ```typescript
   // ✅ GOOD: Preserves signature
   function debounce<F extends (...args: any[]) => void>(
       fn: F,
       delay: number
   ): F {
       // ...
   }

   // ❌ AVOID: Loses typing
   function debounce(fn: any, delay: number): any {
       // ...
   }
   ```

---

### Workflow 6: Create Menu/Navigation Helper Utilities

**Goal:** Parse and navigate menu structures

**Prerequisites:** Understand menu data format

**Steps:**

1. **Create Menu Parser** - Decrypt and parse from storage
   ```typescript
   export function getStoredMenus(storageKey = 'apps-mn-fil') {
       const storedMenus = localStorage.getItem(storageKey);
       if (!storedMenus) return null;
       
       try {
           return JSON.parse(decryptLS(storedMenus));
       } catch {
           return null;
       }
   }
   ```

2. **Create Active Menu Finder** - Find current menu by path
   ```typescript
   export function findActiveMenu(menus: any[], pathname: string) {
       let currentMenuCode: string | null = null;
       let currentSubMenuCode: string | null = null;
       let currentIndex: number | null = null;

       menus.some((menu: any, index: number) => {
           // Check submenu first
           if (menu.sub_menu) {
               const sub = menu.sub_menu.find((s: any) => s.url === pathname);
               if (sub) {
                   currentMenuCode = menu.menu_code;
                   currentSubMenuCode = sub.menu_code;
                   currentIndex = index;
                   return true;
               }
           }
           
           // Check main menu
           if (menu.url === pathname) {
               currentMenuCode = menu.menu_code;
               currentIndex = index;
               return true;
           }
           
           return false;
       });

       return { currentMenuCode, currentSubMenuCode, currentIndex };
   }
   ```

3. **Create Menu Filtering** - Filter accessible menus
   ```typescript
   export function filterMenusByPermission(
       menus: any[],
       userPermissions: string[]
   ) {
       return menus.filter(menu => {
           if (menu.permission && !userPermissions.includes(menu.permission)) {
               return false;
           }
           if (menu.sub_menu) {
               menu.sub_menu = menu.sub_menu.filter(sub =>
                   !sub.permission || userPermissions.includes(sub.permission)
               );
           }
           return true;
       });
   }
   ```

---

## Advanced Patterns

### Pattern A: Conditional Type Utilities

Create utilities that return different types based on conditions.

```typescript
// Type that depends on condition
type If<T extends boolean, Y, N> = T extends true ? Y : N;

// Get nested value with type inference
export function getTypedValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// Usage
interface User {
    name: string;
    age: number;
}

const user: User = { name: "John", age: 30 };
const name = getTypedValue(user, "name");  // string
const age = getTypedValue(user, "age");    // number
```

---

### Pattern B: Safe Navigation with Nullish Values

Navigate nested objects safely without errors.

```typescript
export function getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    // Convert path "user.address.city" to array ["user", "address", "city"]
    const pathArr = path
        .replace(/\[(\w+)\]/g, '.$1')  // Handle bracket notation
        .replace(/^\./, '')             // Remove leading dot
        .split('.');
    
    // Safely access each level
    return pathArr.reduce((acc, key) => acc?.[key], obj);
}

// Usage
const user = {
    profile: {
        address: {
            city: "Jakarta"
        }
    }
};

getNestedValue(user, "profile.address.city");      // "Jakarta"
getNestedValue(user, "profile.address.country");   // undefined (safe!)
getNestedValue(null, "profile.address.city");      // undefined (safe!)
```

---

### Pattern C: Registry Pattern for Message Mapping

Map multiple categories of messages with fallback.

```typescript
type MessageCategory = "error" | "success" | "warning" | "info";

class MessageRegistry {
    private messages: Record<MessageCategory, Record<string, string>> = {
        error: {},
        success: {},
        warning: {},
        info: {},
    };

    register(category: MessageCategory, key: string, message: string) {
        this.messages[category][key] = message;
    }

    get(category: MessageCategory, key: string, fallback?: string): string {
        return this.messages[category][key] || fallback || key;
    }

    getAll(category: MessageCategory): Record<string, string> {
        return this.messages[category];
    }
}

export const messageRegistry = new MessageRegistry();

// Register messages
messageRegistry.register("error", "invalid_email", "Email tidak valid");
messageRegistry.register("error", "password_required", "Password harus diisi");

// Use in application
const message = messageRegistry.get("error", "invalid_email");
```

---

### Pattern D: Lazy Evaluation Utilities

Create utilities that compute values on-demand.

```typescript
export class LazyValue<T> {
    private value: T | undefined;
    private computed = false;

    constructor(private compute: () => T) {}

    get(): T {
        if (!this.computed) {
            this.value = this.compute();
            this.computed = true;
        }
        return this.value!;
    }

    reset(): void {
        this.computed = false;
        this.value = undefined;
    }
}

// Usage
const lazyYears = new LazyValue(() => getYearOptions(25));

// Not computed yet - just stored function
const years = lazyYears.get();  // Now computed
const yearsAgain = lazyYears.get();  // Returns cached value

lazyYears.reset();  // Clear cache
```

---

## Best Practices

### 1. Single Responsibility Per Function
```typescript
// ✅ GOOD: One purpose
export const formatPhoneNumber = (phone: string): string => {
    // Only formats phone
};

// ❌ AVOID: Multiple responsibilities
export const formatAndValidatePhone = (phone: string): {
    formatted: string;
    isValid: boolean;
    country: string;
} => {
    // Too many concerns
};
```

---

### 2. Type Safety with Strong Typing
```typescript
// ✅ GOOD: Clear types
export const getNestedValue = <T = any>(obj: any, path: string): T | undefined => {
    // ...
};

// ❌ AVOID: Any types
export const getNestedValue = (obj: any, path: any): any => {
    // ...
};
```

---

### 3. Graceful Error Handling
```typescript
// ✅ GOOD: Returns safe fallback
export const decryptLS = (data: any): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(data, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        return '';  // Safe fallback
    }
};

// ❌ AVOID: Throws errors
export const decryptLS = (data: any): string => {
    const bytes = CryptoJS.AES.decrypt(data, key);
    return bytes.toString(CryptoJS.enc.Utf8);  // Throws on error
};
```

---

### 4. Pure Functions (No Side Effects)
```typescript
// ✅ GOOD: Pure function
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(amount);
};

// ❌ AVOID: Side effects
export let exchangeRate = 1;
export const formatCurrency = (amount: number): string => {
    exchangeRate = 15500;  // Side effect!
    return amount * exchangeRate;
};
```

---

### 5. Consistent Naming Conventions
```typescript
// ✅ GOOD: Clear verb-noun pattern
export const formatPhoneNumber = () => {};
export const decryptToken = () => {};
export const getDeviceType = () => {};
export const hasValidEmail = () => {};

// ❌ AVOID: Vague names
export const process = () => {};
export const helper = () => {};
export const util = () => {};
export const check = () => {};
```

---

### 6. Environment Variable Safety
```typescript
// ✅ GOOD: Provide defaults
export const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || "http://localhost:3000";
};

// ❌ AVOID: No defaults
export const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL;  // undefined if not set
};
```

---

### 7. Documentation with JSDoc
```typescript
// ✅ GOOD: Clear documentation
/**
 * Format phone number to international format
 * @param number Phone number (can be +62XXX, 62XXX, or 0XXX)
 * @param options Formatting options
 * @returns Formatted phone number in +62XXX format
 * @example
 * formatPhoneNumber("08123456789");  // "+628123456789"
 * formatPhoneNumber("628123456789"); // "+628123456789"
 */
export const formatPhoneNumber = (number: string, options?: PhoneOptions): string => {
    // ...
};
```

---

## Troubleshooting

### Issue: Decryption Returns Empty String

**Cause:** Wrong encryption key or corrupted data

**Solution:**
```typescript
// Verify encryption key matches
const key = import.meta.env.VITE_CRYPTO_KEY;
console.log("Key exists:", !!key);
console.log("Key length:", key?.length);

// Check encrypted data format
const encrypted = localStorage.getItem("token");
console.log("Encrypted data:", encrypted?.substring(0, 20) + "...");

// Try with safer decryption
const decrypted = decryptLS(encrypted);
if (!decrypted) {
    // Data is corrupted, clear and ask user to login again
    localStorage.removeItem("token");
    redirect("/login");
}
```

---

### Issue: Phone Formatting Not Working

**Cause:** Input format not handled

**Solution:**
```typescript
// Support more input formats
const cleanPhone = (phone: string): string => {
    return phone
        .replace(/[\s\-()]/g, '')  // Remove separators
        .replace(/[^0-9+]/g, '');  // Keep only digits and +
};

const formatted = formatPhoneNumber(cleanPhone(userInput));
```

---

### Issue: Browser Detection Returns "Unknown"

**Cause:** User agent string doesn't match patterns

**Solution:**
```typescript
// Add more browser patterns
const getBrowser = (): string => {
    const ua = navigator.userAgent;
    
    // Add logging for debugging
    console.log("User Agent:", ua);
    
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    // Add more patterns as needed
    
    return "Unknown";
};
```

---

### Issue: Message Not Found in MessageList

**Cause:** Server error key not mapped

**Solution:**
```typescript
// Add fallback with logging
export const getMessage = (serverError: string): string => {
    const messageKey = errorToIdKey[serverError];
    
    if (!messageKey) {
        // Log for future mapping
        console.warn(`Unmapped error: ${serverError}`);
        return serverError;  // Return as-is if not mapped
    }
    
    return MessageList[messageKey] || 'Terjadi kesalahan';
};

// Add new mappings as discovered
// errorToIdKey["new_error_code"] = "id_new_error_message";
```

---

### Issue: Nested Value Returns Undefined

**Cause:** Path syntax incorrect or object is null

**Solution:**
```typescript
// Both path syntaxes should work
getNestedValue(obj, "user.profile.address");      // Dot notation
getNestedValue(obj, "user['profile']['address']"); // Bracket notation

// Debug with logging
const debugGetNestedValue = (obj: any, path: string) => {
    console.log("Object:", obj);
    console.log("Path:", path);
    const result = getNestedValue(obj, path);
    console.log("Result:", result);
    return result;
};
```

---

### Issue: Format Function Returns null

**Cause:** Invalid or empty input

**Solution:**
```typescript
// Validate before formatting
const formatSafely = (value: any, formatter: (v: any) => string | null): string => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
        return "N/A";  // Default display
    }
    
    const formatted = formatter(value);
    return formatted || "Invalid";  // Fallback for format errors
};

// Usage
const phone = formatSafely(userPhone, formatPhoneNumber);
const amount = formatSafely(price, rupiahCurrencyFormat);
```

---

## Related Skills

**Often Used Together**
- [api-client-services](../api-client-services/SKILL.md) - Uses encryption utilities for token handling and HMAC signing
- [global-state-management-zustand](../global-state-management-zustand/SKILL.md) - Uses utilities for validation and formatting in store operations

**Can Reference**
- [typescript-type-definitions](../typescript-type-definitions/SKILL.md) - For typing utility function parameters and return values

## References

### Environment Variables Required
```
VITE_CRYPTO_KEY=your-aes-encryption-key
VITE_APP_PRIVATE_KEY=your-private-key
VITE_APP_PUBLIC_KEY=your-public-key
VITE_APP_API_KEY=your-api-key
VITE_APP_BASE_ENV=development|staging|production
```

### External Documentation
- **CryptoJS:** https://cryptojs.gitbook.io/ - Encryption library
- **Moment.js:** https://momentjs.com/ - Date/time manipulation
- **Intl API:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl - Internationalization
- **User Agent:** https://developer.mozilla.org/docs/Web/API/Navigator/userAgent

### Dependencies Used
```json
{
  "crypto-js": "^4.2.0",
  "moment": "^2.30.1"
}
```

### Related Code Files
- `src/lib/utils/Crypto.ts` - Encryption/decryption
- `src/lib/utils/format.ts` - Data formatting
- `src/lib/utils/Access.ts` - Device and environment detection
- `src/lib/utils/utils.ts` - General utilities
- `src/lib/utils/MessageList.ts` - Error message mapping
- `src/lib/utils/menuUtils.ts` - Menu navigation helpers

---
name: api-client-services
description: Complete guide for building and organizing API clients and service functions in src/lib/api/. Learn Axios configuration for multiple microservices, implementing request interceptors, generating HMAC signatures, handling authentication with token encryption, and organizing domain-specific service functions.
---

## What Is API Client & Services?

API Client & Services is the layer in `src/lib/api/` that handles all backend communication. It provides:

- **Axios Client Setup**: Factory function to create domain-specific Axios instances configured for different microservices
- **Service Functions**: Async functions organized by domain that perform API calls (fetch, create, update, delete)
- **Authentication Handling**: Token retrieval from store, decryption, and inclusion in requests
- **Request Signing**: HMAC SHA256 signature generation for request validation
- **Error Handling**: Proper error throwing and handling for network failures

## When to Use:

  - Setting up new Axios client instances for different microservices
  - Creating service functions that communicate with the backend API
  - Implementing request/response interceptors
  - Handling authentication with encrypted tokens
  - Generating request signatures for security
  - Organizing API calls by domain (contacts, employees, IDM, MDM)
  - Managing different authentication patterns (token-based, public key-based)

## Prerequisites:

  - Installation & Initial Setup skill completed (project initialized with dependencies)
  - Understanding of environment variables (.env files)
  - Familiarity with Zustand for state management
  - Knowledge of async/await and Promises
  - Basic understanding of cryptography (HMAC SHA256)
  - HTTP knowledge (GET, POST, headers, request/response)

## Folder Structure Overview

```
src/lib/api/
├── client.ts                          # Axios client factory and instances
├── contacts/contactServices.ts        # Contact/customer related API calls
├── employee/employeeService.ts        # Employee domain API calls
├── idm/idmService.ts                  # Identity Management service
├── mdm/mdmService.ts                  # Master Data Management service
├── origination/originationService.ts  # Origination service
├── partner/partnerService.ts          # Partner domain API calls
├── activity/activityService.ts        # Activity tracking service
└── task/taskService.ts                # Task management service
```

**Key Points:**
- Single `client.ts` creates and exports all domain-specific Axios instances
- Each domain folder (contacts, employee, idm, etc.) contains service functions for that domain
- Service functions import their specific client from `client.ts`
- All authentication and signature logic is handled within each service function

## Core Patterns

### Pattern 1: Axios Client Setup (Factory Function)

Creates domain-specific Axios instances from base URLs stored in environment variables.

```typescript
// src/lib/api/client.ts
import axios from "axios";
import moment from "moment";

const BASE_URLS = {
    CUSTOMER: import.meta.env.VITE_APP_HOST_CUSTOMER || "",
    IDM: import.meta.env.VITE_APP_HOST_IDM || "",
    MDM: import.meta.env.VITE_APP_HOST_MDM || "",
    EMP: import.meta.env.VITE_APP_HOST_EMPLOYEE || "",
    ORG: import.meta.env.VITE_APP_HOST_ORIGINATION || "",
    ACTIVITY: import.meta.env.VITE_APP_HOST_ACTIVITY || "",
    TASK: import.meta.env.VITE_APP_HOST_TASK || "",
    PRT: import.meta.env.VITE_APP_HOST_PARTNER || ""
}

// Utility: Get current datetime in UTC+0700 timezone
export const customDateTimezone = () => {
    let datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
    return datetime;
};

// Factory function to create Axios instances with base configuration
export const createAxiosClient = (apiName: keyof typeof BASE_URLS) => {
    const instance = axios.create({
        baseURL: BASE_URLS[apiName],
    });

    // Add request interceptor for common processing
    instance.interceptors.request.use((config) => {
        // Add any common headers or transformations here
        return config;
    });

    return instance;
};

// Export pre-configured client instances
export const customerApiClient = createAxiosClient("CUSTOMER");
export const idmApiClient = createAxiosClient("IDM");
export const mdmApiClient = createAxiosClient("MDM");
export const empApiClient = createAxiosClient("EMP");
export const orgApiClient = createAxiosClient("ORG");
export const activityApiClient = createAxiosClient("ACTIVITY");
export const taskApiClient = createAxiosClient("TASK");
export const partnerApiClient = createAxiosClient("PRT");
```

**Key Characteristics:**
- Base URLs from environment variables (allows different URLs per environment)
- Factory pattern for creating consistent instances
- Request interceptor integration point for common logic
- Single source of truth for all microservice URLs

---

### Pattern 2: Basic Authenticated Service Function (Token-Based)

Retrieves auth token, decrypts it, generates signature, and makes secure API call.

```typescript
// src/lib/api/mdm/mdmService.ts
import moment from "moment";
import { decryptLS } from "../../utils/Crypto";
import { mdmApiClient } from "../client";
import CryptoJS from "crypto-js";
import { useAuthStore } from "../../../stores/useAuthStore";

const privateKey = import.meta.env.VITE_APP_PRIVATE_KEY

// GET request with authentication
export const fetchAreaList = async (params: any) => {
    // 1. Get encrypted token from auth store
    const { token: encryptedToken } = useAuthStore.getState();
    if (!encryptedToken) throw new Error("Token not found");

    // 2. Decrypt token before using
    const token = decryptLS(encryptedToken);
    if (!token) throw new Error("Failed to decrypt token");

    // 3. Generate current datetime in UTC+0700
    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');

    // 4. Generate HMAC SHA256 signature
    const signature = CryptoJS.HmacSHA256(token + datetime, privateKey).toString();

    // 5. Execute GET request with auth headers
    const response = await mdmApiClient.get("/mdm/area/get", {
        params: params,
        headers: {
            "Authorization": `token = ${token}`,
            "DT-SMSF-Datetime": datetime,
            "DT-SMSF-Signature": signature
        }
    })

    // 6. Return response data
    return response?.data
}
```

**Key Characteristics:**
- Gets encrypted token from Zustand store
- Decrypts token using utility function before use
- Generates timestamp in UTC+0700 timezone
- Creates HMAC SHA256 signature as security measure
- Includes custom headers for datetime and signature
- Returns response.data directly
- Error handling for missing/decryption failures

---

### Pattern 3: Authenticated POST Service Function (With Request Body)

Creates/updates data with authentication, signature generation based on multiple fields.

```typescript
// src/lib/api/contacts/contactServices.ts
import { useAuthStore } from "../../../stores/useAuthStore";

export const updateContacts = async (body: any) => {
    // 1. Get and decrypt token
    const { token: encryptedToken } = useAuthStore.getState();
    if (!encryptedToken) throw new Error("Token not found");

    const token = decryptLS(encryptedToken);
    if (!token) throw new Error("Failed to decrypt token");

    // 2. Generate datetime
    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');

    // 3. Extract specific fields for signature
    const { user_code, email, handphone } = body;

    // 4. Generate signature from multiple fields
    // Signature includes: token + userId + typeCode + email + handphone + datetime
    const signature = CryptoJS.HmacSHA256(
        token +
        user_code +
        "7" +           // Type code (hardcoded or from body)
        email +
        handphone +
        datetime,
        privateKey
    ).toString();

    // 5. POST with signature and custom headers
    const response = await customerApiClient.post('/customer/contact/update', {
        ...body,
        datetime,
        signature
    },
        {
            headers: {
                'Authorization': `token = ${token}`
            }
        }
    )

    // 6. Return response data
    return response.data;
}
```

**Key Characteristics:**
- Extracts specific fields from request body for signature generation
- Signature composition varies by endpoint (includes relevant data fields)
- Includes datetime and signature in request body (not just headers)
- Uses spread operator to merge custom fields with original body
- POST method for data mutation operations

---

### Pattern 4: Public Endpoint Authentication (API Key Based)

Authenticates using API key and device information instead of encrypted token.

```typescript
// src/lib/api/idm/idmService.ts
import { getApiKey, getDeviceID, getPublicKey, getSource } from "../../utils/Access";

export const receiveIpPublic = async () => {
    // 1. Gather public authentication data
    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
    const deviceID = getDeviceID;
    const device_ID = deviceID.replace(/:/g, '');
    const appCode = "intools-v2";
    const source = getSource;
    const apiKey = getApiKey;
    const publicKey: any = getPublicKey;

    // 2. Generate token from API key, source, and device ID
    const token = btoa(`${apiKey}:${source}:${device_ID}`);

    // 3. Build authentication headers
    const headers = {
        Authorization: `token=${token}`,
        'DT-SMSF-API-Key': apiKey,
        'DT-SMSF-Source': source,
        'DT-SMSF-DeviceID': deviceID,
        'DT-SMSF-Datetime': datetime,
        'Content-Type': 'application/json',
    };

    // 4. Create signature from base64 encoded message
    const message = btoa(`${apiKey}:${source}:${device_ID}:${datetime}`);
    const signaturePayload = `${message}${apiKey}${appCode}${datetime}`;
    const signature = CryptoJS.HmacSHA256(signaturePayload, publicKey).toString();

    // 5. Build request body with datetime and signature
    const body = {
        app_code: appCode,
        datetime,
        signature,
    };

    // 6. Execute request with error handling
    try {
        const response = await idmApiClient.post(
            "/idm/public/ip/receive",
            body,
            { headers }
        );
        return response.data;
    } catch (error: any) {
        console.error("Failed to receive public IP:", error);
        throw error;
    }
};
```

**Key Characteristics:**
- Uses API key + source + device ID instead of encrypted token
- Encodes authentication data in base64
- Different signature generation using public key
- More complex header structure with multiple custom headers
- Error handling with logging
- Used for unauthenticated or initial authorization endpoints

---

## Complete Workflows

### Workflow 1: Create New Axios Client for New Microservice

**Goal:** Add a new microservice to your API layer

**Steps:**

1. **Add Environment Variable** - Update `.env`, `.env.staging`, `.env.production`
   ```
   VITE_APP_HOST_NEWSERVICE=https://api.example.com/newservice
   ```

2. **Update BASE_URLS** - Add to `src/lib/api/client.ts`
   ```typescript
   const BASE_URLS = {
       // ... existing services
       NEWSERVICE: import.meta.env.VITE_APP_HOST_NEWSERVICE || ""
   }
   ```

3. **Create Factory Instance** - Export in `client.ts`
   ```typescript
   export const newServiceApiClient = createAxiosClient("NEWSERVICE");
   ```

4. **Create Service Folder** - Create `src/lib/api/newservice/` folder

5. **Create Service File** - New file `src/lib/api/newservice/newServiceService.ts`
   ```typescript
   import { newServiceApiClient } from "../client";
   import { useAuthStore } from "../../../stores/useAuthStore";
   // ... implement service functions
   ```

6. **Implement Service Functions** - Add specific API calls (see Workflow 2)

7. **Test in Component** - Import and use in component or React Query hook

---

### Workflow 2: Create New Service Function with Authentication

**Goal:** Add a new API endpoint function

**Prerequisites:** Axios client already created (see Workflow 1)

**Steps:**

1. **Identify Endpoint Requirements** - Determine from API documentation:
   - HTTP method (GET, POST, PUT, DELETE)
   - Endpoint path
   - Required parameters/fields
   - Authentication method (token vs public key)
   - Fields needed for signature generation

2. **Create Function Signature** - Define clear interface
   ```typescript
   export const fetchNewData = async (params: any) => {
       // Implementation
   }
   ```

3. **Get & Decrypt Token** - If using token authentication
   ```typescript
   const { token: encryptedToken } = useAuthStore.getState();
   if (!encryptedToken) throw new Error("Token not found");

   const token = decryptLS(encryptedToken);
   if (!token) throw new Error("Failed to decrypt token");
   ```

4. **Generate Datetime** - Timezone-aware timestamp
   ```typescript
   const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
   ```

5. **Build Signature** - HMAC SHA256 from relevant fields
   ```typescript
   const signature = CryptoJS.HmacSHA256(token + datetime, privateKey).toString();
   ```

6. **Execute Request** - Use specific client instance
   ```typescript
   const response = await newServiceApiClient.get("/endpoint/path", {
       params,
       headers: {
           "Authorization": `token = ${token}`,
           "DT-SMSF-Datetime": datetime,
           "DT-SMSF-Signature": signature
       }
   });
   ```

7. **Return Data** - Extract response data
   ```typescript
   return response?.data;
   ```

8. **Test Function** - Call from React Query hook or component

---

### Workflow 3: Integrate Service Function into React Query Hook

**Goal:** Use service function with React Query for caching and state management

**Prerequisites:** Service function created, `@tanstack/react-query` installed

**See:** Custom React Hooks skill for detailed React Query patterns

**Quick Integration:**
```typescript
// src/hooks/custom/useNewData.ts
import { useQuery } from "@tanstack/react-query";
import { fetchNewData } from "../../lib/api/newservice/newServiceService";
import { useAuthStore } from "../../stores/useAuthStore";

export const useNewData = (params: any) => {
    const { isAuthLoading } = useAuthStore();

    return useQuery({
        queryKey: ["newData", params],
        queryFn: () => fetchNewData(params),
        enabled: !isAuthLoading,  // Wait for auth to complete
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
        retry: false,              // Don't retry on failure
    });
};
```

---

### Workflow 4: Handle Authentication Errors in Service Functions

**Goal:** Gracefully handle 403/401 errors and redirect to login

**Prerequisites:** Service function with authentication

**Steps:**

1. **Wrap in Try-Catch** - Catch errors
   ```typescript
   try {
       const response = await customerApiClient.post('/endpoint', {
           // request body
       }, { headers });
       return response.data;
   } catch (error: any) {
       // Handle error
   }
   ```

2. **Check Error Status** - Identify 403/401
   ```typescript
   if (error.response?.status === 403 || error.response?.status === 401) {
       // Unauthorized: clear auth and redirect
   }
   ```

3. **Clear Auth State** - Reset store and logout
   ```typescript
   const { logout } = useAuthStore.getState();
   logout();
   ```

4. **Redirect to Login** - Use router
   ```typescript
   window.location.href = '/login';
   ```

5. **Re-throw Error** - For upstream handling
   ```typescript
   throw new Error("Unauthorized - please login again");
   ```

**Complete Error Handler Pattern:**
```typescript
try {
    const response = await customerApiClient.post('/customer/data', body, {
        headers: { "Authorization": `token = ${token}` }
    });
    return response.data;
} catch (error: any) {
    if (error.response?.status === 403) {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/login';
        throw new Error("Unauthorized - session expired");
    }
    throw error;
}
```

---

### Workflow 5: Create Multiple Service Functions in Single File

**Goal:** Organize multiple related endpoints in one service file

**Prerequisites:** Service file structure created

**Pattern:** Multiple functions, single imports
```typescript
// src/lib/api/contacts/contactServices.ts
import moment from "moment";
import { decryptLS } from "../../utils/Crypto";
import { customerApiClient } from "../client";
import CryptoJS from "crypto-js";
import { useAuthStore } from "../../../stores/useAuthStore";

const privateKey = import.meta.env.VITE_APP_PRIVATE_KEY;

// Function 1: GET list
export const fetchCustomerList = async (params: any) => {
    // ... authentication and request logic
};

// Function 2: POST update
export const updateCustomerLeadStatus = async (body: any) => {
    // ... authentication and request logic
};

// Function 3: POST create
export const updateContacts = async (body: any) => {
    // ... authentication and request logic
};

// Function 4: POST update subresource
export const updatePhoneNumbers = async (body: any) => {
    // ... authentication and request logic
};

// Function 5: DELETE with signature
export const unmaskPhoneContact = async (body: any) => {
    // ... authentication and request logic
};
```

**Best Practices:**
- Group all related functions in single file by domain
- Export all functions as named exports
- Use consistent naming: `fetch*`, `create*`, `update*`, `delete*`
- Share imports and privateKey across functions
- Group helper logic (signature generation) if common

---

## Advanced Patterns

### Pattern A: Service Function with File Upload

Handle file uploads with progress tracking.

```typescript
export const uploadContactDocument = async (customerId: string, file: File): Promise<any> => {
    const { token: encryptedToken } = useAuthStore.getState();
    if (!encryptedToken) throw new Error("Token not found");

    const token = decryptLS(encryptedToken);
    if (!token) throw new Error("Failed to decrypt token");

    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
    const signature = CryptoJS.HmacSHA256(token + datetime, privateKey).toString();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customer_id', customerId);
    formData.append('datetime', datetime);
    formData.append('signature', signature);

    // Execute with progress event
    const response = await customerApiClient.post(
        '/customer/document/upload',
        formData,
        {
            headers: {
                'Authorization': `token = ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                const percent = (progressEvent.loaded / (progressEvent.total ?? 1)) * 100;
                console.log(`Upload progress: ${percent}%`);
            }
        }
    );

    return response.data;
};
```

---

### Pattern B: Service Function with Query Pagination

Handle paginated GET requests efficiently.

```typescript
export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    filter?: any;
}

export const fetchContactsWithPagination = async (params: PaginationParams) => {
    const { token: encryptedToken } = useAuthStore.getState();
    if (!encryptedToken) throw new Error("Token not found");

    const token = decryptLS(encryptedToken);
    if (!token) throw new Error("Failed to decrypt token");

    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
    const signature = CryptoJS.HmacSHA256(token + datetime, privateKey).toString();

    const response = await customerApiClient.get('/customer/list', {
        params: {
            page: params.page,
            limit: params.limit,
            sort: params.sort || 'created_desc',
            ...params.filter
        },
        headers: {
            "Authorization": `token = ${token}`,
            "DT-SMSF-Datetime": datetime,
            "DT-SMSF-Signature": signature
        }
    });

    return response.data;
};
```

---

### Pattern C: Service Function with Request Retry Logic

Retry failed requests with exponential backoff.

```typescript
const retryRequest = async (
    fn: () => Promise<any>,
    retries: number = 3,
    delay: number = 1000
): Promise<any> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries <= 0 || error.response?.status === 403) {
            throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(fn, retries - 1, delay * 2);
    }
};

export const fetchCustomerListWithRetry = async (params: any) => {
    const { token: encryptedToken } = useAuthStore.getState();
    if (!encryptedToken) throw new Error("Token not found");

    const token = decryptLS(encryptedToken);
    if (!token) throw new Error("Failed to decrypt token");

    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');
    const signature = CryptoJS.HmacSHA256(token + datetime, privateKey).toString();

    return retryRequest(() =>
        customerApiClient.get('/customer/menu/get', {
            params,
            headers: {
                "Authorization": `token = ${token}`,
                "DT-SMSF-Datetime": datetime,
                "DT-SMSF-Signature": signature
            }
        })
    );
};
```

---

### Pattern D: Multiple Signature Fields Based on Operation

Different endpoints require different signature compositions.

```typescript
// Type for signature generation
type SignatureConfig = {
    fields: string[];        // Fields to include in signature
    encoding?: 'base64' | 'plain';
    hashFunction?: 'sha256' | 'sha512';
};

const generateSignature = (data: any, config: SignatureConfig, privateKey: string): string => {
    const message = config.fields
        .map(field => data[field] || '')
        .join('');
    
    if (config.encoding === 'base64') {
        return btoa(CryptoJS.HmacSHA256(message, privateKey).toString());
    }
    
    return CryptoJS.HmacSHA256(message, privateKey).toString();
};

// Usage
export const updateCustomerStatus = async (body: any) => {
    const { token: encryptedToken } = useAuthStore.getState();
    if (!encryptedToken) throw new Error("Token not found");

    const token = decryptLS(encryptedToken);
    const datetime = moment().utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss');

    const signature = generateSignature(
        {
            token,
            user_code: body.user_code,
            status: body.status,
            datetime
        },
        {
            fields: ['token', 'user_code', 'status', 'datetime'],
            encoding: 'plain'
        },
        privateKey
    );

    const response = await customerApiClient.post(
        '/customer/status/update',
        { ...body, datetime, signature },
        { headers: { 'Authorization': `token = ${token}` } }
    );

    return response.data;
};
```

---

## Best Practices

### 1. Single Responsibility for Service Functions
- **Do:** Each function calls one endpoint
- **Don't:** Combine multiple API calls in one function (use React Query hooks instead)

### 2. Consistent Error Handling
- **Do:** Check for token before making requests
- **Don't:** Silently fail if token is missing
- **Do:** Log meaningful error messages
- **Don't:** Expose sensitive information in error messages

### 3. Type Safety
```typescript
// GOOD: Strong typing
export const updateContact = async (body: UpdateContactBody): Promise<ContactResponse> => {
    // ...
};

// AVOID: Any types
export const updateContact = async (body: any): Promise<any> => {
    // ...
};
```

### 4. Consistent Datetime and Timezone
- **Do:** Always use `moment().utcOffset('+0700')` for consistency
- **Don't:** Mix different timezone formats

### 5. Signature Generation Order
- **Do:** Include all required fields in exact order
- **Example:** `token + user_code + status + datetime`
- **Don't:** Change field order - backend validation will fail

### 6. Token Decryption Validation
```typescript
// GOOD: Validate both encryption and decryption
const { token: encryptedToken } = useAuthStore.getState();
if (!encryptedToken) throw new Error("Token not found");

const token = decryptLS(encryptedToken);
if (!token) throw new Error("Failed to decrypt token");

// AVOID: No validation
const token = decryptLS(useAuthStore.getState().token);
```

### 7. Response Data Extraction
```typescript
// GOOD: Use optional chaining and return data
return response?.data;

// AVOID: Returning whole response
return response;
```

### 8. Service Function Organization
```
src/lib/api/
├── client.ts                    (Single file for all clients)
├── contacts/
│   └── contactServices.ts       (Multiple functions, single file)
├── employee/
│   └── employeeService.ts       (Multiple functions, single file)
└── ...
```

---

## Troubleshooting

### Issue: "Token not found" Error

**Cause:** Auth store is empty on component mount

**Solution:**
```typescript
// Use React Query with enabled flag
export const useContactList = (params: any) => {
    const { isAuthLoading } = useAuthStore();

    return useQuery({
        queryKey: ['contacts', params],
        queryFn: () => fetchContactList(params),
        enabled: !isAuthLoading,  // Wait for auth
    });
};
```

---

### Issue: "Failed to decrypt token" Error

**Cause:** Token format is invalid or encryption key is wrong

**Solution:**
1. Verify VITE_APP_PRIVATE_KEY is set correctly in `.env`
2. Check token storage format (should be encrypted string)
3. Verify decryptLS utility function is working

```typescript
// Debug: Check token value
const { token } = useAuthStore.getState();
console.log('Encrypted token:', token?.substring(0, 20) + '...');
console.log('Private key exists:', !!import.meta.env.VITE_APP_PRIVATE_KEY);
```

---

### Issue: Signature Mismatch (400 Bad Request)

**Cause:** Signature generation doesn't match backend calculation

**Solutions:**
1. **Verify field order:** Check API docs for exact signature composition
2. **Include all required fields:** Missing fields cause signature mismatch
3. **Timezone consistency:** Use same timezone as backend (UTC+0700)
4. **Encoding format:** Ensure base64 encoding matches expectations

```typescript
// Correct: Matches backend exactly
const signature = CryptoJS.HmacSHA256(
    token + user_code + "7" + email + handphone + datetime,
    privateKey
).toString();
```

---

### Issue: 401/403 Unauthorized After Token Refresh

**Cause:** Old/expired token in store not updated

**Solution:** Clear and refresh auth in mutation hooks
```typescript
const mutation = useMutation({
    mutationFn: updateContact,
    onError: (error: any) => {
        if (error.response?.status === 403) {
            const { logout } = useAuthStore.getState();
            logout();
            window.location.href = '/login';
        }
    }
});
```

---

### Issue: CORS Errors on API Requests

**Cause:** Browser CORS policy blocking requests from frontend origin

**Solution:**
1. Verify `baseURL` in client.ts matches backend CORS whitelist
2. Check that backend allows your frontend origin
3. Ensure credentials are set if needed (but typically not with token auth)

```typescript
// If credentials needed
export const createAxiosClient = (apiName: keyof typeof BASE_URLS) => {
    return axios.create({
        baseURL: BASE_URLS[apiName],
        withCredentials: true,  // Include cookies
    });
};
```

---

### Issue: Requestswork in Postman but fail in app

**Cause:** Missing headers or incorrect authentication

**Verification Checklist:**
- [ ] Authorization header included with correct token
- [ ] DT-SMSF-Datetime header included and timezone correct
- [ ] DT-SMSF-Signature header included and matches backend
- [ ] Request body includes datetime and signature fields
- [ ] All signature fields in exact order from API docs
- [ ] Token is decrypted (not encrypted) when sent

---

### Issue: Memory Leaks in Service Functions

**Cause:** Requests not aborted on component unmount

**Solution:** Use React Query cancellation
```typescript
export const useContactList = (params: any) => {
    const queryClient = useQueryClient();
    const { isAuthLoading } = useAuthStore();

    return useQuery({
        queryKey: ['contacts', params],
        queryFn: ({ signal }) => fetchContactList(params, signal),
        enabled: !isAuthLoading,
    });
};

// Update service function to accept signal
export const fetchContactList = async (params: any, signal?: AbortSignal) => {
    // ...
    const response = await customerApiClient.get('/endpoint', {
        params,
        signal,  // Pass abort signal
        headers: { /* ... */ }
    });
    return response.data;
};
```

---

## References

### Related Skills
- **Custom React Hooks:** For wrapping service functions in useQuery/useMutation
- **Global State Management (Zustand):** For auth token storage and retrieval
- **Installation & Initial Setup:** For environment variable configuration

### Environment Variables Required
```
VITE_APP_PRIVATE_KEY=your-private-key
VITE_APP_TOKEN_TYPE=token_key
VITE_APP_USER_TYPE=user_key
VITE_APP_HOST_CUSTOMER=https://api.example.com/customer
VITE_APP_HOST_IDM=https://api.example.com/idm
VITE_APP_HOST_MDM=https://api.example.com/mdm
VITE_APP_HOST_EMPLOYEE=https://api.example.com/employee
VITE_APP_HOST_ORIGINATION=https://api.example.com/origination
VITE_APP_HOST_ACTIVITY=https://api.example.com/activity
VITE_APP_HOST_TASK=https://api.example.com/task
VITE_APP_HOST_PARTNER=https://api.example.com/partner
```

### External Documentation
- **Axios:** https://axios-http.com/ - HTTP client library
- **CryptoJS:** https://cryptojs.gitbook.io/ - Encryption/decryption
- **Moment.js:** https://momentjs.com/ - Datetime manipulation
- **HMAC SHA256:** https://en.wikipedia.org/wiki/HMAC - Authentication

### Dependencies Used
```json
{
  "axios": "^1.13.0",
  "crypto-js": "^4.2.0",
  "moment": "^2.30.1"
}
```

### Related Code Files
- `src/lib/api/client.ts` - Axios client setup
- `src/lib/api/*/\*Service.ts` - Service function implementations
- `src/lib/utils/Crypto.ts` - Token decryption utilities
- `src/stores/useAuthStore.ts` - Auth state management
- `src/hooks/custom/\*.ts` - React Query hook wrappers

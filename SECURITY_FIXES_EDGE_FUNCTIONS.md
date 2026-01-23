# 🔒 SECURITY FIXES FOR EDGE FUNCTIONS

**Date:** 2026-01-23
**Priority:** CRITICAL
**Status:** Action Required

---

## 📋 OVERVIEW

This document contains CRITICAL and HIGH severity security fixes that must be applied to Supabase Edge Functions. These fixes cannot be applied via SQL migrations and require manual code changes.

---

## 🔴 CRITICAL-001: Fix CORS Wildcard Configuration

### Affected File
`supabase/functions/get-team-marche-selections/index.ts`

### Current Code (VULNERABLE)
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // ❌ ALLOWS ANY ORIGIN - CRITICAL VULNERABILITY
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

### Fixed Code (SECURE)
```typescript
// Whitelist of allowed origins
const ALLOWED_ORIGINS = [
  "https://socialy.app",
  "https://www.socialy.app",
  "https://socialy-dev.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Validate origin against whitelist
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

// Usage in handler:
serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // ... rest of handler

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

**Impact:** Prevents CSRF attacks and unauthorized data access from malicious websites.

---

## 🟠 HIGH-001: Fix Hardcoded Resend Email Address

### Affected File
`supabase/functions/send-invitation-email/index.ts` (Line 108)

### Current Code (VULNERABLE)
```typescript
from: "Socialy <onboarding@resend.dev>",  // ❌ TEST ADDRESS
```

### Fixed Code (SECURE)
```typescript
// Add to environment variables in Supabase dashboard:
// SENDER_EMAIL = "Socialy <noreply@yourdomain.com>"

from: Deno.env.get("SENDER_EMAIL") || "Socialy <onboarding@resend.dev>",
```

**Impact:** Ensures emails are sent from proper domain in production.

---

## 🟠 HIGH-002: Add URL Validation in Edge Functions

### Affected Files
- `supabase/functions/enrich-article/index.ts`
- `supabase/functions/add-market-topic/index.ts`
- `supabase/functions/create-communique/index.ts`

### Add This Helper Function
```typescript
/**
 * Validates URL to prevent SSRF attacks
 */
function validateUrl(url: string | undefined): string {
  if (!url) {
    throw new Error("URL is required");
  }

  // Whitelist validation: must be http/https
  const urlPattern = /^https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/;
  if (!urlPattern.test(url)) {
    throw new Error("Invalid URL format");
  }

  // Blacklist private IPs (prevent SSRF to internal services)
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;

  const privateIpPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
  ];

  for (const pattern of privateIpPatterns) {
    if (pattern.test(hostname)) {
      throw new Error("Access to private IPs is not allowed");
    }
  }

  return url;
}

// Usage example in enrich-article/index.ts:
const { link } = await req.json();
const validatedLink = validateUrl(link);  // ✅ Validate before using
```

**Impact:** Prevents SSRF attacks where attacker could access internal services.

---

## 🟠 HIGH-003: Add API Key Format Validation

### All Edge Functions Using API Keys

### Current Code (VULNERABLE)
```typescript
const apifyApiToken = Deno.env.get("APIFY_API_TOKEN");
if (!apifyApiToken) {
  throw new Error("API token missing");
}
// ❌ No validation that token is valid format
```

### Fixed Code (SECURE)
```typescript
const apifyApiToken = Deno.env.get("APIFY_API_TOKEN");
if (!apifyApiToken || apifyApiToken.trim().length === 0) {
  throw new Error("API token missing or empty");
}

// Validate token format (alphanumeric and common special chars)
if (!/^[a-zA-Z0-9_\-\.]+$/.test(apifyApiToken)) {
  throw new Error("Invalid API token format");
}
```

**Impact:** Prevents configuration errors and potential injection attacks.

---

## 🟠 HIGH-004: Add Organization Authorization Check

### Affected File
`supabase/functions/send-invitation-email/index.ts` (Lines 69-83)

### Current Code (VULNERABLE)
```typescript
// ❌ Only checks if user has ANY admin role, not if they're admin of THIS organization
if (!userRole || !["admin", "super_admin", "org_admin"].includes(userRole.role)) {
  return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403 });
}
```

### Fixed Code (SECURE)
```typescript
// Get user's role for THIS specific organization
const { data: userRole, error: roleError } = await supabaseAdmin
  .rpc('get_user_org_role', {
    check_user_id: user.id,
    check_org_id: organizationId  // ✅ Check for THIS organization
  });

if (roleError || !userRole || !["admin", "super_admin", "org_admin"].includes(userRole)) {
  return new Response(JSON.stringify({
    error: "You must be an admin of this organization to send invitations"
  }), { status: 403 });
}
```

**Impact:** Prevents privilege escalation where admin of Org A could invite users to Org B.

---

## 🟡 MEDIUM: Add Error Message Sanitization

### All Edge Functions

### Add This Helper Function
```typescript
/**
 * Sanitizes error messages to prevent information disclosure
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose stack traces or internal paths in production
    const message = error.message;

    // Remove file paths
    const sanitized = message.replace(/\/[^\s]+\.(ts|js|sql)/g, '[file]');

    // Remove database details
    return sanitized
      .replace(/relation "[^"]+"/g, 'table')
      .replace(/column "[^"]+"/g, 'column')
      .replace(/constraint "[^"]+"/g, 'constraint');
  }

  return "An unexpected error occurred";
}

// Usage:
try {
  // ... operation
} catch (error) {
  console.error("Internal error:", error); // Log full error for debugging
  return new Response(
    JSON.stringify({
      error: sanitizeErrorMessage(error)  // ✅ Send sanitized error to client
    }),
    { status: 500, headers: corsHeaders }
  );
}
```

**Impact:** Prevents information disclosure via error messages.

---

## 🟢 LOW: Add Security Headers

### All Edge Functions

### Add This Helper Function
```typescript
/**
 * Returns standard security headers for all responses
 */
function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}

// Usage in response:
return new Response(JSON.stringify(data), {
  headers: {
    ...corsHeaders,
    ...getSecurityHeaders(),  // ✅ Add security headers
    "Content-Type": "application/json",
  },
});
```

**Impact:** Adds defense-in-depth against various attack vectors.

---

## 📋 IMPLEMENTATION CHECKLIST

### Priority 1: CRITICAL (Do TODAY)
- [ ] Fix CORS wildcard in `get-team-marche-selections/index.ts`
- [ ] Apply same CORS fix to ALL edge functions
- [ ] Test CORS from your production domain

### Priority 2: HIGH (Do This Week)
- [ ] Add URL validation helper and apply to all functions accepting URLs
- [ ] Fix hardcoded Resend email address
- [ ] Add organization authorization check in `send-invitation-email`
- [ ] Add API key format validation

### Priority 3: MEDIUM (Do Within 2 Weeks)
- [ ] Implement error message sanitization across all functions
- [ ] Add structured logging (do NOT log sensitive data)
- [ ] Create shared utilities file for common security functions

### Priority 4: LOW (Do Within 1 Month)
- [ ] Add security headers to all responses
- [ ] Update Deno std libraries to latest versions
- [ ] Implement rate limiting (use Upstash or similar)

---

## 🧪 TESTING CHECKLIST

After applying fixes:

1. **CORS Testing:**
   ```bash
   # Test from allowed origin
   curl -H "Origin: https://socialy.app" -H "Access-Control-Request-Method: POST" \
        -X OPTIONS https://your-project.supabase.co/functions/v1/get-team-marche-selections

   # Should return: Access-Control-Allow-Origin: https://socialy.app
   ```

2. **URL Validation Testing:**
   ```typescript
   // Should REJECT these:
   validateUrl("http://localhost/admin")  // Private IP
   validateUrl("http://192.168.1.1")      // Private IP
   validateUrl("file:///etc/passwd")      // Non-HTTP protocol
   validateUrl("javascript:alert(1)")     // XSS attempt

   // Should ACCEPT these:
   validateUrl("https://example.com/article")  // Valid URL
   ```

3. **Authorization Testing:**
   - Test that org admin of Org A CANNOT invite to Org B
   - Test that non-admin users CANNOT send invitations
   - Test that super_admin CAN invite to any org

4. **Error Message Testing:**
   - Trigger errors and verify stack traces are NOT exposed
   - Verify database schema details are NOT exposed

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Deno Security Guide](https://deno.land/manual/basics/permissions)

---

## ⚠️ NOTES

1. **DO NOT commit this file with sensitive data** (API keys, tokens, etc.)
2. **Test all changes in staging** before deploying to production
3. **Keep a backup** of original functions before applying fixes
4. **Monitor logs** after deployment for any issues
5. **Rotate credentials** if any were exposed in git history

---

## 🆘 NEED HELP?

If you encounter issues while applying these fixes:

1. Test each fix in isolation
2. Check Supabase function logs for detailed error messages
3. Verify environment variables are set correctly in Supabase dashboard
4. Review CORS preflight requests in browser DevTools

---

**Generated by:** Security Audit (2026-01-23)
**Audit Report:** See `security_audit_report.md` for full details

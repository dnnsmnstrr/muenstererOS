## 2025-05-22 - Open Redirect via Redirect Utility

**Vulnerability:** Open Redirect and Path Traversal via the `restPath` parameter in the `getRedirectURL` utility.
**Learning:** The application allowed arbitrary strings to be appended to a redirect URL via the `restPath` parameter. Attackers could use `../` to traverse out of the intended path or `//` to create a protocol-relative link to an external domain.
**Prevention:** Always sanitize parameters that are used to build URLs for redirection. Use robust regex to remove traversal sequences and leading slashes that could be interpreted as protocol-relative.

## 2025-05-23 - Path Traversal Bypass via One-Pass Sanitization

**Vulnerability:** Path Traversal bypass in `getRedirectURL` via nested patterns like `....//`.
**Learning:** A single-pass `.replace()` call can be bypassed by nesting the search pattern within itself. For example, `....//` becomes `../` after one pass of removing `../`.
**Prevention:** Use a `while` loop to recursively apply sanitization until no more changes occur, or use more robust URL parsing logic that doesn't rely solely on string replacement.

## 2025-05-24 - Information Disclosure in API Error Responses

**Vulnerability:** API routes leaking detailed error messages and credentials in query parameters.
**Learning:** Returning raw error objects or messages from upstream APIs (like GitHub) can expose internal logic, stack traces, or service status. Additionally, accepting sensitive tokens in query parameters risks leakage via server logs and browser history.
**Prevention:** Use generic, user-safe error messages for all public-facing API failures. Log detailed errors server-side only. Enforce header-based authentication (e.g., `Authorization: Bearer <token>`) instead of query parameters for sensitive operations.

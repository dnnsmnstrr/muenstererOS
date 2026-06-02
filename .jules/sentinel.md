## 2025-05-22 - Open Redirect via Redirect Utility

**Vulnerability:** Open Redirect and Path Traversal via the `restPath` parameter in the `getRedirectURL` utility.
**Learning:** The application allowed arbitrary strings to be appended to a redirect URL via the `restPath` parameter. Attackers could use `../` to traverse out of the intended path or `//` to create a protocol-relative link to an external domain.
**Prevention:** Always sanitize parameters that are used to build URLs for redirection. Use robust regex to remove traversal sequences and leading slashes that could be interpreted as protocol-relative.

## 2025-05-23 - Path Traversal Bypass via One-Pass Sanitization

**Vulnerability:** Path Traversal bypass in `getRedirectURL` via nested patterns like `....//`.
**Learning:** A single-pass `.replace()` call can be bypassed by nesting the search pattern within itself. For example, `....//` becomes `../` after one pass of removing `../`.
**Prevention:** Use a `while` loop to recursively apply sanitization until no more changes occur, or use more robust URL parsing logic that doesn't rely solely on string replacement.

## 2026-06-02 - Insecure Credential Handling and Broken Access Control in Export API

**Vulnerability:** The `/api/export` endpoint accepted an insecure `token` query parameter and lacked owner-level authorization checks.
**Learning:** Accepting credentials in URL parameters leads to sensitive data exposure in server logs, browser history, and proxy logs. Furthermore, simply checking for the presence of a token is insufficient for administrative actions; the token's identity must be verified against the authorized owner.
**Prevention:** Strictly enforce the use of `Authorization` headers for sensitive tokens and perform explicit authorization checks against a known owner identity (e.g., matching the GitHub username from the `/user` endpoint) for all admin-level API routes.

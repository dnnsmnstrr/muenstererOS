## 2025-05-22 - Open Redirect via Redirect Utility

**Vulnerability:** Open Redirect and Path Traversal via the `restPath` parameter in the `getRedirectURL` utility.
**Learning:** The application allowed arbitrary strings to be appended to a redirect URL via the `restPath` parameter. Attackers could use `../` to traverse out of the intended path or `//` to create a protocol-relative link to an external domain.
**Prevention:** Always sanitize parameters that are used to build URLs for redirection. Use robust regex to remove traversal sequences and leading slashes that could be interpreted as protocol-relative.

## 2025-05-23 - Path Traversal Bypass via One-Pass Sanitization

**Vulnerability:** Path Traversal bypass in `getRedirectURL` via nested patterns like `....//`.
**Learning:** A single-pass `.replace()` call can be bypassed by nesting the search pattern within itself. For example, `....//` becomes `../` after one pass of removing `../`.
**Prevention:** Use a `while` loop to recursively apply sanitization until no more changes occur, or use more robust URL parsing logic that doesn't rely solely on string replacement.

## 2026-06-05 - Information Exposure via Chrome DevTools Endpoint

**Vulnerability:** Exposure of absolute server path via `process.cwd()` in the `.well-known/appspecific/com.chrome.devtools.json` endpoint.
**Learning:** While useful for local development, the Chrome DevTools Automatic Workspace connection endpoint leaks the server's internal filesystem structure if enabled in production.
**Prevention:** Restrict development-only endpoints and utilities that expose internal server state or environment details to only run when the application is in development mode.

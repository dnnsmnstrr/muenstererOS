## 2025-05-14 - [Avoid polluting repository with environmental files and lockfiles]

**Learning:** When running a development server or installing dependencies for verification, it's easy to accidentally modify package.json or create lockfiles/log files that should not be part of the PR. A localization PR should be focused only on i18n changes.

**Action:** Always run `git status` before submitting to ensure no unintended files (like dev.log, .env, or updated lockfiles) are included. Revert changes to package.json if dependencies were added only for local verification.

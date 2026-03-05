## 2025-05-14 - [Avoid polluting repository with environmental files and lockfiles]

**Learning:** When running a development server or installing dependencies for verification, it's easy to accidentally modify package.json or create lockfiles/log files that should not be part of the PR. A localization PR should be focused only on i18n changes.

**Action:** Always run `git status` before submitting to ensure no unintended files (like dev.log, .env, or updated lockfiles) are included. Revert changes to package.json if dependencies were added only for local verification.
# Tran's Journal - Localization Learnings

## 2025-05-14 - Global Date Formatting Optimization

**Learning:** Replacing hardcoded locales in utility functions is a high-impact, low-risk way to internationalize an entire application. It ensures consistency across different pages (Timeline, Logs, etc.) without modifying each component individually.

**Action:** Always check core utility files for hardcoded locale strings like 'en-US' or fixed date formats.

## 2025-05-14 - Svelte 5 Rune Access in .ts files

**Learning:** Reading Svelte 5 `$state` from a regular `.ts` file is supported and does not strictly require the `.svelte.ts` extension unless you are defining state or using other runes that require the Svelte compiler to transform the file. This avoids potential module resolution issues with some tools that expect standard extensions.

**Action:** Prefer `.ts` for simple utilities that only read state, but use `.svelte.ts` if defining reactive state or using `$derived` / `$effect` in the module.

## 2025-05-14 - [Manual Pluralization and ARIA Localization]

**Learning:** The current i18n system supports interpolation but lacks native pluralization logic. Additionally, accessibility labels (aria-label) and titles are often overlooked during localization but are critical for an international experience.

**Action:** Handle pluralization manually in components by selecting different translation keys based on counts (e.g., `key_one`, `key_many`). Always search for and localize `aria-label`, `title`, and other user-facing accessibility strings.

## 2025-05-15 - Clean Workspace Before Submission

**Learning:** Automated code reviews will flag accidental inclusion of log files (e.g., dev_server.log) or environment files (.env) even if they are only in the working directory but not intended for commit.

**Action:** Explicitly delete any temporary files created during verification or local testing before calling the submit tool.

## 2026-03-03 - [Reactive i18n with Svelte 5 $state]

**Learning:** The project's i18n service uses Svelte 5's $state for the current language. Components that import this service (e.g., i18n.svelte.ts) automatically become reactive to language changes when they use i18n.t(). No manual subscription or onDestroy logic is needed.

**Action:** When localizing Svelte 5 components, simply import the i18n service and use i18n.t('key') directly in the markup or in $derived runes for clean, reactive translations.

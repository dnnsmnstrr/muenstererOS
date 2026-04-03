# Tran's Journal - Localization Learnings

## 2026-02-14 - [Avoid polluting repository with environmental files and lockfiles]

**Learning:** When running a development server or installing dependencies for verification, it’s easy to accidentally modify package.json or create lockfiles/log files that should not be part of the PR. A localization PR should be focused only on i18n changes.

**Action:** Always run `git status` before submitting to ensure no unintended files (like dev.log, .env, or updated lockfiles) are included. Revert changes to package.json if dependencies were added only for local verification.

## 2026-02-14 - Global Date Formatting Optimization

**Learning:** Replacing hardcoded locales in utility functions is a high-impact, low-risk way to internationalize an entire application. It ensures consistency across different pages (Timeline, Logs, etc.) without modifying each component individually.

**Action:** Always check core utility files for hardcoded locale strings like 'en-US' or fixed date formats.

## 2026-02-14 - Svelte 5 Rune Access in .ts files

**Learning:** Reading Svelte 5 `$state` from a regular `.ts` file is supported and does not strictly require the `.svelte.ts` extension unless you are defining state or using other runes that require the Svelte compiler to transform the file. This avoids potential module resolution issues with some tools that expect standard extensions.

**Action:** Prefer `.ts` for simple utilities that only read state, but use `.svelte.ts` if defining reactive state or using `$derived` / `$effect` in the module.

## 2026-02-14 - [Manual Pluralization and ARIA Localization]

**Learning:** The current i18n system supports interpolation but lacks native pluralization logic. Additionally, accessibility labels (aria-label) and titles are often overlooked during localization but are critical for an international experience.

**Action:** Handle pluralization manually in components by selecting different translation keys based on counts (e.g., `key_one`, `key_many`). Always search for and localize `aria-label`, `title`, and other user-facing accessibility strings.

## 2026-02-15 - Clean Workspace Before Submission

**Learning:** Automated code reviews will flag accidental inclusion of log files (e.g., dev_server.log) or environment files (.env) even if they are only in the working directory but not intended for commit.

**Action:** Explicitly delete any temporary files created during verification or local testing before calling the submit tool.

## 2026-03-03 - [Reactive i18n with Svelte 5 $state]

**Learning:** The project's i18n service uses Svelte 5's $state for the current language. Components that import this service (e.g., i18n.svelte.ts) automatically become reactive to language changes when they use i18n.t(). No manual subscription or onDestroy logic is needed.

**Action:** When localizing Svelte 5 components, simply import the i18n service and use i18n.t('key') directly in the markup or in $derived runes for clean, reactive translations.

## 2026-03-04 - Localizing Text with Embedded Components

**Learning:** When localizing sentences that contain components (like `<Link>`), the established pattern in this repository is to split the sentence into prefix, link text, and suffix keys in the i18n files, then use them sequentially in the template.

**Action:** Avoid complex template literals for localizing components; use multiple `i18n.t()` calls instead.

## 2026-03-16 - [Localizing Pages with Complex SVG Elements]

**Learning:** When localizing pages that feature complex SVG elements (like the Slashes wheel), accessibility labels like `aria-label` are as important as the visible text. Furthermore, it is critical to use the `PAGE_TITLE_SUFFIX` for localized page titles to maintain brand consistency.

**Action:** Always check for `aria-label` in SVG or interactive elements when localizing a page. Use `PAGE_TITLE_SUFFIX` from `$lib/config` when setting localized titles in `<svelte:head>`.

## 2026-03-19 - [Redirect Aliases and Shared Namespaces]

**Learning:** When adding redirects, it's easy to create duplicate aliases (e.g., 'meta') that may conflict with existing names or other aliases, causing test failures. Additionally, using a central namespace for common route titles in the root layout simplifies site-wide localization but requires consistent key naming in `en.json` and `de.json`.

**Action:** Before submitting, run `pnpm test` to catch duplicate redirect aliases. Use `$derived.by` in root layouts to reactive handle localized page titles across the entire application.

## 2026-03-24 - [Namespace Consistency and Workflow Hygiene]

**Learning:** When localizing a new page, it is critical to ensure that the keys used in the component match the namespace and keys defined in the translation files. Furthermore, automated tools like `pnpm install` can generate large files like `pnpm-lock.yaml` which should be explicitly excluded from localization PRs to maintain focus and follow the "small optimization" rule.

**Action:** Double-check key mappings (e.g., `api.title` vs `common.api`) before submission. Always run `git status` and remove any unintended files (like lockfiles or temporary logs) before committing.

## 2026-04-03 - [Reusing Existing Namespaces for Consistent Data Localization]

**Learning:** When localizing components that display data categorized by pre-defined keys (like "Spring", "Summer"), reusing existing i18n namespaces (e.g., `playlists.seasons`) ensures that the terminology remains consistent across different parts of the application. This avoids "translation drift" where the same concept is translated differently in separate files.

**Action:** Always search the `en.json` and `de.json` files for existing keys that match the data values before adding new ones. Use dynamic path construction with `i18n.t()` to localize these values reactively.

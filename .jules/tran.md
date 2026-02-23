# Tran's Journal - Localization Learnings

## 2025-05-14 - Global Date Formatting Optimization

**Learning:** Replacing hardcoded locales in utility functions is a high-impact, low-risk way to internationalize an entire application. It ensures consistency across different pages (Timeline, Logs, etc.) without modifying each component individually.

**Action:** Always check core utility files for hardcoded locale strings like 'en-US' or fixed date formats.

## 2025-05-14 - Svelte 5 Rune Access in .ts files

**Learning:** Reading Svelte 5 `$state` from a regular `.ts` file is supported and does not strictly require the `.svelte.ts` extension unless you are defining state or using other runes that require the Svelte compiler to transform the file. This avoids potential module resolution issues with some tools that expect standard extensions.

**Action:** Prefer `.ts` for simple utilities that only read state, but use `.svelte.ts` if defining reactive state or using `$derived` / `$effect` in the module.

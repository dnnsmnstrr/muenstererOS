# GitHub Copilot Instructions

## Project Overview

muenstererOS is a **desktop-like personal website** built with **SvelteKit 2 + Svelte 5**, featuring a unique interactive OS-style interface with draggable windows, command palette navigation, and a sophisticated redirect system.

## Architecture & Key Patterns

### Core Technologies
- **SvelteKit 2** with **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$effect`)
- **TypeScript** with strict mode
- **shadcn-svelte** + **Bits UI** for components
- **TailwindCSS** with custom theming system
- **jsrepo** for external component management

### Critical File Structure
```
src/
├── lib/
│   ├── config.ts              # Central config with username variations
│   ├── redirects.ts           # redirect definitions with aliases
│   ├── components/ui/         # shadcn-svelte components
│   ├── stores/               # Svelte stores for global state
│   └── utils/
│       ├── api.ts            # Generic search/sort/pagination utilities
│       └── redirect.ts       # Redirect matching logic
├── data/                     # JSON data files (changes, playlists, etc.)
└── routes/
    ├── api/[slug]/+server.ts # Generic JSON API for any data file
    └── +error.svelte         # Auto-redirect handler for 404s
```

### Unique Redirect System
The site's **main feature** is a comprehensive redirect system with 300+ shortcuts:
- **Redirects** defined in `src/lib/redirects.ts` with `name`, `url`, `description`, `aliases[]` (including emoji)
- **404 handler** (`+error.svelte`) automatically tries to find redirects for unmatched URLs
- **Command palette** (Cmd+K) searches redirects and pages
- **API endpoints** at `/api/redirect/[query]` for external redirect resolution

### Data Architecture
- **JSON files** in `src/data/` (changes.json, playlists.json, etc.)
- **Generic API** at `/api/[slug]` serves any JSON file with search/sort/pagination
- **No database** - all data is static JSON with client-side search
- **RSS generation** via `npm run xml` script from changes.json

### UI System Conventions
- **Desktop metaphor** - draggable windows, dock, command palette
- **Cursor-following mask effect** in layout with CSS custom properties
- **Keyboard shortcuts** - extensive vim-like navigation (see `Command.svelte`)
- **Theme system** with CSS custom properties in `/themes.css`

## Development Patterns

### Component Organization
- Use **shadcn-svelte** components from `$lib/components/ui/`
- Check **jsrepo.json** for pinned versions of `@ieedan/shadcn-svelte-extras`
- Custom components in `$lib/components/` with TypeScript
- **No default exports** - use named exports with index.ts barrels

### Svelte 5 Patterns
```typescript
// Use runes for reactivity
let count = $state(0);
let doubled = $derived(count * 2);

// Props destructuring
let { items, onSelect } = $props();

// Effects for side effects
$effect(() => {
  console.log('count changed:', count);
});
```

### API Route Patterns
- **Generic endpoints** follow `/api/[slug]/+server.ts` pattern
- Support **query params**: `search`, `sortBy`, `direction`, `page`, `limit`
- Return **paginated results** with metadata: `{page, limit, total, totalPages, items}`
- Use `searchData()` and `sortData()` utilities from `src/lib/utils/api.ts`

### Routing Conventions
- Many routes have `export const ssr = false;` for client-side rendering
- Static pages use `export const prerender = true;`
- **Dynamic imports** for heavy components
- **File-based routing** with SvelteKit conventions

## Essential Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run xml          # Generate RSS from changes.json (run after updating changelog)
npm run check        # TypeScript + Svelte validation
npm run format       # Prettier formatting
```

## Key Integrations

### External Dependencies
- **Algolia search** for zettelkasten (requires `PUBLIC_ALGOLIA_API_ID`, `PUBLIC_ALGOLIA_API_KEY`)
- **GitHub Gists** for dynamic data (now page, resume)
- **Spotify embeds** for playlists

### Content Management
- **Changelog**: Add entries to `src/data/changes.json`, then run `npm run xml`
- **Redirects**: Add to `src/lib/redirects.ts` with name/aliases/url
- **Config**: Username/link variations auto-generated from `src/lib/config.ts`

## Development Notes

- **Strict TypeScript** - fix all type errors
- **Component imports** use `$lib/` path mapping
- **shadcn-svelte** follows exact same patterns as React version
- **CSS-in-JS** avoided - use Tailwind classes and CSS custom properties
- **Bundle analysis** - prefer dynamic imports for heavy components
- **Accessibility** - keyboard navigation is essential (see terminal, command palette)

When modifying redirects or adding new data files, remember to update corresponding API endpoints and ensure the search/filter functionality works correctly.

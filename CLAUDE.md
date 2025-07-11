# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run svelte-check with TypeScript
- `npm run check:watch` - Run svelte-check in watch mode
- `npm run test` - Run tests with Vitest
- `npm run lint` - Check code formatting with Prettier
- `npm run format` - Format code with Prettier
- `npm run xml` - Generate XML feed from changes.json

## Architecture Overview

This is a SvelteKit-based personal website called "muenstererOS" with a unique interactive desktop-like UI.

### Core Technologies
- **SvelteKit 2** with Svelte 5 - Full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom theming system
- **Bits UI** - Accessible component primitives
- **shadcn-svelte** - component library inspired by shadcn
- **Mode Watcher** - Dark/light mode management
- **Vitest** - Testing framework

### Key Architecture Patterns

#### Data Management
- Svelte stores in `src/lib/stores/` for global state
- Data files stored as JSON in `static/data/`
- Generic API handler at `/api/[slug]` that serves any JSON file from `static/data/`
- API utilities in `src/lib/utils/api.ts` for search, sort, and pagination

#### UI System
- Component library in `src/lib/components/ui/` following shadcn-ui patterns
- Custom components in `src/lib/components/`
- Theming system with CSS custom properties and multiple theme variants
- Interactive cursor-following mask effect controlled by mouse movement

#### Routing Structure
- File-based routing with SvelteKit conventions
- API routes in `src/routes/api/`
- JSON data in `src/data/`
- Dynamic pages use server-side data loading patterns

### Key Features
- Desktop-like interface with draggable windows
- Command palette (Cmd+K) for navigation
- Dynamic theming system with color customization
- Responsive masking effect that follows cursor movement
- RSS feed generation from changelog data
- Generic JSON API endpoints with search/sort/pagination

### Development Notes
- Uses Svelte 5 syntax (runes: `$state`, `$derived`, `$props`, `$effect`)
- TypeScript strict mode enabled
- Prettier for code formatting
- Component exports follow index.ts barrel pattern
- Environment variables: `PUBLIC_ALGOLIA_API_ID`, `PUBLIC_ALGOLIA_API_KEY`

### Content Management
- Changes tracked in `static/data/changes.json`
- Run `npm run xml` after updating changes to regenerate RSS feed
- Static assets in `static/images/`
- Page content primarily in route components
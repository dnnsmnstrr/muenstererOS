---
version: alpha
name: muenstererOS
description: A precise, monochrome personal web system with calm desktop metaphors and small moments of delight.
colors:
  primary: '#09090B'
  background: '#FFFFFF'
  foreground: '#09090B'
  surface: '#FFFFFF'
  surface-muted: '#F4F4F5'
  text-muted: '#71717A'
  border: '#E4E4E7'
  focus: '#18181B'
  inverse: '#18181B'
  inverse-foreground: '#FAFAFA'
  destructive: '#DC2626'
  destructive-foreground: '#FAFAFA'
  window-close: '#EF4444'
  window-minimize: '#EAB308'
  window-maximize: '#22C55E'
  dark-background: '#09090B'
  dark-foreground: '#FAFAFA'
  dark-surface: '#09090B'
  dark-surface-muted: '#27272A'
  dark-text-muted: '#A1A1AA'
  dark-border: '#27272A'
  dark-focus: '#D4D4D8'
typography:
  display:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.03em
  heading-1:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.025em
  heading-2:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.015em
  heading-3:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.25
  caption:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.35
  code:
    fontFamily: 'Fira Mono, SFMono-Regular, Consolas, Liberation Mono, monospace'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  full: 9999px
spacing:
  0: 0px
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  page-mobile: 24px
  page-desktop: 64px
  content-max: 896px
components:
  button-primary:
    backgroundColor: '{colors.inverse}'
    textColor: '{colors.inverse-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 10px 16px
    height: 40px
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 10px 16px
    height: 40px
  button-destructive:
    backgroundColor: '{colors.destructive}'
    textColor: '{colors.destructive-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 10px 16px
    height: 40px
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    typography: '{typography.body-small}'
    rounded: '{rounded.md}'
    padding: 8px 12px
    height: 40px
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    padding: 24px
  window:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
  menu-item:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
    typography: '{typography.body-small}'
    rounded: '{rounded.sm}'
    padding: 6px 8px
    height: 32px
  icon-button:
    backgroundColor: transparent
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    size: 40px
---

# muenstererOS Design System

## Overview

muenstererOS is a personal website presented as a lightweight, web-native operating system. Its character comes from the meeting of **Vercel-like precision** and **Apple-like spatial familiarity**: crisp monochrome foundations, careful typography, restrained borders, and recognizable desktop behaviors. It should feel capable, curious, and slightly playful—never like a literal operating-system replica or a novelty skin.

The interface has two layers:

1. **The system layer** contains the menu bar, desktop, files, windows, command palette, dock-like launchers, settings, notifications, and screensavers. This layer may borrow familiar desktop conventions so that experimental content remains easy to navigate.
2. **The content layer** contains writing, projects, tools, data, and side projects. It uses a quiet editorial structure and should remain legible even when removed from the desktop shell.

Use this specification for every path on the main site and for related side projects. A side project does not need to imitate a desktop, but it must inherit the typography, semantic palette, spacing rhythm, shape language, interaction feedback, and accessibility standards. Product-specific accent colors are allowed only when they carry meaning; the surrounding chrome remains neutral.

The design principles, in priority order, are:

- **Content before chrome.** OS metaphors organize content; they never obstruct it.
- **Dense, not cramped.** Controls are compact while reading areas have generous rhythm.
- **Familiar, not imitative.** Borrow behavior and hierarchy, not proprietary artwork or ornamental detail.
- **Quiet by default, delightful on interaction.** Motion and color appear in response to intent.
- **Personal but systematic.** Easter eggs and experiments are welcome inside a stable visual grammar.
- **Adaptive and accessible.** Mobile is a first-class interface, not a shrunken desktop.

## Colors

The canonical palette is high-contrast zinc: near-black ink, pure white, and cool neutral grays. This restraint lets projects, photographs, album artwork, maps, and status colors provide local character without making the overall system noisy.

### Semantic palette

- **Background / foreground:** the page canvas and primary text. Use this pair for the strongest reading contrast.
- **Surface:** windows, cards, menus, and popovers. In the default theme it may match the background; borders and elevation establish separation.
- **Surface muted / text muted:** quiet controls, selected rows, secondary copy, timestamps, and metadata. Never use muted text for essential instructions without checking contrast.
- **Border:** a one-pixel structural separator. Prefer it to a shadow for ordinary grouping.
- **Focus:** keyboard focus rings and other non-color-only focus indicators.
- **Inverse:** primary actions and selected high-emphasis states.
- **Destructive:** deletion, failure, and irreversible actions only. Do not use red as decoration.
- **Window controls:** red, yellow, and green are reserved for close, minimize, and maximize affordances. Their meaning must also be available through labels, icons, or native semantics.

### Modes and themes

Light and dark modes have equal status. Dark mode is not a simple inversion: surfaces retain subtle tonal steps, borders remain visible, and images keep their natural color. Components consume semantic tokens rather than raw light-mode values.

Optional user-selectable neutral themes may shift hue while preserving the same semantic roles and contrast relationships. A side project may introduce one restrained accent, but must retain the neutral background, foreground, border, and focus system. Aim for WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text and essential component boundaries.

## Typography

Typography is direct and platform-native. The sans stack starts with the user's system UI face, creating an OS-adjacent feel with no font-loading delay. It should read as neutral, exact, and contemporary rather than branded for its own sake.

- **Display and H1:** compact, bold entry points. Use one per view where possible; never fake headings with large body text.
- **H2 and H3:** semibold structural markers. Keep line lengths short and spacing above them greater than spacing below.
- **Body:** 16px with a relaxed 1.6 line height for prose. Keep long-form measure between 60 and 75 characters.
- **Small body and labels:** compact interface copy. Sentence case is preferred; avoid all-caps navigation.
- **Caption:** metadata only, not a substitute for readable body copy.
- **Code:** Fira Mono when available, falling back to platform monospace. Use it for commands, code, paths, identifiers, and technical readouts—not as decoration.

Use tabular numerals for timers, counters, dates in aligned columns, battery values, and status dashboards. Avoid more than three font weights in a single view. Truncate only when the full value remains available through expansion, a tooltip, or an accessible label.

## Layout

All layout follows a 4px base unit. The 8px step is the default rhythm; 4px exists for optical correction and tightly related controls. Prefer values from the spacing tokens over arbitrary gaps.

### Page structure

- Standard content pages use 24px horizontal padding on small screens and 64px from the `sm` breakpoint upward.
- Reading content should usually stop at 896px. Dashboards, maps, editors, and desktop canvases may use the full viewport when the task benefits.
- Group related content with 16–24px internal space; separate major sections by 32–64px.
- Align headings, body copy, controls, and cards to a shared left edge. Avoid decorative offsets that weaken scanning.
- Preserve safe-area insets for fixed mobile controls and installed web-app contexts.

### Responsive behavior

Below desktop width, translate the system metaphor instead of miniaturizing it: windows become contained sheets or full-width panels, the menu bar collapses to an explicit mobile menu, and hover-only affordances become tap-visible. Never require dragging, right-clicking, precise pointer movement, or hover to reach content or complete a task.

Desktop windows must open within the visible work area and retain a reachable title bar. Resizing and dragging are enhancements; content must still reflow. Full-screen tools should provide a clear escape and preserve browser navigation.

### Composition

Use whitespace, alignment, and thin rules as the main organizational devices. Cards are appropriate when an item is actionable, portable, or conceptually distinct; do not wrap every paragraph in a card. Dense data can use lists or tables with 40–48px rows and subtle dividers.

## Elevation & Depth

Depth is restrained and functional. The visual order is: page canvas, bordered surface, floating surface, modal surface. Most content uses no shadow.

- **Level 0 — canvas:** no border or shadow.
- **Level 1 — card/window:** a 1px semantic border; optional very soft shadow only when it improves separation.
- **Level 2 — menu/popover/dock:** border plus a compact shadow (`0 4px 16px rgb(0 0 0 / 0.10)`) and, when content passes behind it, subtle background translucency with `backdrop-filter: blur(16px)`.
- **Level 3 — modal/command palette:** border plus `0 16px 48px rgb(0 0 0 / 0.18)`. Pair with a quiet backdrop; do not stack multiple dramatic shadows.

Translucency communicates floating system chrome, not decoration. Always provide an opaque-enough fallback and preserve text contrast over varied content. In dark mode, rely more on borders and tonal separation than darker shadows.

The cursor-following mask is a signature homepage effect. Keep it soft, nonessential, and pointer-transparent. Disable or simplify it on touch devices, under reduced-motion preferences, and anywhere it competes with reading or task completion.

## Shapes

The shape language is compact and engineered with measured softness. The default component radius is 6–8px. Cards and windows use 8px; feature panels may use 12px; modal sheets may use 16px. Pills and circles are reserved for statuses, avatars, tags, round icon actions, and OS window controls.

Use one-pixel borders. Do not combine large radii, thick borders, and heavy shadows on the same component. Nested surfaces step down in radius so their corners feel concentric. Icons use a consistent outline family (Lucide by default), 1.5–2px strokes, and common sizes of 16px, 20px, or 24px. Use custom icons only for brands, files, and concepts absent from the system set.

## Components

### System shell

The header behaves like a calm menu bar: persistent, horizontally economical, and visually subordinate to the active content. Keep the brand/home affordance at the leading edge and status or utility controls at the trailing edge. On mobile, collapse navigation without hiding current location or essential actions.

The desktop is an optional spatial canvas, not the default wrapper for every route. File icons use a consistent footprint, short labels, visible selection, keyboard focus, and forgiving hit targets. Provide list or conventional navigation alternatives for all destinations.

The dock or launcher is a floating shortcut surface. Center it near a safe edge, use mild translucency and Level 2 depth, and limit magnification or scaling to a subtle pointer enhancement. It must never cover primary content, mobile browser controls, or safe areas.

### Windows

Windows are the signature container. They use the `window` token, a 1px border, 8px radius, and a clear title bar separated by a border. Title bars provide a drag affordance only when dragging is available and must not make embedded controls draggable.

Place close, minimize, and maximize controls at the leading side in that order. Use 14px circular targets visually, but enlarge the interactive hit area to at least 24px and expose clear accessible names. Icons may appear on hover or focus, but color alone must not carry meaning. Double-click title-bar behavior, resize handles, snapping, and bounce effects are optional progressive enhancements.

Only one window should claim primary attention. When multiple windows can overlap, focus raises the active window, updates its visual state, and follows a predictable stacking model. On narrow screens, maximize or sheet-present windows rather than forcing overlap.

### Buttons and icon actions

Primary buttons use the inverse pair and should be limited to the main action in a region. Secondary buttons use a surface, border, and foreground text. Ghost buttons are allowed in toolbars where container boundaries are already clear. Destructive actions require explicit labeling and confirmation when recovery is difficult.

Interactive controls are at least 40px tall in forms and touch contexts. Compact desktop toolbar controls may be 32px when spacing supplies a 40px effective target. States must include default, hover, active, focus-visible, and disabled. Hover changes should be subtle tonal shifts; active states may translate or scale by no more than 2%.

### Inputs and forms

Inputs are 40px high, use the semantic input/border color, and share the 6px radius. Labels sit above fields and remain visible after entry; placeholders provide examples, not labels. Errors appear near the field with text and an icon in addition to color. Group related settings, save predictably, and disclose whether changes are immediate or require confirmation.

### Cards, lists, and tables

Cards use Level 1 depth and 16–24px padding. Make the whole card clickable only when it has exactly one destination; otherwise use explicit actions. Lists are preferred for scanning many similar items. Tables retain semantic markup, align numbers, keep headers visible when useful, and become scrollable or recompose on small screens rather than clipping.

### Command bar

The command bar (command palette) is a core navigational element and a central entry point for pages and actions across the system. Keep it available throughout the site through a visible control and the Cmd+K shortcut. It is keyboard-first and fully usable by pointer and touch; show shortcuts as supplementary hints and preserve a visible search label.

Whenever a user-facing page or action is added, extend the command bar in the same change so users can discover and reach it there. Use clear English and German labels, useful search keywords, and logical groups. Prefer nouns for destinations and verbs for actions. Keep entries in sync when pages or actions are renamed, moved, or removed.

Use Level 3 depth with compact result rows and clear selected, disabled, and keyboard-focused states. Verify that new entries can be found through search and open the intended destination or execute the intended action using keyboard, pointer, and touch interactions.

### Menus, dialogs, and notifications

Menus and popovers use Level 2 depth, 4–6px internal item radii, compact rows, and clear selected, disabled, and keyboard-focused states.

Dialogs use Level 3 depth, move focus inside on open, trap it while modal, close with Escape, and return focus to the trigger. Toasts are concise, nonblocking, and do not contain the only copy of important information. Respect OS and browser reduced-motion settings.

### Motion and feedback

Motion explains cause and effect. Use 120–200ms for hover and press feedback, 200–300ms for panels and windows, and a standard ease-out curve for entrances. Dragging follows the pointer directly; snapping and release may use a short spring. Never delay navigation for animation.

Honor `prefers-reduced-motion` by removing cursor-following effects, parallax, nonessential springs, scaling, and celebratory motion. Loading states should reserve layout space. Use skeletons for structured content, a spinner for short indeterminate actions, and progress when completion can be measured.

### Accessibility and content

Use semantic HTML before ARIA. Every interaction is keyboard-operable with a visible focus indicator, and focus order follows the visual order. Touch targets should be at least 44×44px where layout permits. Icons that trigger actions require accessible names; decorative icons are hidden from assistive technology.

Write concise, human labels. Prefer verbs for actions and nouns for destinations. Keep humor and technical language in secondary details, not in instructions required to complete a task. Localized German and English strings must tolerate text expansion without truncating controls.

## Do's and Don'ts

### Do

- Use semantic tokens so themes and dark mode remain coherent.
- Let neutral chrome frame colorful personal content and project identities.
- Reuse the 4px spacing system, system typography, Lucide icons, and measured radii in side projects.
- Preserve familiar window, menu, keyboard, and browser behaviors when invoking them visually.
- Make every desktop interaction reachable through conventional navigation and on touch screens.
- Extend the command bar whenever adding a user-facing page or action, and maintain its entries as features change.
- Use borders, alignment, and typography before adding shadows or extra containers.
- Test at narrow mobile widths, wide desktops, 200% zoom, keyboard-only input, dark mode, and reduced motion.
- Keep experiments isolated enough that the core information architecture remains dependable.

### Don't

- Do not reproduce macOS, Vercel, or another product pixel for pixel; use them as references for principles, not assets.
- Do not turn every page into a draggable window or every link into a desktop icon.
- Do not add gradients, glass effects, glow, or saturated accents without a semantic purpose.
- Do not use the traffic-light colors outside window controls and genuine status communication.
- Do not rely on hover, color, animation, dragging, or right-click as the only way to understand or operate the interface.
- Do not use arbitrary spacing, mixed icon families, excessive pills, or radii larger than the component warrants.
- Do not sacrifice contrast or legibility to make translucency appear more dramatic.
- Do not let OS chrome overshadow the work, writing, tools, or personality it exists to present.

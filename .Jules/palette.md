## 2025-05-15 - Improving Window Control Accessibility
**Learning:** Icon-only buttons in a desktop-like UI (like red/yellow/green dots) are highly inaccessible if they lack ARIA labels. Users relying on screen readers need dynamic labels that reflect the state (e.g., "Restore window" vs "Maximize window").
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and update them dynamically when they represent togglable states.

## 2025-05-16 - Consistent Tooltips for Header Actions
**Learning:** In a desktop-like UI, icon-only buttons (like the Search/Command Palette button) benefit significantly from both an `aria-label` for screen readers and a visual tooltip for discovery. This is especially true when the button is part of a cluster of similar looking actions.
**Action:** When adding or improving icon-only buttons in the header, always pair `aria-label` with a `Tooltip` component to ensure both accessibility and intuitive visual feedback.

## 2026-02-22 - Nesting Triggers with Snippets
**Learning:** In Svelte 5 with `bits-ui`, nesting multiple triggers (e.g., a Tooltip on a Dropdown menu) requires careful use of the `child` snippet pattern. All trigger props must be collected and spread onto the final interactive element to ensure both behaviors (e.g., hover for tooltip, click for menu) work correctly.
**Action:** Use nested `{#snippet child({ props: xProps })}` blocks and spread all collected props onto the target component: `<Button {...tooltipProps} {...menuProps}>`.

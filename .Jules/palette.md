## 2025-05-15 - Improving Window Control Accessibility
**Learning:** Icon-only buttons in a desktop-like UI (like red/yellow/green dots) are highly inaccessible if they lack ARIA labels. Users relying on screen readers need dynamic labels that reflect the state (e.g., "Restore window" vs "Maximize window").
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and update them dynamically when they represent togglable states.

## 2025-05-22 - Enhancing Icon-only Buttons and Tooltip Triggers
**Learning:** In Svelte 5 with bits-ui, icon-only components used as tooltip triggers (like the Battery Indicator) need explicit keyboard accessibility. Using the `{#snippet child}` pattern with a focusable `<button>` and dynamic `aria-label` ensures they are usable by keyboard and screen reader users while maintaining a clean UI.
**Action:** When creating icon-only triggers, always use the snippet pattern to wrap the icon in a focusable element with a descriptive label.

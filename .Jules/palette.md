## 2025-05-15 - Improving Window Control Accessibility
**Learning:** Icon-only buttons in a desktop-like UI (like red/yellow/green dots) are highly inaccessible if they lack ARIA labels. Users relying on screen readers need dynamic labels that reflect the state (e.g., "Restore window" vs "Maximize window").
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and update them dynamically when they represent togglable states.

## 2025-05-16 - Accessible Tooltip Triggers in Svelte 5
**Learning:** Tooltip triggers that wrap non-interactive elements (like SVGs) are not keyboard focusable. In Svelte 5 with bits-ui, using the {#snippet child({ props })} pattern to wrap the icon in a <button> with an aria-label ensures both accessibility and keyboard-driven tooltips.
**Action:** Use the snippet pattern for triggers to ensure all icon-only interactive elements are keyboard focusable and have descriptive labels.

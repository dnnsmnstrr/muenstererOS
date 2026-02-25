## 2025-05-15 - Improving Window Control Accessibility
**Learning:** Icon-only buttons in a desktop-like UI (like red/yellow/green dots) are highly inaccessible if they lack ARIA labels. Users relying on screen readers need dynamic labels that reflect the state (e.g., "Restore window" vs "Maximize window").
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and update them dynamically when they represent togglable states.

## 2025-05-16 - Consistent Tooltips for Header Actions
**Learning:** In a desktop-like UI, icon-only buttons (like the Search/Command Palette button) benefit significantly from both an `aria-label` for screen readers and a visual tooltip for discovery. This is especially true when the button is part of a cluster of similar looking actions.
**Action:** When adding or improving icon-only buttons in the header, always pair `aria-label` with a `Tooltip` component to ensure both accessibility and intuitive visual feedback.

## 2026-02-25 - Global Tooltip Provider for UI Consistency
**Learning:** In a SvelteKit application with global UI elements like headers, placing the `Tooltip.Provider` at the root layout level is essential for ensuring that all components can consistently utilize tooltips. This prevents the need for redundant providers and ensures that tooltips for global actions (like battery status or mode toggles) are always available.
**Action:** Ensure `Tooltip.Provider` wraps the entire application in the root layout to support tooltips in global components and avoid redundant local providers.

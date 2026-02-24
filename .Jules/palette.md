## 2025-05-15 - Improving Window Control Accessibility
**Learning:** Icon-only buttons in a desktop-like UI (like red/yellow/green dots) are highly inaccessible if they lack ARIA labels. Users relying on screen readers need dynamic labels that reflect the state (e.g., "Restore window" vs "Maximize window").
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and update them dynamically when they represent togglable states.

## 2025-05-16 - Consistent Tooltips for Header Actions
**Learning:** In a desktop-like UI, icon-only buttons (like the Search/Command Palette button) benefit significantly from both an `aria-label` for screen readers and a visual tooltip for discovery. This is especially true when the button is part of a cluster of similar looking actions.
**Action:** When adding or improving icon-only buttons in the header, always pair `aria-label` with a `Tooltip` component to ensure both accessibility and intuitive visual feedback.

## 2025-05-17 - Accessible Status Indicators
**Learning:** Status indicators like a battery icon in the header must be focusable and provide descriptive labels for screen readers. Using the `bits-ui` snippet pattern allows wrapping these icons in a standard `Button` component while maintaining tooltip functionality and proper prop inheritance.
**Action:** Wrap icon-only status indicators in a focusable `Button` (e.g., ghost variant) with a dynamic `aria-label` that includes relevant state information (like percentage and charging status), and ensure the internal icons are hidden from screen readers using `aria-hidden="true"`.

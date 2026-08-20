# StockFlow Settings Page — Project Report

## Objective

Replace the Settings placeholder with a complete Admin-only React page that matches the existing dark violet dashboard and provides two independently editable forms.

## Work completed

- Replaced the placeholder route with `safePage(Settings)` inside the existing ADMIN `RoleRoute`.
- Added `src/pages/Settings.jsx` as a dedicated functional component.
- Added a Company Info form with Company Name, GSTIN, Phone, and Address.
- Added an Alert Thresholds form with low-stock, critical-stock, reorder lead time, default GST, and email notification controls.
- Added independent React state and submit handlers for both forms.
- Added responsive dark-theme styling using `#161622` cards and `#0d0d15` controls.
- Added accessible labels, keyboard focus styles, form validation, numeric limits, and visible save confirmations.
- Saved settings to browser `localStorage`, because the supplied application does not expose a settings API.

## Application behavior

The Settings route remains available only to users with the ADMIN role. Each card saves independently. Saved values are restored when the page or browser is reopened on the same device.

## Files changed

- `src/App.jsx`
- `src/pages/Settings.jsx`
- `src/styles.css`

## Validation checklist

- Production build completes without React or syntax errors.
- Settings loads through the existing ErrorBoundary.
- Both forms accept edits and submit independently.
- Numeric controls enforce non-negative values and GST is limited to 100%.
- Email notification control is keyboard accessible.
- Layout collapses to one column on narrower displays.

## Backend integration note

Browser storage is appropriate as a local fallback, but settings are device-specific. For shared organization settings, add backend GET/PUT settings endpoints and replace the `localStorage` calls in `Settings.jsx` with authenticated API requests.

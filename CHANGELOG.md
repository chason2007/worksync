# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-02-24

### Added
- **Dedicated User Management Page**: Extracted the user administration module from the Admin Dashboard into its own page (`ManageUsers.jsx`).
- **New Navigation**: Added "Users" link to the Header for Admin users on both desktop and mobile views.
- **Manage Users Button**: Added a direct access button on the Admin Dashboard to the new User Management page.

### Changed
- **Admin Dashboard Refactor**: Streamlined the dashboard to focus on Announcements, Stats, Attendance Logs, and Leave Requests.
- **Accessibility Enhancements**:
    - Converted password toggle and logout actions to native `<button>` elements for improved keyboard navigation.
    - Improved form accessibility by ensuring all labels are correctly associated with their inputs in `AddUser.jsx` and `Profile.jsx`.
- **Performance Optimizations**:
    - Implemented `useMemo` for context values in `AuthContext`, `ThemeContext`, `ToastContext`, and `NotificationContext` to reduce unnecessary re-renders.
    - Added comprehensive `PropTypes` validation across core components and context providers.
- **Code Maintenance**:
    - Cleaned up `index.css` by removing duplicate selectors and consolidating media queries.
    - Refactored `AddUser`, `AttendanceForm`, and `Profile` components for better readability and consistent data handling.
- **Application Branding**: Updated the footer to reflect the new version `v1.3.0`.

### Fixed
- **Hotfix**: Resolved a build error caused by a duplicate import of `resizeImage` in `Profile.jsx`.
- **State Management**: Resolved issues with attendance date filtering and state consistency in `AdminDashboard.jsx`.
- **Form Logic**: Removed a duplicate `setRole` call during user creation in `AddUser.jsx`.
- **UI Consistency**: Standardized Avatar sizing and component spacing across the dashboard and profile pages.

---
[1.2.0] - Previous releases...

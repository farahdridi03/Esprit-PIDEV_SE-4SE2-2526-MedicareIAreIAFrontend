# Frontend Stabilization Plan - Merge Conflict Resolution

This plan outlines the steps to resolve the remaining merge conflicts and compilation errors in the `medicarepi` frontend project.

## 1. Services & Auth
- [x] `src/app/services/user.service.ts`: Remove duplicate `getProfile` method.
- [ ] `src/app/features/auth/pages/login/login.component.ts`: Resolve role redirection merge markers.
- [ ] `src/app/features/auth/pages/register/register.component.scss`: Resolve style markers (preserve profile image upload UI).

## 2. Back Office
- [ ] `src/app/features/back-office/back-office-routing.module.ts`: Merge admin routes (Dashboard, Users, Donations, Appointments, Emergency, etc.).
- [ ] `src/app/features/back-office/components/admin-topbar/admin-topbar.component.ts`: Merge notification logic (HEAD) with user info/initials logic (origin).
- [ ] `src/app/features/back-office/components/admin-topbar/admin-topbar.component.scss`: Resolve style markers.

## 3. Front Office (Clinic & Doctor)
- [ ] `src/app/features/front-office/clinic/clinic-routing.module.ts`: Resolve markers in routes.
- [ ] `src/app/features/front-office/clinic/clinic.module.ts`: Resolve markers in imports/declarations.
- [ ] `src/app/features/front-office/clinic/components/clinic-topbar/clinic-topbar.component.ts`: Resolve markers in logic.
- [ ] `src/app/features/front-office/doctor/pages/doctor-patients/doctor-patients.component.ts`: Merge patient management logic. Fix missing properties (`loading`, `error`, etc.).
- [ ] `src/app/features/front-office/doctor/pages/doctor-patients/doctor-patients.component.scss`: Resolve style markers.
- [ ] `src/app/features/front-office/front-office-routing.module.ts`: Resolve extensive markers in routing configuration.
- [ ] `src/app/features/front-office/front-office.module.ts`: Resolve markers in imports.

## 4. Shared & Layout
- [ ] `src/app/features/front-office/layout/layout.module.ts`: Fix `LayoutModule` not being an NgModule (likely markers breaking the decorator). Restore missing exports (`SidebarComponent`, `TopbarComponent`).
- [ ] `src/app/features/front-office/patient/pages/dashboard/dashboard.component.ts`: Resolve markers.
- [ ] Check other modules (`laboratory.module.ts`, `nutritionist.module.ts`) for incorrect imports after fixing LayoutModule.

## 5. Final Validation
- [ ] Run `ng serve` and verify no errors.
- [ ] Test login/redirection and dashboard features.

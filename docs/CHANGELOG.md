# Project Changelog & Activity Log

This document serves as a persistent record of all major changes, feature implementations, and fixes made to the Loan Management System.

## [Unreleased]
### Added
- Project initialized.
- Generated architecture, database schema, API design, and status transition documentation.
- AI Agent constraints and Quality Assurance rules established in `.agents/AGENTS.md`.
- **Phase 1 Complete**: Initialized Next.js frontend with Tailwind CSS and shadcn/ui. Initialized Express backend with Mongoose.
- **Phase 2 Complete**: Created `User` model, `JWT` token utilities, `auth` middleware (with RBAC enforcement), authentication controller (`/register`, `/login`), and the database `seed.ts` script.
- **Phase 3 Complete**: Created `Loan` model, Business Rule Engine (BRE) service, Simple Interest Math calculation service, Cloudflare R2 file upload utility, and the Borrower Application endpoints (`/apply`, `/my-loans`).
- **Phase 4 Complete**: Created `Payment` model and Admin routes (`/api/admin/loans`, `/api/admin/loans/:loanId/status`, `/api/admin/loans/:loanId/payments`) with strict Role-Based Access Control enforcing operations lifecycle.
- **Phase 5 Complete**: Implemented Next.js Frontend Borrower Portal including a premium glassmorphic landing page, Authentication UI, Borrower Dashboard, and Loan Application Form with a Live Simple Interest Calculator.

*Further updates will be appended here as development phases are completed.*

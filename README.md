# Deep Root Studios (DRS) – Centralized Management Platform

![Deep Root Studios](https://img.shields.io/badge/DRS-AI%20Operations-teal)
![Version](https://img.shields.io/badge/Portal-v2.4%20Production-0d9488)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

Enterprise-grade HRMS, ERP, Document Automation, and Operations Management Platform designed specifically for **Deep Root Studios (DRS)** — an end-to-end AI operations partner for Data Annotation, AI Evaluation & QA, Autonomous AI Agents, and Workflow Automation.

---

## 1. Company Profile & Operational Scope

* **Company Name:** Deep Root Studios Private Limited (DRS)
* **Industry:** Technology, Information and Internet
* **Category:** AI Solutions and AI Operations
* **Positioning:** End-to-End AI Operations Partner for Data, Annotation & Automation
* **Core Divisions:**
  1. Data Annotation
  2. AI Evaluation & QA
  3. AI Agents & Automation
  4. Workflow Automation
* **Registered Hub:** Bengaluru, Karnataka, India (CIN: `U72900KA2024PTC189201`)
* **Authorized Signatory:** Devesh Sharma (Founder & CEO)

---

## 2. Key Modules & Capabilities

### 👑 Role-Based Access Control (RBAC) & Persona Switcher
The platform enforces strict role separation with an **Instant Persona Switcher** in the navigation bar to test all user journeys:
1. **SUPER ADMIN / FOUNDER (Devesh Sharma):**
   * Full access to platform operations, financial summaries, and workforce records.
   * Exclusive authority to sign and issue official documents (Offer letters, Appointment letters, Relieving certificates).
   * Review and approve monthly payroll disbursements.
   * Access to immutable security audit logs.
   * Template management and corporate letterhead settings.
2. **HR / OPERATIONS MANAGER (Ananya Rao):**
   * Register employees, maintain profiles, and record emergency & KYC data.
   * Draft official letters and certificates (submitted to Founder for review).
   * Prepare draft monthly payroll cycles and track working days.
   * Review and approve/reject leave applications.
   * Broadcast internal announcements.
3. **EMPLOYEE SELF-SERVICE (Karthik Ramanathan, Aditi Mukhopadhyay, etc.):**
   * Personal profile, assigned responsibilities, and emergency contacts.
   * Personal **Documents Vault** with one-click PDF download for all issued contracts and certificates.
   * Monthly payslip inspection with transparent earnings and deductions breakdown.
   * Daily check-in / check-out with work mode logging (Office, Remote, Hybrid).
   * Leave quota tracker and leave application filing.

---

### 📄 Dynamic Document Generation Engine
Generates legally formatted, high-resolution official documents rendered on official DRS Letterhead:
* **Offer Letters & Appointment Letters** (with candidate acceptance section)
* **Internship Suite** (Offer, Agreement, Extension, Completion Certificate, Experience)
* **Separation Suite** (Experience Certificate, Relieving Letter, Resignation Acceptance)
* **Appraisal Suite** (Promotion Letter, Appreciation Certificate, Warning Advisory)
* **Dynamic Placeholder Replacement Engine** (`{{employee_name}}`, `{{employee_id}}`, `{{designation}}`, `{{joining_date}}`, `{{annual_ctc}}`, etc.)
* **Tamper-Proof Verification:** Every issued document receives a unique cryptographic token and a **scannable QR code** linked to the public verification portal (`/verify/[token]`).
* **High-Resolution Export:** One-click client-side PDF generation via jsPDF / html2canvas as well as standard vector browser printing.

---

### 💳 Payroll & Statutory Compensation Module
* Monthly payroll compilation wizard matching active employees.
* Configurable compensation structures (Basic Salary, HRA, Special Allowance, Conveyance, Stipend).
* Automated statutory deductions:
  * Provident Fund (PF)
  * Professional Tax (PT)
  * Tax Deducted at Source (TDS)
* Founder approval gate before payout confirmation.
* Transparent payslips generated with net pay in words and bank transaction reference.

---

### 🕒 Attendance & Leave Operations
* Daily check-in / check-out with work mode tracking (`OFFICE`, `REMOTE`, `HYBRID`).
* Automatic working hours calculation.
* Leave quota management: Casual Leave, Sick Leave, Earned/Paid Leave, Unpaid Leave.
* Multi-tier review workflow for leave approvals.
* Indian Tech Holiday Calendar 2026 (Republic Day, Holi, Ugadi, Independence Day, Gandhi Jayanti, Dussehra, Diwali, etc.).

---

### 🛡️ Public Document Verification Portal (`/verify/[token]`)
* Accessible by third parties, clients, or verification agencies to validate DRS credentials.
* Displays official Deep Root Studios Authenticity Shield, document issue date, recipient name, and current status (`VALID / AUTHENTIC` or `REVOKED`).

---

## 3. Technology Stack

* **Frontend Framework:** Next.js 15.1+ (App Router)
* **UI Library:** React 19.0
* **Styling:** Tailwind CSS with Custom Deep Root Obsidian/Emerald Palette & Dark/Light Mode
* **Icons:** Lucide React
* **PDF & QR Code Engine:** `jspdf`, `html2canvas`, `qrcode`
* **Database & Persistence:** Dual-mode architecture:
  * Default Local-first storage with immediate state persistence and factory data reset.
  * Direct Supabase PostgreSQL integration via `supabase/migrations/20261106_init_drs.sql`.

---

## 4. Getting Started

### Local Development
```bash
# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Persona Testing
Use the **Persona Switcher** in the top navigation bar to toggle between:
* 👑 **Founder / Super Admin:** Test document approvals, payroll approvals, and audit logs.
* 💼 **HR Manager:** Test employee onboarding, document drafting, and leave reviews.
* 👤 **Employee:** Test check-in, leave requests, document downloads, and payslips.

### Production Build
```bash
npm run build
npm start
```
All routes compile statically and dynamically with 0 errors.

---

## 5. Supabase Integration (Optional)
If connecting to an external Supabase project:
1. Copy `.env.example` to `.env.local` and fill in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
2. Run the migration script in your Supabase SQL Editor:
   ```
   supabase/migrations/20261106_init_drs.sql
   ```
All Row-Level Security (RLS) policies and relational enums are pre-configured.

---

© 2026 Deep Root Studios Private Limited. Confidential and Proprietary.


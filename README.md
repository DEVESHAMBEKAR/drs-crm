# Deep Root Studios (DRS) – Management Portal

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDEVESHAMBEKAR%2Fdrs-crm)
![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.0-black?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-black?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Theme-Monochrome-black)

Enterprise-grade HRMS, ERP, Document Automation, and Operations Management Platform designed specifically for **Deep Root Studios Private Limited (DRS)** — End-to-End AI Operations Partner for Data Annotation, AI Evaluation & QA, Autonomous AI Agents, and Workflow Automation.

---

## 🚀 One-Click Cloud Deployment (Vercel)

The easiest way to make this platform live for your company:

1. Click the button below:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDEVESHAMBEKAR%2Fdrs-crm)

2. Sign in to your [Vercel](https://vercel.com) account (using your GitHub account `DEVESHAMBEKAR`).
3. Click **Deploy**. Vercel will automatically build the Next.js app and assign a free production URL (e.g., `https://drs-crm.vercel.app`).
4. *(Optional)* Add your custom domain (such as `crm.deeprootstudios.ai` or `portal.deeprootstudios.ai`) in Vercel Project Settings → Domains.

---

## 🏢 Company Profile

* **Company Name:** Deep Root Studios Private Limited (DRS)
* **Industry:** Technology, Information and Internet
* **Category:** AI Solutions and AI Operations
* **Positioning:** End-to-End AI Operations Partner for Data, Annotation & Automation
* **Registered Address:** World Trade Center, Kharadi, Pune, Maharashtra - 411014
* **Corporate Identification Number (CIN):** `U72900KA2024PTC189201`
* **Founder & CEO:** Devesh Ambekar
* **Head of Human Resources & Operations:** Maroti Kadam
* **Website:** https://deeprootstudios.ai

---

## 🔑 Default Login Credentials

| Role | Username / Identity | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Founder & Super Admin** *(Devesh Ambekar)* | `admin` | `admin123` | Full administrative control, document issuance, payroll approvals, company settings |
| **HR & Operations Manager** *(Maroti Kadam)* | `hr` | `admin123` *(or `hr123`)* | Employee onboarding, payslip editing, draft document generation, leave records |
| **Employee Self-Service** | Employee Email or ID | `admin123` | Personal profile, my documents, my payslips, leave applications |

---

## 🌟 Key Platform Capabilities

### 1. Dynamic Document Generation Engine
* **A4 Print-Ready Letterhead:** Authentic corporate layout with the official DRS logo, Pune registered office address, CIN, official company stamp, and authorized signatures.
* **12 Pre-configured Corporate Templates:**
  * Standard Employment Offer Letter
  * Official Letter of Appointment
  * Internship Offer & Terms
  * Internship Completion Certificate
  * Relieving & Experience Certificate
  * Certificate of Excellence & Appreciation
  * Promotion Letter & Compensation Revision
  * Formal Written Advisory / Warning Letter
  * Employment Verification Letter *(for banks / visa processing)*
  * Official Relieving Order & Clearance Certificate
  * Resignation Acceptance & Notice Period Acknowledgment
  * Certificate of Project Delivery Excellence
* **Verification QR Code & Cryptographic Hash:** Every issued document receives a unique verification token and tamper-proof verification page at `/verify/[token]`.

### 2. Zoho Mail SMTP Integration (Trigger Emails with PDF Attachments)
* Built-in serverless dispatch via `nodemailer` connecting to Zoho Mail SMTP (`smtp.zoho.in:465` or `smtp.zoho.com:465`).
* One-click **"Share via Email"** on any document or payslip automatically attaches the generated PDF.
* Configurable from **Settings → 4. Zoho Mail Dispatch Configuration**.

### 3. Individual & Batch Payslip Engine
* **Batch Monthly Payroll:** Prepare monthly compensation cycles for active employees.
* **Individual Custom Payslip Creator (`+ Create Individual Payslip`):** Pick any employee, customize earnings (Basic, HRA, Special Allowance, Bonuses) and deductions (PF, Professional Tax, TDS, LOP).
* **Fix / Edit Existing Payslips:** Fine-tune individual entries with real-time recalculation of Gross, Deductions, Net Salary, and Indian Currency Words (*"Rupees Only"*).
* **High-Res PDF & Email:** One-click PDF download and direct email delivery to employees.

### 4. Attendance & Leave Operations
* Daily check-in / check-out with work mode tracking (`OFFICE`, `REMOTE`, `HYBRID`).
* Automatic working hours calculation and leave balance deduction.
* Maharashtra state holiday calendar integration.

---

## 💻 Local Development & Self-Hosting

### Prerequisites
* Node.js 18.18+ or 20+
* npm or pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/DEVESHAMBEKAR/drs-crm.git
cd drs-crm

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Test
```bash
# Build the production bundle
npm run build

# Start production server
npm start
```

---

## 📧 How to Setup Zoho Mail (In Portal)

1. Sign in to the portal as Admin (`admin` / `admin123`).
2. Navigate to **Settings** (`/settings`).
3. Scroll to **4. Zoho Mail Dispatch Configuration (SMTP)**.
4. Enter:
   * **Company Zoho Email Address:** Your official email.
   * **Zoho App Password:** Generated from [accounts.zoho.in](https://accounts.zoho.in) → Security → App Passwords.
   * **Host:** `smtp.zoho.in` (India) or `smtp.zoho.com` (Global).
   * **Port:** `465`.
5. Click **Save Company Settings**.

---

© 2026 Deep Root Studios Private Limited. All Rights Reserved.

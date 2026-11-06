-- =========================================================================
-- DEEP ROOT STUDIOS (DRS) - PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH RLS
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('FOUNDER', 'HR_MANAGER', 'EMPLOYEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT', 'CONSULTANT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employment_status AS ENUM (
        'PENDING_ONBOARDING', 'ACTIVE', 'ON_PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'COMPLETED_INTERNSHIP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'OFFER_LETTER', 'APPOINTMENT_LETTER', 'INTERNSHIP_OFFER', 'INTERNSHIP_AGREEMENT',
        'INTERNSHIP_EXTENSION', 'INTERNSHIP_COMPLETION', 'EXPERIENCE_CERTIFICATE',
        'EMPLOYMENT_VERIFICATION', 'RELIEVING_LETTER', 'RESIGNATION_ACCEPTANCE',
        'PROMOTION_LETTER', 'APPRECIATION_LETTER', 'WARNING_LETTER',
        'TRAINING_COMPLETION', 'PROJECT_COMPLETION', 'ACHIEVEMENT_CERTIFICATE', 'PAYSLIP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payroll_status AS ENUM ('DRAFT', 'SUBMITTED_FOR_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL DEFAULT 'Deep Root Studios Private Limited',
    abbreviation TEXT DEFAULT 'DRS',
    industry TEXT DEFAULT 'Technology, Information & Internet',
    category TEXT DEFAULT 'AI Solutions & AI Operations',
    tagline TEXT DEFAULT 'End-to-End AI Operations Partner for Data, Annotation & Automation',
    positioning TEXT DEFAULT 'Leading technology partner specialized in LLM evaluation, dataset engineering, autonomous agents, and enterprise workflow automation.',
    website TEXT DEFAULT 'https://deeprootstudios.ai',
    official_email TEXT DEFAULT 'operations@deeprootstudios.ai',
    hr_email TEXT DEFAULT 'hr@deeprootstudios.ai',
    phone TEXT DEFAULT '+91 (080) 4567-8900',
    address TEXT DEFAULT 'Level 4, Orion Tech Park, 24th Main Road, HSR Layout, Sector 2, Bengaluru, Karnataka 560102, India',
    cin_number TEXT DEFAULT 'U72900KA2024PTC189201',
    founder_name TEXT DEFAULT 'Devesh Sharma',
    founder_title TEXT DEFAULT 'Founder & Managing Director',
    authorized_signatory_name TEXT DEFAULT 'Devesh Sharma',
    authorized_signatory_title TEXT DEFAULT 'Founder & CEO',
    document_prefix TEXT DEFAULT 'DRS',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EMPLOYEE PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    employment_type employment_type NOT NULL DEFAULT 'FULL_TIME',
    employment_status employment_status NOT NULL DEFAULT 'ACTIVE',
    date_of_joining DATE NOT NULL,
    date_of_birth DATE,
    probation_end_date DATE,
    exit_date DATE,
    reporting_manager_id UUID REFERENCES profiles(id),
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
    assigned_responsibilities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EMPLOYEE FINANCIAL DETAILS (RESTRICTED RLS)
CREATE TABLE IF NOT EXISTS employee_financials (
    employee_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    bank_name TEXT,
    account_number_encrypted TEXT,
    account_number_last4 TEXT,
    ifsc_code TEXT,
    pan_number TEXT,
    uan_pf_number TEXT,
    annual_ctc NUMERIC(14, 2) NOT NULL DEFAULT 0,
    monthly_gross NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monthly_basic NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monthly_hra NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monthly_special_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monthly_conveyance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stipend_amount NUMERIC(12, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DOCUMENT TEMPLATES
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type document_type UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    terms_and_conditions TEXT[] DEFAULT '{}',
    requires_founder_approval BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    signatory_title TEXT NOT NULL DEFAULT 'Founder & CEO',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DOCUMENTS REGISTRY
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number TEXT UNIQUE NOT NULL,
    type document_type NOT NULL,
    title TEXT NOT NULL,
    employee_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    employee_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    status document_status NOT NULL DEFAULT 'DRAFT',
    issue_date DATE NOT NULL,
    verification_token TEXT UNIQUE NOT NULL,
    prepared_by TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ATTENDANCE & LEAVES
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    work_mode TEXT NOT NULL DEFAULT 'OFFICE',
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    working_hours NUMERIC(4, 2),
    UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    year INT NOT NULL,
    casual_total INT DEFAULT 12,
    casual_used INT DEFAULT 0,
    sick_total INT DEFAULT 8,
    sick_used INT DEFAULT 0,
    earned_total INT DEFAULT 15,
    earned_used INT DEFAULT 0,
    unpaid_taken INT DEFAULT 0,
    UNIQUE(employee_id, year)
);

CREATE TABLE IF NOT EXISTS leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    applied_on DATE DEFAULT CURRENT_DATE,
    reviewed_by TEXT,
    review_remarks TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 9. PAYROLL & PAYSLIPS
CREATE TABLE IF NOT EXISTS payroll_cycles (
    id TEXT PRIMARY KEY, -- e.g. pay-2026-10
    month INT NOT NULL,
    year INT NOT NULL,
    total_employees INT NOT NULL DEFAULT 0,
    total_gross_payout NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_net_payout NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status payroll_status NOT NULL DEFAULT 'DRAFT',
    prepared_by TEXT NOT NULL,
    prepared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    payment_date DATE,
    payment_reference TEXT,
    payslips_count INT NOT NULL DEFAULT 0,
    UNIQUE(month, year)
);

CREATE TABLE IF NOT EXISTS payslips (
    id TEXT PRIMARY KEY,
    payroll_cycle_id TEXT NOT NULL REFERENCES payroll_cycles(id) ON DELETE RESTRICT,
    payslip_number TEXT UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    employee_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    working_days INT NOT NULL,
    paid_days NUMERIC(4, 1) NOT NULL,
    loss_of_pay_days NUMERIC(4, 1) DEFAULT 0,
    basic_salary NUMERIC(10, 2) NOT NULL,
    hra NUMERIC(10, 2) NOT NULL,
    special_allowance NUMERIC(10, 2) NOT NULL,
    bonus NUMERIC(10, 2) DEFAULT 0,
    gross_earnings NUMERIC(10, 2) NOT NULL,
    provident_fund NUMERIC(10, 2) DEFAULT 0,
    professional_tax NUMERIC(10, 2) DEFAULT 0,
    tds_tax NUMERIC(10, 2) DEFAULT 0,
    other_deductions NUMERIC(10, 2) DEFAULT 0,
    total_deductions NUMERIC(10, 2) NOT NULL,
    net_salary NUMERIC(10, 2) NOT NULL,
    net_salary_in_words TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'UNPAID',
    payment_date DATE,
    bank_name TEXT,
    account_number_masked TEXT
);

-- 10. AUDIT LOGS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role user_role NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT CURRENT_DATE
);

-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check caller role
CREATE OR REPLACE FUNCTION auth.get_user_role() RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Profiles: Public read within DRS, update by self/HR/Founder
CREATE POLICY "Profiles readable by authenticated staff" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles manageable by Founder and HR" ON profiles FOR ALL USING (
    auth.get_user_role() IN ('FOUNDER', 'HR_MANAGER')
);

-- Financials: Strictly restricted to Founder, HR, and the specific employee
CREATE POLICY "Financials readable by owner, Founder and HR" ON employee_financials FOR SELECT USING (
    employee_id = auth.uid() OR auth.get_user_role() IN ('FOUNDER', 'HR_MANAGER')
);
CREATE POLICY "Financials editable only by Founder and HR" ON employee_financials FOR ALL USING (
    auth.get_user_role() IN ('FOUNDER', 'HR_MANAGER')
);

-- Documents: Public verify tokens can read issued records; internal users see authorized documents
CREATE POLICY "Documents readable by owner, HR, Founder" ON documents FOR SELECT USING (
    status = 'ISSUED' OR employee_id = auth.uid() OR auth.get_user_role() IN ('FOUNDER', 'HR_MANAGER')
);
CREATE POLICY "Documents manageable by Founder and HR" ON documents FOR ALL USING (
    auth.get_user_role() IN ('FOUNDER', 'HR_MANAGER')
);


import { 
  CompanySettings, 
  EmployeeProfile, 
  DocumentTemplate, 
  DocumentRecord, 
  AttendanceRecord, 
  LeaveBalance, 
  LeaveApplication, 
  PayrollRecord, 
  PayslipItem, 
  AuditLog, 
  Announcement 
} from '@/types';

export const initialCompanySettings: CompanySettings = {
  companyName: 'Deep Root Studios Private Limited',
  abbreviation: 'DRS',
  industry: 'Technology, Information & Internet',
  category: 'AI Solutions & AI Operations',
  tagline: 'End-to-End AI Operations Partner for Data, Annotation & Automation',
  positioning: 'Industry-leading AI operations partner specializing in multi-modal data annotation, LLM benchmark evaluation & QA, autonomous AI agents, and enterprise workflow automation.',
  website: 'https://deeprootstudios.ai',
  officialEmail: 'operations@deeprootstudios.ai',
  hrEmail: 'maroti.kadam@deeprootstudios.ai',
  phone: '+91 (080) 4567-8900',
  address: 'World Trade Center, Kharadi, Pune, Maharashtra - 411014',
  cinNumber: 'U72900KA2024PTC189201',
  logoUrl: '/assets/drs-logo.jpg',
  founderName: 'Devesh Ambekar',
  founderTitle: 'Founder & Managing Director',
  authorizedSignatoryName: 'Maroti Kadam',
  authorizedSignatoryTitle: 'Head of Human Resources & Authorized Signatory',
  authorizedSignatorySignatureUrl: '/assets/drs-signature.png',
  sealUrl: '/assets/drs-stamp.png',
  documentPrefix: 'DRS',
  smtpEmail: '',
  smtpPassword: '',
  smtpHost: 'smtp.zoho.in',
  smtpPort: 465,
};

export const initialEmployees: EmployeeProfile[] = [
  {
    id: 'emp-001',
    employeeId: 'DRS-EMP-001',
    fullName: 'Devesh Ambekar',
    email: 'devesh.ambekar@deeprootstudios.ai',
    phone: '+91 98450 12345',
    role: 'FOUNDER',
    designation: 'Founder & Chief Executive Officer',
    department: 'Executive Leadership',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    dateOfJoining: '2024-01-01',
    dateOfBirth: '1992-06-15',
    address: {
      street: '42, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
    emergencyContact: {
      name: 'Pooja Ambekar',
      phone: '+91 98450 12346',
      relation: 'Spouse',
    },
    financialDetails: {
      bankName: 'HDFC Bank',
      accountNumberMasked: '•••• •••• 9012',
      ifscCode: 'HDFC0001234',
      panNumber: 'ABCPA1234F',
      uanPfNumber: '100982348712',
      annualCTC: 3600000,
      monthlyBasic: 150000,
      monthlyHRA: 60000,
      monthlySpecialAllowance: 70000,
      monthlyConveyance: 20000,
      monthlyGross: 300000,
    },
    assignedResponsibilities: [
      'Strategic corporate direction and enterprise AI partnerships',
      'Final approval authority for executive appointments and operations',
      'P&L management, company governance and statutory compliance',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'emp-002',
    employeeId: 'DRS-EMP-002',
    fullName: 'Maroti Kadam',
    email: 'maroti.kadam@deeprootstudios.ai',
    phone: '+91 97412 88990',
    role: 'HR_MANAGER',
    designation: 'Head of Human Resources & Operations',
    department: 'People Operations',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    dateOfJoining: '2024-02-15',
    dateOfBirth: '1993-08-20',
    reportingManagerId: 'emp-001',
    reportingManagerName: 'Devesh Ambekar',
    address: {
      street: '15/3, 5th Cross, Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India',
    },
    emergencyContact: {
      name: 'Sunita Kadam',
      phone: '+91 97412 88991',
      relation: 'Spouse',
    },
    financialDetails: {
      bankName: 'ICICI Bank',
      accountNumberMasked: '•••• •••• 4589',
      ifscCode: 'ICIC0000543',
      panNumber: 'ANPK8921K',
      uanPfNumber: '101234567890',
      annualCTC: 1680000,
      monthlyBasic: 70000,
      monthlyHRA: 28000,
      monthlySpecialAllowance: 30000,
      monthlyConveyance: 12000,
      monthlyGross: 140000,
    },
    assignedResponsibilities: [
      'Full lifecycle recruitment, talent onboarding, and offboarding',
      'Employee records management, status changes, and employee modifications',
      'Drafting, validating, and issuing authorized company letters with digital sign & seal',
      'Monthly attendance tracking, leave audits, and payroll preparation',
    ],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'emp-003',
    employeeId: 'DRS-EMP-003',
    fullName: 'Karthik Ramanathan',
    email: 'karthik.r@deeprootstudios.ai',
    phone: '+91 99801 34567',
    role: 'EMPLOYEE',
    designation: 'Lead AI Engineer & Automation Architect',
    department: 'AI Agents & Automation',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    dateOfJoining: '2024-05-02',
    dateOfBirth: '1994-11-10',
    reportingManagerId: 'emp-001',
    reportingManagerName: 'Devesh Ambekar',
    address: {
      street: '88, Silver Palms, Bellandur Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'India',
    },
    emergencyContact: {
      name: 'Deepa Ramanathan',
      phone: '+91 99801 34568',
      relation: 'Sister',
    },
    financialDetails: {
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 1120',
      ifscCode: 'SBIN0004567',
      panNumber: 'BRPRK7654M',
      uanPfNumber: '101456789012',
      annualCTC: 1920000,
      monthlyBasic: 80000,
      monthlyHRA: 32000,
      monthlySpecialAllowance: 36000,
      monthlyConveyance: 12000,
      monthlyGross: 160000,
    },
    assignedResponsibilities: [
      'Design and orchestration of autonomous multi-agent operational workflows',
      'System integration with enterprise APIs and high-throughput pipelines',
      'Technical mentorship for AI evaluation and automation developers',
    ],
    createdAt: '2024-05-02T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'emp-004',
    employeeId: 'DRS-EMP-004',
    fullName: 'Priya Sundaram',
    email: 'priya.s@deeprootstudios.ai',
    phone: '+91 98860 98765',
    role: 'EMPLOYEE',
    designation: 'Senior AI Evaluation & QA Specialist',
    department: 'AI Evaluation & QA',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    dateOfJoining: '2024-08-01',
    dateOfBirth: '1997-03-14',
    reportingManagerId: 'emp-003',
    reportingManagerName: 'Karthik Ramanathan',
    address: {
      street: '302, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'India',
    },
    emergencyContact: {
      name: 'R. Sundaram',
      phone: '+91 98860 98766',
      relation: 'Father',
    },
    financialDetails: {
      bankName: 'Axis Bank',
      accountNumberMasked: '•••• •••• 6701',
      ifscCode: 'UTIB0000987',
      panNumber: 'CXPS9876Q',
      uanPfNumber: '101678901234',
      annualCTC: 1200000,
      monthlyBasic: 50000,
      monthlyHRA: 20000,
      monthlySpecialAllowance: 22000,
      monthlyConveyance: 8000,
      monthlyGross: 100000,
    },
    assignedResponsibilities: [
      'RLHF and red-teaming quality benchmark design',
      'Validation of multi-modal dataset annotation pipelines',
      'Evaluation reports for tier-1 LLM fine-tuning tasks',
    ],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'emp-005',
    employeeId: 'DRS-EMP-005',
    fullName: 'Rohan Verma',
    email: 'rohan.verma@deeprootstudios.ai',
    phone: '+91 99100 45678',
    role: 'EMPLOYEE',
    designation: 'AI Data Annotation Associate',
    department: 'Data Annotation',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ON_PROBATION',
    dateOfJoining: '2025-12-01',
    probationEndDate: '2026-03-01',
    dateOfBirth: '2001-08-19',
    reportingManagerId: 'emp-004',
    reportingManagerName: 'Priya Sundaram',
    address: {
      street: 'Flat 101, Lakeview Residency, BTM Layout 2nd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560076',
      country: 'India',
    },
    emergencyContact: {
      name: 'Meena Verma',
      phone: '+91 99100 45679',
      relation: 'Mother',
    },
    financialDetails: {
      bankName: 'Kotak Mahindra Bank',
      accountNumberMasked: '•••• •••• 3349',
      ifscCode: 'KKBK0000432',
      panNumber: 'DSVR7712P',
      uanPfNumber: '101901234567',
      annualCTC: 480000,
      monthlyBasic: 20000,
      monthlyHRA: 8000,
      monthlySpecialAllowance: 8000,
      monthlyConveyance: 4000,
      monthlyGross: 40000,
    },
    assignedResponsibilities: [
      'High-precision bounding box and polygon semantic annotation',
      'Taxonomy validation for conversational reasoning benchmarks',
    ],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'emp-006',
    employeeId: 'DRS-EMP-006',
    fullName: 'Aditi Mukhopadhyay',
    email: 'aditi.m@deeprootstudios.ai',
    phone: '+91 98300 23456',
    role: 'EMPLOYEE',
    designation: 'AI Automation Intern',
    department: 'Workflow Automation',
    employmentType: 'INTERN',
    employmentStatus: 'ACTIVE',
    dateOfJoining: '2026-01-05',
    probationEndDate: '2026-04-05',
    dateOfBirth: '2003-05-12',
    reportingManagerId: 'emp-003',
    reportingManagerName: 'Karthik Ramanathan',
    address: {
      street: '21, 14th Main, HSR Layout Sector 4',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      country: 'India',
    },
    emergencyContact: {
      name: 'Subhash Mukhopadhyay',
      phone: '+91 98300 23457',
      relation: 'Father',
    },
    financialDetails: {
      bankName: 'Federal Bank',
      accountNumberMasked: '•••• •••• 8821',
      ifscCode: 'FDRL0001099',
      panNumber: 'EKPM9012T',
      annualCTC: 360000,
      monthlyBasic: 15000,
      monthlyHRA: 6000,
      monthlySpecialAllowance: 6000,
      monthlyConveyance: 3000,
      monthlyGross: 30000,
      stipendAmount: 30000,
    },
    assignedResponsibilities: [
      'Assisting with API integration test scripts and automated scrapers',
      'Workflow trigger validation and documentation',
    ],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'emp-007',
    employeeId: 'DRS-EMP-007',
    fullName: 'Tanvi Nair',
    email: 'tanvi.nair@example.com',
    phone: '+91 94470 12389',
    role: 'EMPLOYEE',
    designation: 'AI Operations Associate',
    department: 'AI Evaluation & QA',
    employmentType: 'FULL_TIME',
    employmentStatus: 'PENDING_ONBOARDING',
    dateOfJoining: '2026-03-01',
    address: {
      street: 'Sector 7, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      country: 'India',
    },
    emergencyContact: {
      name: 'G. Nair',
      phone: '+91 94470 12390',
      relation: 'Father',
    },
    financialDetails: {
      bankName: 'HDFC Bank',
      accountNumberMasked: '•••• •••• 5512',
      ifscCode: 'HDFC0000123',
      panNumber: 'FGPN4456Y',
      annualCTC: 720000,
      monthlyBasic: 30000,
      monthlyHRA: 12000,
      monthlySpecialAllowance: 12000,
      monthlyConveyance: 6000,
      monthlyGross: 60000,
    },
    assignedResponsibilities: [
      'Offer accepted; pending joining documentation and asset handover',
    ],
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
];

export const initialDocumentTemplates: DocumentTemplate[] = [
  {
    id: 'tpl-001',
    type: 'OFFER_LETTER',
    title: 'Standard Employment Offer Letter',
    category: 'ONBOARDING',
    bodyMarkdown: `Dear {{employee_name}},

On behalf of **Deep Root Studios Private Limited (DRS)**, we are pleased to extend an offer of employment for the position of **{{designation}}** in the **{{department}}** division.

### 1. Commencement of Employment
Your employment with Deep Root Studios shall commence on **{{joining_date}}**. You will report directly to **{{reporting_manager}}** at our Pune headquarters or as mutually approved for remote operations.

### 2. Remuneration & Compensation
Your total Annual Cost to Company (CTC) will be **INR {{annual_ctc}}/-** (Rupees {{annual_ctc_in_words}}), payable on a monthly basis in accordance with company payroll cycles.

### 3. Probationary Period
You will be placed on probation for a period of **{{probation_period}}** from your date of joining. Upon successful evaluation of your performance, your employment will be confirmed in writing.

### 4. Code of Conduct & Confidentiality
During your tenure with DRS, you will have access to proprietary AI datasets, evaluation benchmarks, and client methodologies. You are required to execute our Non-Disclosure and IP Assignment Agreement prior to joining.

We look forward to welcoming you to the Deep Root Studios team as we engineer scalable, next-generation AI operations.`,
    termsAndConditions: [
      'This offer is contingent upon satisfactory completion of background verification and KYC verification.',
      'Working hours are 9:30 AM to 6:30 PM, Monday through Friday.',
      'Notice period during probation is 30 days; post confirmation it is 60 days.',
      'The terms of this offer letter are strictly confidential.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Authorized Signatory',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'tpl-002',
    type: 'APPOINTMENT_LETTER',
    title: 'Official Letter of Appointment',
    category: 'EMPLOYMENT',
    bodyMarkdown: `Dear {{employee_name}},

Sub: Letter of Appointment - Employee Code: **{{employee_id}}**

We have pleasure in appointing you as **{{designation}}** in the **{{department}}** division with **Deep Root Studios Private Limited**, effective from your date of joining **{{joining_date}}**.

### Scope of Responsibilities
You shall diligently and faithfully perform the responsibilities assigned to you by the management. You shall conform to the rules, regulations, and operational policies of Deep Root Studios in force from time to time.

### Remuneration Structure
Your monthly gross salary will be **INR {{monthly_gross}}/-** subject to applicable statutory deductions including Provident Fund, Professional Tax, and Income Tax (TDS).

### Intellectual Property Rights
All models, scripts, pipelines, annotations, datasets, and intellectual property developed by you during the course of your employment shall be the sole and exclusive property of Deep Root Studios.

We congratulate you on your appointment and wish you a rewarding career with DRS.`,
    termsAndConditions: [
      'Governed by the laws of India and subject to the jurisdiction of courts in Pune, Maharashtra.',
      'Termination of employment requires written notice as stipulated in the employment handbook.',
      'Non-compete and non-solicitation covenants remain valid for 12 months following cessation of employment.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Authorized Signatory',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'tpl-003',
    type: 'INTERNSHIP_OFFER',
    title: 'Internship Offer & Terms',
    category: 'ONBOARDING',
    bodyMarkdown: `Dear {{employee_name}},

We are pleased to offer you an internship opportunity with **Deep Root Studios** as an **{{designation}}** in the **{{department}}** team.

### Internship Terms
- **Commencement Date:** {{joining_date}}
- **Duration:** {{internship_duration}} (ending {{internship_end_date}})
- **Monthly Stipend:** INR {{stipend_amount}}/- per month
- **Reporting Mentor:** {{reporting_manager}}
- **Work Mode:** {{work_mode}}

During this internship, you will gain hands-on operational experience with cutting-edge AI pipelines, data annotation workflows, and automated evaluation harnesses under direct industry mentorship.`,
    termsAndConditions: [
      'This internship does not guarantee permanent employment, but exemplary performance will be considered for a full-time role.',
      'You are bound by DRS confidentiality and proprietary code safeguards.',
      'An internship completion certificate will be issued upon satisfactory completion of assigned deliverables.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Authorized Signatory',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'tpl-004',
    type: 'INTERNSHIP_COMPLETION',
    title: 'Internship Completion Certificate',
    category: 'CERTIFICATION',
    bodyMarkdown: `### TO WHOMSOEVER IT MAY CONCERN

This is to certify that **{{employee_name}}** has successfully completed an intensive internship program with **Deep Root Studios Private Limited** from **{{joining_date}}** to **{{exit_date}}** as an **{{designation}}** in the **{{department}}** division.

During the internship tenure, {{employee_name}} actively contributed to:
- Implementation and validation of AI evaluation benchmarks
- Workflow optimization scripts and data pipeline hygiene
- Collaborative operational QA for enterprise client deliveries

We found {{employee_name}} to be inquisitive, dedicated, and technically proficient. We commend their contributions and wish them the very best in all future academic and professional endeavors.`,
    termsAndConditions: [
      'Document authenticity can be verified at deeprootstudios.ai/verify using the unique verification ID.',
      'Issued under the seal of Deep Root Studios Private Limited.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Founder & CEO',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'tpl-005',
    type: 'EXPERIENCE_CERTIFICATE',
    title: 'Relieving & Experience Certificate',
    category: 'SEPARATION',
    bodyMarkdown: `### TO WHOMSOEVER IT MAY CONCERN

This is to certify that **{{employee_name}}** (Employee ID: **{{employee_id}}**) was employed with **Deep Root Studios Private Limited** from **{{joining_date}}** to **{{exit_date}}**.

At the time of departure, they were designated as **{{designation}}** in the **{{department}}** team.

During their tenure, they demonstrated sound technical acumen, operational diligence, and an exemplary work ethic. They have been relieved of their responsibilities with effect from close of business hours on **{{exit_date}}** following full and final settlement.

We wish {{employee_name}} every success in their future career pursuits.`,
    termsAndConditions: [
      'Issued without prejudice to company records and based on verified employment history.',
      'Traceable via official DRS verification portal.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Founder & CEO',
    updatedAt: '2026-01-25T00:00:00Z',
  },
  {
    id: 'tpl-006',
    type: 'APPRECIATION_LETTER',
    title: 'Certificate of Excellence & Appreciation',
    category: 'CERTIFICATION',
    bodyMarkdown: `### CERTIFICATE OF APPRECIATION

Presented to: **{{employee_name}}** ({{employee_id}})

In special recognition of your outstanding performance, innovation, and dedication to excellence at **Deep Root Studios**.

Your exceptional leadership and technical contribution to the **{{department}}** team have significantly elevated our operational standards and client benchmarks.

Deep Root Studios values your commitment and is proud to count you as an integral pillar of our technological foundation.`,
    termsAndConditions: [
      'Conferred by the Executive Leadership Team of Deep Root Studios.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Founder & Managing Director',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'tpl-007',
    type: 'PROMOTION_LETTER',
    title: 'Letter of Promotion & Compensation Revision',
    category: 'EMPLOYMENT',
    bodyMarkdown: `Dear {{employee_name}},

Sub: Promotion to **{{new_designation}}**

Management is pleased to recognize your sustained high-caliber performance and impact at **Deep Root Studios**. Effective from **{{effective_date}}**, you are hereby promoted to the position of:

**{{new_designation}}** – **{{department}}**

In recognition of your expanded scope of responsibilities, your revised Annual CTC will be **INR {{revised_ctc}}/-**.

We congratulate you on this well-deserved milestone and look forward to your continued leadership in scaling DRS.`,
    termsAndConditions: [
      'All other terms and conditions of your original appointment letter remain in full force.',
      'Approved and issued under executive authority.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Founder & CEO',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'tpl-008',
    type: 'WARNING_LETTER',
    title: 'Formal Performance / Compliance Advisory',
    category: 'EMPLOYMENT',
    bodyMarkdown: `Dear {{employee_name}},

Sub: Formal Written Advisory - Employee Code: **{{employee_id}}**

This letter serves as formal notification regarding observed deviations concerning **{{advisory_subject}}**.

Despite prior discussions on **{{prior_discussion_date}}**, your adherence to the expected operational standards in **{{department}}** requires immediate and sustained improvement.

You are requested to adhere to the Performance Improvement Plan outlined by your reporting manager. Failure to meet the agreed standards within **{{remediation_days}} days** may lead to further administrative action under company policy.`,
    termsAndConditions: [
      'Maintained in strict HR confidence and recorded in internal audit registry.',
      'Copy placed in the employee operational dossier.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Operations',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'tpl-009',
    type: 'EMPLOYMENT_VERIFICATION',
    title: 'Employment Verification Letter',
    category: 'EMPLOYMENT',
    bodyMarkdown: `### TO WHOMSOEVER IT MAY CONCERN

This is to certify that **{{employee_name}}** (Employee ID: **{{employee_id}}**) is a bona fide, full-time employee of **Deep Root Studios Private Limited**, currently designated as **{{designation}}** in the **{{department}}** division.

### Employment Particulars:
- **Date of Joining:** {{joining_date}}
- **Employment Status:** Active / Confirmed
- **Current Annual CTC:** INR {{annual_ctc}}/-
- **Work Location:** Pune, Maharashtra, India

This certificate is issued at the specific request of the employee for official verification purposes (such as banking, housing, or regulatory processing) without any liability on the part of Deep Root Studios Private Limited or its signatories.`,
    termsAndConditions: [
      'Issued for official verification purposes only.',
      'Document authenticity verifiable at deeprootstudios.ai/verify.',
    ],
    requiresFounderApproval: false,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Authorized Signatory',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'tpl-010',
    type: 'RELIEVING_LETTER',
    title: 'Official Relieving Order & Clearance Certificate',
    category: 'SEPARATION',
    bodyMarkdown: `Dear {{employee_name}},

Sub: Relieving Order - Employee Code: **{{employee_id}}**

With reference to your formal resignation letter, we hereby confirm that you have been relieved of your duties and responsibilities as **{{designation}}** with **Deep Root Studios Private Limited** effective from the close of business hours on **{{exit_date}}**.

All company assets, confidential information, credentials, and repository access entrusted to you have been surrendered, and your Full and Final (F&F) settlement has been duly cleared by the Finance department.

We appreciate your contributions to Deep Root Studios during your tenure and wish you the best in your future endeavors.`,
    termsAndConditions: [
      'Post-employment confidentiality covenants remain operative as per the signed employment contract.',
      'Verifiable via DRS Central Operations Registry.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Authorized Signatory',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'tpl-011',
    type: 'RESIGNATION_ACCEPTANCE',
    title: 'Resignation Acceptance & Notice Period Acknowledgment',
    category: 'SEPARATION',
    bodyMarkdown: `Dear {{employee_name}},

Sub: Acceptance of Resignation - Employee Code: **{{employee_id}}**

We acknowledge receipt of your resignation notice dated **{{resignation_date}}** from the position of **{{designation}}** in the **{{department}}** division.

Management hereby accepts your resignation. In accordance with company policy, your notice period shall conclude on **{{last_working_day}}**, which shall be your Last Working Day (LWD) with Deep Root Studios.

You are requested to complete the formal handover of all assigned tasks, code repositories, and documentation to **{{handover_assignee}}** prior to your release date.`,
    termsAndConditions: [
      'Full and Final settlement shall be credited within 30 days of the last working day following completion of all department clearances.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Head of Human Resources & Operations',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'tpl-012',
    type: 'PROJECT_COMPLETION',
    title: 'Certificate of Project Completion & Milestone Delivery',
    category: 'CERTIFICATION',
    bodyMarkdown: `### CERTIFICATE OF PROJECT DELIVERY EXCELLENCE

Presented to **{{employee_name}}** (Employee ID: **{{employee_id}}**)

In recognition of outstanding technical execution, operational precision, and key milestone delivery in the **{{project_name}}** initiative under the **{{department}}** division at Deep Root Studios.

Their contributions to engineering scalable pipelines, quality assurance, and automated agent workflows have established industry benchmarks for our client deliveries.`,
    termsAndConditions: [
      'Conferred by Executive Leadership of Deep Root Studios Private Limited.',
    ],
    requiresFounderApproval: true,
    isActive: true,
    signatoryTitle: 'Founder & CEO',
    updatedAt: '2026-02-05T00:00:00Z',
  },
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: 'doc-001',
    documentNumber: 'DRS/OFF/2024/001',
    type: 'OFFER_LETTER',
    title: 'Employment Offer Letter - Karthik Ramanathan',
    employeeId: 'emp-003',
    employeeName: 'Karthik Ramanathan',
    designation: 'Lead AI Engineer & Automation Architect',
    status: 'ISSUED',
    issueDate: '2024-04-15',
    verificationToken: 'v-drs-7821-4902-auth',
    preparedBy: 'Maroti Kadam',
    approvedBy: 'Devesh Ambekar',
    approvedAt: '2024-04-16T10:30:00Z',
    content: {
      employee_name: 'Karthik Ramanathan',
      employee_id: 'DRS-EMP-003',
      designation: 'Lead AI Engineer & Automation Architect',
      department: 'AI Agents & Automation',
      joining_date: '02 May 2024',
      reporting_manager: 'Devesh Ambekar (Founder & CEO)',
      annual_ctc: '19,20,000',
      annual_ctc_in_words: 'Nineteen Lakhs Twenty Thousand Only',
      probation_period: '3 Months',
    },
    createdAt: '2024-04-15T09:00:00Z',
    updatedAt: '2024-04-16T10:30:00Z',
  },
  {
    id: 'doc-002',
    documentNumber: 'DRS/APT/2024/001',
    type: 'APPOINTMENT_LETTER',
    title: 'Appointment Letter - Karthik Ramanathan',
    employeeId: 'emp-003',
    employeeName: 'Karthik Ramanathan',
    designation: 'Lead AI Engineer & Automation Architect',
    status: 'ISSUED',
    issueDate: '2024-05-02',
    verificationToken: 'v-drs-8832-1109-apt',
    preparedBy: 'Maroti Kadam',
    approvedBy: 'Devesh Ambekar',
    approvedAt: '2024-05-02T11:00:00Z',
    content: {
      employee_name: 'Karthik Ramanathan',
      employee_id: 'DRS-EMP-003',
      designation: 'Lead AI Engineer & Automation Architect',
      department: 'AI Agents & Automation',
      joining_date: '02 May 2024',
      monthly_gross: '1,60,000',
    },
    createdAt: '2024-05-02T09:00:00Z',
    updatedAt: '2024-05-02T11:00:00Z',
  },
  {
    id: 'doc-003',
    documentNumber: 'DRS/OFF/2026/007',
    type: 'OFFER_LETTER',
    title: 'Employment Offer Letter - Tanvi Nair',
    employeeId: 'emp-007',
    employeeName: 'Tanvi Nair',
    designation: 'AI Operations Associate',
    status: 'PENDING_APPROVAL',
    issueDate: '2026-02-05',
    verificationToken: 'v-drs-9923-0182-pending',
    preparedBy: 'Maroti Kadam',
    content: {
      employee_name: 'Tanvi Nair',
      employee_id: 'DRS-EMP-007',
      designation: 'AI Operations Associate',
      department: 'AI Evaluation & QA',
      joining_date: '01 March 2026',
      reporting_manager: 'Priya Sundaram',
      annual_ctc: '7,20,000',
      annual_ctc_in_words: 'Seven Lakhs Twenty Thousand Only',
      probation_period: '3 Months',
    },
    notes: 'Drafted by HR (Maroti Kadam); awaiting Founder signature and official seal approval.',
    createdAt: '2026-02-05T14:30:00Z',
    updatedAt: '2026-02-05T14:30:00Z',
  },
  {
    id: 'doc-004',
    documentNumber: 'DRS/APP/2025/002',
    type: 'APPRECIATION_LETTER',
    title: 'Certificate of Appreciation - Priya Sundaram',
    employeeId: 'emp-004',
    employeeName: 'Priya Sundaram',
    designation: 'Senior AI Evaluation & QA Specialist',
    status: 'ISSUED',
    issueDate: '2025-12-20',
    verificationToken: 'v-drs-4451-9011-app',
    preparedBy: 'Maroti Kadam',
    approvedBy: 'Devesh Ambekar',
    approvedAt: '2025-12-20T17:00:00Z',
    content: {
      employee_name: 'Priya Sundaram',
      employee_id: 'DRS-EMP-004',
      department: 'AI Evaluation & QA',
      achievement: 'Exceptional delivery on Multi-Modal LLM Benchmark pipeline under strict timelines.',
    },
    createdAt: '2025-12-19T10:00:00Z',
    updatedAt: '2025-12-20T17:00:00Z',
  },
  {
    id: 'doc-005',
    documentNumber: 'DRS/INT/2026/001',
    type: 'INTERNSHIP_OFFER',
    title: 'Internship Offer - Aditi Mukhopadhyay',
    employeeId: 'emp-006',
    employeeName: 'Aditi Mukhopadhyay',
    designation: 'AI Automation Intern',
    status: 'ISSUED',
    issueDate: '2025-12-28',
    verificationToken: 'v-drs-3301-7782-int',
    preparedBy: 'Maroti Kadam',
    approvedBy: 'Devesh Ambekar',
    approvedAt: '2025-12-29T11:00:00Z',
    content: {
      employee_name: 'Aditi Mukhopadhyay',
      employee_id: 'DRS-EMP-006',
      designation: 'AI Automation Intern',
      department: 'Workflow Automation',
      joining_date: '05 January 2026',
      internship_duration: '3 Months',
      internship_end_date: '05 April 2026',
      stipend_amount: '30,000',
      reporting_manager: 'Karthik Ramanathan',
      work_mode: 'Hybrid (Pune Office)',
    },
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2025-12-29T11:00:00Z',
  },
];

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-101',
    employeeId: 'emp-001',
    employeeName: 'Devesh Ambekar',
    date: '2026-11-06',
    checkIn: '09:15',
    checkOut: '19:00',
    workMode: 'OFFICE',
    status: 'PRESENT',
    workingHours: 9.75,
  },
  {
    id: 'att-102',
    employeeId: 'emp-002',
    employeeName: 'Maroti Kadam',
    date: '2026-11-06',
    checkIn: '09:20',
    checkOut: '18:40',
    workMode: 'OFFICE',
    status: 'PRESENT',
    workingHours: 9.33,
  },
  {
    id: 'att-103',
    employeeId: 'emp-003',
    employeeName: 'Karthik Ramanathan',
    date: '2026-11-06',
    checkIn: '09:30',
    checkOut: '18:45',
    workMode: 'REMOTE',
    status: 'PRESENT',
    workingHours: 9.25,
  },
  {
    id: 'att-104',
    employeeId: 'emp-004',
    employeeName: 'Priya Sundaram',
    date: '2026-11-06',
    checkIn: '09:40',
    checkOut: '18:30',
    workMode: 'HYBRID',
    status: 'PRESENT',
    workingHours: 8.83,
  },
  {
    id: 'att-105',
    employeeId: 'emp-005',
    employeeName: 'Rohan Verma',
    date: '2026-11-06',
    checkIn: '09:20',
    checkOut: '18:20',
    workMode: 'OFFICE',
    status: 'PRESENT',
    workingHours: 9.0,
  },
  {
    id: 'att-106',
    employeeId: 'emp-006',
    employeeName: 'Aditi Mukhopadhyay',
    date: '2026-11-06',
    checkIn: '09:45',
    checkOut: '18:00',
    workMode: 'OFFICE',
    status: 'PRESENT',
    workingHours: 8.25,
  },
];

export const initialLeaveBalances: LeaveBalance[] = [
  {
    employeeId: 'emp-001',
    year: 2026,
    casualTotal: 12,
    casualUsed: 1,
    sickTotal: 8,
    sickUsed: 0,
    earnedTotal: 15,
    earnedUsed: 2,
    unpaidTaken: 0,
  },
  {
    employeeId: 'emp-002',
    year: 2026,
    casualTotal: 12,
    casualUsed: 1,
    sickTotal: 8,
    sickUsed: 1,
    earnedTotal: 15,
    earnedUsed: 0,
    unpaidTaken: 0,
  },
  {
    employeeId: 'emp-003',
    year: 2026,
    casualTotal: 12,
    casualUsed: 3,
    sickTotal: 8,
    sickUsed: 0,
    earnedTotal: 15,
    earnedUsed: 1,
    unpaidTaken: 0,
  },
  {
    employeeId: 'emp-004',
    year: 2026,
    casualTotal: 12,
    casualUsed: 1,
    sickTotal: 8,
    sickUsed: 2,
    earnedTotal: 15,
    earnedUsed: 0,
    unpaidTaken: 0,
  },
  {
    employeeId: 'emp-005',
    year: 2026,
    casualTotal: 12,
    casualUsed: 1,
    sickTotal: 8,
    sickUsed: 0,
    earnedTotal: 15,
    earnedUsed: 0,
    unpaidTaken: 0,
  },
  {
    employeeId: 'emp-006',
    year: 2026,
    casualTotal: 6,
    casualUsed: 0,
    sickTotal: 4,
    sickUsed: 0,
    earnedTotal: 0,
    earnedUsed: 0,
    unpaidTaken: 0,
  },
];

export const initialLeaveApplications: LeaveApplication[] = [
  {
    id: 'leave-001',
    employeeId: 'emp-003',
    employeeName: 'Karthik Ramanathan',
    leaveType: 'CASUAL',
    startDate: '2026-11-12',
    endDate: '2026-11-13',
    totalDays: 2,
    reason: 'Family function and travel to home town',
    status: 'PENDING',
    appliedOn: '2026-11-05',
  },
  {
    id: 'leave-002',
    employeeId: 'emp-004',
    employeeName: 'Priya Sundaram',
    leaveType: 'SICK',
    startDate: '2026-10-24',
    endDate: '2026-10-25',
    totalDays: 2,
    reason: 'Viral fever and medical rest',
    status: 'APPROVED',
    appliedOn: '2026-10-23',
    reviewedBy: 'Maroti Kadam',
    reviewedAt: '2026-10-23T16:00:00Z',
    reviewRemarks: 'Approved. Take rest.',
  },
];

export const initialPayrollCycles: PayrollRecord[] = [
  {
    id: 'pay-2026-10',
    month: 10,
    year: 2026,
    totalEmployees: 6,
    totalGrossPayout: 770000,
    totalDeductions: 55600,
    totalNetPayout: 714400,
    status: 'PAID',
    preparedBy: 'Maroti Kadam',
    preparedAt: '2026-10-28T14:00:00Z',
    approvedBy: 'Devesh Ambekar',
    approvedAt: '2026-10-30T10:00:00Z',
    paymentDate: '2026-10-31',
    paymentReference: 'NEFT-DRS-PAY-20261031-891',
    payslipsCount: 6,
  },
  {
    id: 'pay-2026-11',
    month: 11,
    year: 2026,
    totalEmployees: 6,
    totalGrossPayout: 770000,
    totalDeductions: 55600,
    totalNetPayout: 714400,
    status: 'DRAFT',
    preparedBy: 'Maroti Kadam',
    preparedAt: '2026-11-06T15:00:00Z',
    payslipsCount: 6,
  },
];

export const initialPayslips: PayslipItem[] = [
  {
    id: 'slip-001',
    payrollId: 'pay-2026-10',
    payslipNumber: 'DRS/PAY/2026/10/003',
    employeeId: 'emp-003',
    employeeName: 'Karthik Ramanathan',
    designation: 'Lead AI Engineer & Automation Architect',
    department: 'AI Agents & Automation',
    month: 10,
    year: 2026,
    workingDays: 22,
    paidDays: 22,
    lossOfPayDays: 0,
    basicSalary: 80000,
    hra: 32000,
    specialAllowance: 36000,
    bonus: 0,
    grossEarnings: 160000,
    providentFund: 1800,
    professionalTax: 200,
    tdsTax: 12500,
    otherDeductions: 0,
    totalDeductions: 14500,
    netSalary: 145500,
    netSalaryInWords: 'One Lakh Forty-Five Thousand Five Hundred Only',
    paymentStatus: 'PAID',
    paymentDate: '2026-10-31',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 1120',
  },
  {
    id: 'slip-002',
    payrollId: 'pay-2026-10',
    payslipNumber: 'DRS/PAY/2026/10/004',
    employeeId: 'emp-004',
    employeeName: 'Priya Sundaram',
    designation: 'Senior AI Evaluation & QA Specialist',
    department: 'AI Evaluation & QA',
    month: 10,
    year: 2026,
    workingDays: 22,
    paidDays: 22,
    lossOfPayDays: 0,
    basicSalary: 50000,
    hra: 20000,
    specialAllowance: 22000,
    bonus: 5000,
    grossEarnings: 105000,
    providentFund: 1800,
    professionalTax: 200,
    tdsTax: 6200,
    otherDeductions: 0,
    totalDeductions: 8200,
    netSalary: 96800,
    netSalaryInWords: 'Ninety-Six Thousand Eight Hundred Only',
    paymentStatus: 'PAID',
    paymentDate: '2026-10-31',
    bankName: 'Axis Bank',
    accountNumberMasked: '•••• •••• 6701',
  },
  {
    id: 'slip-003',
    payrollId: 'pay-2026-10',
    payslipNumber: 'DRS/PAY/2026/10/006',
    employeeId: 'emp-006',
    employeeName: 'Aditi Mukhopadhyay',
    designation: 'AI Automation Intern',
    department: 'Workflow Automation',
    month: 10,
    year: 2026,
    workingDays: 22,
    paidDays: 22,
    lossOfPayDays: 0,
    basicSalary: 15000,
    hra: 6000,
    specialAllowance: 6000,
    bonus: 0,
    grossEarnings: 30000,
    providentFund: 0,
    professionalTax: 0,
    tdsTax: 0,
    otherDeductions: 0,
    totalDeductions: 0,
    netSalary: 30000,
    netSalaryInWords: 'Thirty Thousand Only',
    paymentStatus: 'PAID',
    paymentDate: '2026-10-31',
    bankName: 'Federal Bank',
    accountNumberMasked: '•••• •••• 8821',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    actorId: 'emp-001',
    actorName: 'Devesh Ambekar',
    actorRole: 'FOUNDER',
    action: 'PAYROLL_APPROVED_AND_PAID',
    entityType: 'PAYROLL',
    entityId: 'pay-2026-10',
    details: 'Approved October 2026 payroll cycle disbursement of INR 7,14,400 across 6 employees.',
    ipAddress: '103.21.144.12',
    timestamp: '2026-10-30T10:00:00Z',
  },
  {
    id: 'audit-002',
    actorId: 'emp-002',
    actorName: 'Maroti Kadam',
    actorRole: 'HR_MANAGER',
    action: 'DOCUMENT_DRAFT_CREATED',
    entityType: 'DOCUMENT',
    entityId: 'doc-003',
    details: 'Drafted Offer Letter for Tanvi Nair (AI Operations Associate); submitted for Founder authorization.',
    ipAddress: '103.21.144.18',
    timestamp: '2026-02-05T14:30:00Z',
  },
  {
    id: 'audit-003',
    actorId: 'emp-001',
    actorName: 'Devesh Ambekar',
    actorRole: 'FOUNDER',
    action: 'OFFICIAL_DOCUMENT_ISSUED',
    entityType: 'DOCUMENT',
    entityId: 'doc-001',
    details: 'Signed and authorized Offer Letter DRS/OFF/2024/001 with digital verification QR token, seal and Maroti Kadam signature.',
    ipAddress: '103.21.144.12',
    timestamp: '2024-04-16T10:30:00Z',
  },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Deep Root Studios Achieves ISO/IEC 27001 AI Data Security Certification',
    category: 'CELEBRATION',
    content: 'We are thrilled to announce that Deep Root Studios has successfully concluded our enterprise security audit for automated data annotation and client model evaluation. Congratulations to all operations and engineering leads!',
    authorName: 'Devesh Ambekar (Founder)',
    isPinned: true,
    date: '2026-11-01',
  },
  {
    id: 'ann-002',
    title: 'Workplace Operations Update: Official Stamp & Documentation Protocol',
    category: 'POLICY',
    content: 'All official employment agreements, internship credentials, and experience certificates will now carry the official DRS company seal stamp and authorized signature of Head of HR Maroti Kadam alongside Founder Devesh Ambekar.',
    authorName: 'Maroti Kadam (People Ops)',
    isPinned: false,
    date: '2026-11-04',
  },
];

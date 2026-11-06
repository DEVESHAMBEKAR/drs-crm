// Deep Root Studios (DRS) Type Definitions

export type UserRole = 'FOUNDER' | 'HR_MANAGER' | 'EMPLOYEE';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACT' | 'CONSULTANT';

export type EmploymentStatus = 
  | 'PENDING_ONBOARDING'
  | 'ACTIVE'
  | 'ON_PROBATION'
  | 'ON_LEAVE'
  | 'RESIGNED'
  | 'TERMINATED'
  | 'COMPLETED_INTERNSHIP';

export type DocumentType = 
  | 'OFFER_LETTER'
  | 'APPOINTMENT_LETTER'
  | 'INTERNSHIP_OFFER'
  | 'INTERNSHIP_AGREEMENT'
  | 'INTERNSHIP_EXTENSION'
  | 'INTERNSHIP_COMPLETION'
  | 'EXPERIENCE_CERTIFICATE'
  | 'EMPLOYMENT_VERIFICATION'
  | 'RELIEVING_LETTER'
  | 'RESIGNATION_ACCEPTANCE'
  | 'PROMOTION_LETTER'
  | 'APPRECIATION_LETTER'
  | 'WARNING_LETTER'
  | 'TRAINING_COMPLETION'
  | 'PROJECT_COMPLETION'
  | 'ACHIEVEMENT_CERTIFICATE'
  | 'PAYSLIP';

export type DocumentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED' | 'REVOKED';

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND';

export type WorkMode = 'OFFICE' | 'REMOTE' | 'HYBRID';

export type PayrollStatus = 'DRAFT' | 'SUBMITTED_FOR_APPROVAL' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface CompanySettings {
  companyName: string;
  abbreviation: string;
  industry: string;
  category: string;
  tagline: string;
  positioning: string;
  website: string;
  officialEmail: string;
  hrEmail: string;
  phone: string;
  address: string;
  cinNumber: string;
  logoUrl?: string;
  founderName: string;
  founderTitle: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  authorizedSignatorySignatureUrl?: string;
  sealUrl?: string;
  documentPrefix: string;
}

export interface EmployeeProfile {
  id: string;
  employeeId: string; // e.g. DRS-EMP-001
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  designation: string;
  department: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfJoining: string; // ISO date YYYY-MM-DD
  dateOfBirth?: string;
  probationEndDate?: string;
  exitDate?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  avatarUrl?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  // Sensitive finance details (restricted to Founder/HR)
  financialDetails?: {
    bankName: string;
    accountNumberMasked: string; // e.g. *******1234
    ifscCode: string;
    panNumber: string;
    uanPfNumber?: string;
    annualCTC: number;
    monthlyBasic: number;
    monthlyHRA: number;
    monthlySpecialAllowance: number;
    monthlyConveyance: number;
    monthlyGross: number;
    stipendAmount?: number;
  };
  assignedResponsibilities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  documentNumber: string; // e.g. DRS/OFF/2026/001
  type: DocumentType;
  title: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  status: DocumentStatus;
  issueDate: string;
  verificationToken: string; // Cryptographic hash
  preparedBy: string; // Name/ID
  approvedBy?: string;
  approvedAt?: string;
  revokedAt?: string;
  revocationReason?: string;
  content: Record<string, any>; // Placeholders & template data
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: string;
  type: DocumentType;
  title: string;
  category: 'ONBOARDING' | 'EMPLOYMENT' | 'CERTIFICATION' | 'SEPARATION' | 'PAYROLL';
  bodyMarkdown: string;
  termsAndConditions: string[];
  requiresFounderApproval: boolean;
  isActive: boolean;
  signatoryTitle: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  workMode: WorkMode;
  status: AttendanceStatus;
  workingHours?: number;
  correctionRequested?: boolean;
  correctionNote?: string;
  correctionStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewRemarks?: string;
  reviewedAt?: string;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
  earnedTotal: number;
  earnedUsed: number;
  unpaidTaken: number;
}

export interface PayrollRecord {
  id: string;
  month: number; // 1-12
  year: number;
  totalEmployees: number;
  totalGrossPayout: number;
  totalDeductions: number;
  totalNetPayout: number;
  status: PayrollStatus;
  preparedBy: string;
  preparedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paymentDate?: string;
  paymentReference?: string;
  payslipsCount: number;
}

export interface PayslipItem {
  id: string;
  payrollId: string;
  payslipNumber: string; // DRS/PAY/2026/04/001
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  month: number;
  year: number;
  workingDays: number;
  paidDays: number;
  lossOfPayDays: number;
  // Earnings
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  bonus: number;
  grossEarnings: number;
  // Deductions
  providentFund: number;
  professionalTax: number;
  tdsTax: number;
  otherDeductions: number;
  totalDeductions: number;
  // Net
  netSalary: number;
  netSalaryInWords: string;
  paymentStatus: 'UNPAID' | 'PROCESSED' | 'PAID';
  paymentDate?: string;
  bankName: string;
  accountNumberMasked: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'GENERAL' | 'POLICY' | 'CELEBRATION' | 'URGENT';
  content: string;
  authorName: string;
  isPinned: boolean;
  date: string;
}

// ==========================================
// PROJECTS & TASKS (Core AI Operations)
// ==========================================
export type ProjectCategory = 
  | 'DATA_ANNOTATION'
  | 'AI_EVALUATION'
  | 'AI_AGENTS'
  | 'WORKFLOW_AUTOMATION';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'ON_HOLD';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
}

export interface Project {
  id: string;
  code: string; // e.g. DRS-PRJ-01
  name: string;
  category: ProjectCategory;
  description: string;
  leadId: string;
  leadName: string;
  status: ProjectStatus;
  startDate: string;
  targetEndDate: string;
  clientName?: string;
  tasksCount: number;
  completedTasksCount: number;
}

// ==========================================
// ONBOARDING & OFFBOARDING LIFECYCLE
// ==========================================
export interface OnboardingItem {
  id: string;
  title: string;
  category: 'DOCUMENTATION' | 'IT_HARDWARE' | 'CREDENTIALS' | 'COMPLIANCE' | 'ORIENTATION';
  isCompleted: boolean;
  completedAt?: string;
  verifiedBy?: string;
}

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  items: OnboardingItem[];
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriodDays: number;
  reason: string;
  status: 'INITIATED' | 'CLEARANCE_PENDING' | 'SETTLED' | 'RELIEVED';
  itAssetsReturned: boolean;
  accessRevoked: boolean;
  duesCleared: boolean;
  fnfAmountSettled: number;
  relievingLetterIssued: boolean;
  experienceCertificateIssued: boolean;
}

// ==========================================
// ATTENDANCE CORRECTION REQUEST
// ==========================================
export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  workMode: WorkMode;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
}



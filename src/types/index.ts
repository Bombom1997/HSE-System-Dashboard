export type UserRole = 'ADMIN' | 'USER' | 'VIEWER';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  siteId: string;
  siteName: string;
  position: string;
  phone: string;
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headName: string;
}

export interface MiningSite {
  id: string;
  code: string;
  name: string;
  location: string;
}

export type DocumentCategoryType = 
  | 'SOP' 
  | 'STD' 
  | 'IK' 
  | 'JSA' 
  | 'FORM' 
  | 'REC' 
  | 'POL' 
  | 'PED' 
  | 'MANUAL' 
  | 'REG'
  | 'EXT';

export type DocumentStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Revision Required' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Effective' 
  | 'Obsolete' 
  | 'Archived';

export type ConfidentialityLevel = 'Publik' | 'Internal' | 'Rahasia (Confidential)' | 'Sangat Rahasia (Restricted)';

export interface DocumentVersion {
  id: string;
  versionNumber: string; // e.g. 'Rev.00', 'Rev.01'
  status: DocumentStatus;
  releaseDate: string;
  changeSummary: string;
  fileName: string;
  fileSizeKb: number;
  authorName: string;
  approverName?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  docNumber: string;
  title: string;
  category: DocumentCategoryType;
  departmentId: string;
  departmentName: string;
  siteId: string;
  siteName: string;
  businessProcess: string;
  sheAspectRisk: string;
  currentRevision: string;
  status: DocumentStatus;
  confidentiality: ConfidentialityLevel;
  effectiveDate: string;
  reviewDueDate: string;
  createdBy: string;
  authorName: string;
  reviewerName: string;
  approverName: string;
  fileName: string;
  fileSizeKb: number;
  changeSummary: string;
  versions: DocumentVersion[];
  mappedSMKPElements: string[]; // e.g. ['I.1', 'IV.1']
  mappedISOClauses: string[]; // e.g. ['ISO9001-8.1', 'ISO45001-8.1']
  createdAt: string;
  updatedAt: string;
}

// SMKP Minerba Kepdirjen 185
export interface SMKPCriteria {
  id: string;
  subElementId: string;
  code: string; // e.g. '1.1.1'
  requirementText: string;
  regulatoryReference: string;
  expectedEvidence: string;
  verificationGuidance: string;
}

export interface SMKPSubElement {
  id: string;
  elementId: number;
  code: string; // e.g. 'I.1'
  title: string;
  description?: string;
  criteria: SMKPCriteria[];
}

export interface SMKPElement {
  id: number;
  romanNumber: string; // 'I', 'II', ...
  title: string;
  weightPercentage: number;
  description: string;
  subElements: SMKPSubElement[];
}

// ISO Standard (9001, 14001, 45001)
export type ISOType = 'ISO 9001' | 'ISO 14001' | 'ISO 45001';

export interface ISORequirement {
  id: string;
  clauseId: string;
  subClauseCode: string; // e.g. '4.1'
  title: string;
  verifiedSummary: string;
  expectedEvidence: string;
}

export interface ISOClause {
  id: string;
  clauseNumber: number; // 4 to 10
  title: string;
  requirements: ISORequirement[];
}

export interface ISOStandard {
  id: string;
  type: ISOType;
  code: string; // 'ISO 9001:2015'
  name: string;
  edition: string;
  clauses: ISOClause[];
}

// Audit Module
export type AuditType = 'SMKP Minerba' | 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'Audit Terintegrasi';
export type AuditStatus = 'Draft' | 'Terjadwal' | 'Sedang Berjalan' | 'Penyusunan Laporan' | 'Selesai' | 'Ditutup';

export type ChecklistResult = 
  | 'Compliant' 
  | 'Noncompliant' 
  | 'Partial Compliance' 
  | 'Not Applicable' 
  | 'Not Yet Verified';

export interface AuditChecklistItem {
  id: string;
  auditId: string;
  standardType: 'SMKP' | 'ISO 9001' | 'ISO 14001' | 'ISO 45001';
  code: string;
  requirementText: string;
  expectedEvidence: string;
  documentRefNumber?: string;
  resultStatus: ChecklistResult;
  naJustification?: string;
  auditorNotes?: string;
  fieldObservation?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  evidenceFiles?: string[];
}

export interface AuditItem {
  id: string;
  auditNumber: string;
  title: string;
  auditType: AuditType;
  standards: string[];
  departmentId: string;
  departmentName: string;
  siteId: string;
  siteName: string;
  startDate: string;
  endDate: string;
  leadAuditor: string;
  auditors: string[];
  auditeePIC: string;
  scope: string;
  objective: string;
  status: AuditStatus;
  checklists: AuditChecklistItem[];
  createdAt: string;
}

// Findings & CAPA
export type FindingCategory = 'Major Nonconformity' | 'Minor Nonconformity' | 'Observation' | 'Opportunity for Improvement (OFI)';
export type RiskLevel = 'Tinggi' | 'Sedang' | 'Rendah';
export type FindingStatus = 'Open' | 'Assigned' | 'In Progress' | 'Pending Verification' | 'Rejected' | 'Closed' | 'Overdue';

export interface AuditFinding {
  id: string;
  findingNumber: string;
  auditId: string;
  auditNumber: string;
  standardType: string;
  clauseOrElement: string;
  title: string;
  conditionDescription: string;
  criteriaRequirement: string;
  objectiveEvidence: string;
  category: FindingCategory;
  riskLevel: RiskLevel;
  status: FindingStatus;
  picId: string;
  picName: string;
  departmentName: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  
  // CAPA details
  rootCauseAnalysis?: string;
  rcaMethod?: string;
  immediateCorrection?: string;
  correctiveActionPlan?: string;
  preventiveMeasure?: string;
  evidenceFile?: string;
  evidenceDescription?: string;
  submissionDate?: string;
  verifierName?: string;
  verificationNotes?: string;
  effectivenessResult?: 'Efektif' | 'Tidak Efektif' | 'Perlu Tinjauan Ulang';
  closureDate?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  timestamp: string;
  isRead: boolean;
  linkModule?: string;
}

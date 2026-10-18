import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import { 
  UserProfile, 
  UserRole, 
  Department, 
  MiningSite, 
  DocumentItem, 
  SMKPElement, 
  ISOStandard, 
  AuditItem, 
  AuditFinding, 
  AppNotification, 
  AuditLogItem,
  ChecklistResult,
  DocumentStatus,
  FindingStatus
} from '../types';
import { 
  INITIAL_PROFILES, 
  INITIAL_DEPARTMENTS, 
  INITIAL_SITES, 
  INITIAL_DOCUMENTS, 
  INITIAL_SMKP_MASTER, 
  INITIAL_ISO_STANDARDS, 
  INITIAL_AUDITS, 
  INITIAL_FINDINGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from '../data/initialData';
import { supabase, checkSupabaseConnection, SupabaseConnectionStatus } from '../lib/supabase';

interface AppContextType {
  // User & Auth
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  switchUserRole: (role: UserRole) => void;
  loginUser: (email: string, pass: string, rememberMe?: boolean) => { success: boolean; message: string };
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
  changeUserPassword: (userId: string, oldPass: string, newPass: string) => { success: boolean; message: string };
  registerUser: (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    departmentId: string;
    siteId: string;
    position: string;
    phone: string;
  }) => { success: boolean; message: string };
  toggleUserActiveStatus: (userId: string) => void;
  addNewUser: (user: Omit<UserProfile, 'id'>) => void;
  hasPermission: (permission: string) => boolean;

  // Master Data
  departments: Department[];
  sites: MiningSite[];
  smkpMaster: SMKPElement[];
  isoMaster: ISOStandard[];
  updateSMKPCriteria: (criteriaId: string, updates: Partial<{ requirementText: string; expectedEvidence: string; verificationGuidance: string }>) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  submitDocumentForReview: (id: string) => void;
  approveDocument: (id: string, approverName: string) => void;
  rejectDocument: (id: string, comments: string) => void;
  createDocumentRevision: (id: string, newRevNumber: string, changeSummary: string, fileName: string) => void;
  archiveDocument: (id: string) => void;

  // Audits
  audits: AuditItem[];
  createAudit: (audit: Omit<AuditItem, 'id' | 'createdAt' | 'checklists'>) => void;
  updateChecklistResult: (
    auditId: string, 
    checklistId: string, 
    status: ChecklistResult, 
    notes: string, 
    fieldObs: string, 
    naJust: string
  ) => void;
  updateAuditStatus: (auditId: string, status: AuditItem['status']) => void;

  // Findings & CAR
  findings: AuditFinding[];
  createFinding: (finding: Omit<AuditFinding, 'id' | 'createdAt' | 'findingNumber'>) => void;
  updateFindingStatus: (id: string, status: FindingStatus) => void;
  submitCAR: (
    findingId: string, 
    data: {
      rca: string;
      method: string;
      correction: string;
      actionPlan: string;
      preventive: string;
      evidenceDesc: string;
    }
  ) => void;
  verifyAndCloseFinding: (
    findingId: string, 
    data: {
      verifierName: string;
      notes: string;
      effectiveness: 'Efektif' | 'Tidak Efektif' | 'Perlu Tinjauan Ulang';
    }
  ) => void;

  // Notifications & Audit Logs
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, module: string, details: string) => void;

  // Filters & State
  selectedSiteFilter: string;
  setSelectedSiteFilter: (site: string) => void;
  selectedDeptFilter: string;
  setSelectedDeptFilter: (dept: string) => void;

  // Excel Operations
  exportDocumentsToExcel: () => void;
  exportAuditReportToExcel: (auditId: string) => void;
  exportFindingsToExcel: () => void;
  importMasterFromExcel: (type: 'documents' | 'smkp' | 'iso', jsonData: any[]) => { success: boolean; count: number; error?: string };
  resetToDemoData: () => void;

  // Supabase Backend Sync
  supabaseStatus: SupabaseConnectionStatus | null;
  isSyncingWithSupabase: boolean;
  syncWithSupabase: () => Promise<void>;
  pushAllToSupabase: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from LocalStorage or Fallback
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('isms_users');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('isms_current_user');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('isms_is_authenticated');
    return saved === 'true';
  });

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [sites] = useState<MiningSite[]>(INITIAL_SITES);

  const [smkpMaster, setSmkpMaster] = useState<SMKPElement[]>(() => {
    const saved = localStorage.getItem('isms_smkp_master');
    return saved ? JSON.parse(saved) : INITIAL_SMKP_MASTER;
  });

  const [isoMaster] = useState<ISOStandard[]>(() => {
    const saved = localStorage.getItem('isms_iso_master');
    return saved ? JSON.parse(saved) : INITIAL_ISO_STANDARDS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('isms_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [audits, setAudits] = useState<AuditItem[]>(() => {
    const saved = localStorage.getItem('isms_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [findings, setFindings] = useState<AuditFinding[]>(() => {
    const saved = localStorage.getItem('isms_findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('isms_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('isms_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState<boolean>(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('isms_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('isms_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('isms_smkp_master', JSON.stringify(smkpMaster));
  }, [smkpMaster]);

  useEffect(() => {
    localStorage.setItem('isms_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('isms_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('isms_findings', JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem('isms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('isms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit Log Helper
  const addAuditLog = (action: string, module: string, details: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formattedDate,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      module,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Permission Matrix Evaluation
  const hasPermission = (permission: string): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'USER') {
      const allowedForUser = [
        'view_documents',
        'download_documents',
        'create_document',
        'edit_own_document',
        'submit_document',
        'fill_audit_checklist',
        'upload_audit_evidence',
        'submit_car',
        'view_dashboard',
        'view_findings'
      ];
      return allowedForUser.includes(permission);
    }
    if (currentUser.role === 'VIEWER') {
      const allowedForViewer = [
        'view_documents',
        'download_documents',
        'view_dashboard',
        'view_findings',
        'view_audits'
      ];
      return allowedForViewer.includes(permission);
    }
    return false;
  };

  // Auth Operations
  const switchUserRole = (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role) || {
      ...currentUser,
      role
    };
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    localStorage.setItem('isms_is_authenticated', 'true');
    localStorage.setItem('isms_current_user', JSON.stringify(targetUser));
    addAuditLog('ROLE_SWITCH', 'Autentikasi & Sesi', `Berganti peran aktif ke ${role} (${targetUser.fullName})`);
  };

  const loginUser = (email: string, pass: string, rememberMe: boolean = true): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Email tidak ditemukan dalam sistem ISMS. Periksa kembali alamat email Anda.' };
    }
    if (!user.isActive) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh Administrator. Silakan hubungi Departemen SHE.' };
    }
    
    // Check password
    const validPassword = user.password || (user.role === 'ADMIN' ? 'admin123' : user.role === 'USER' ? 'user123' : 'viewer123');
    if (pass !== validPassword) {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali kata sandi Anda.' };
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updatedUser = { ...user, lastLogin: formattedDate };

    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setIsAuthenticated(true);
    localStorage.setItem('isms_is_authenticated', 'true');
    localStorage.setItem('isms_current_user', JSON.stringify(updatedUser));

    if (rememberMe) {
      localStorage.setItem('isms_saved_email', cleanEmail);
    } else {
      localStorage.removeItem('isms_saved_email');
    }

    addAuditLog('LOGIN_SUCCESS', 'Autentikasi & Sesi', `Pengguna ${user.fullName} (${user.role}) berhasil masuk ke sistem.`);
    return { success: true, message: 'Login berhasil.' };
  };

  const logout = () => {
    addAuditLog('LOGOUT', 'Autentikasi & Sesi', `Pengguna ${currentUser.fullName} keluar dari sistem.`);
    setIsAuthenticated(false);
    localStorage.removeItem('isms_is_authenticated');
  };

  const changeUserPassword = (userId: string, oldPass: string, newPass: string): { success: boolean; message: string } => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }
    const currentPass = user.password || (user.role === 'ADMIN' ? 'admin123' : user.role === 'USER' ? 'user123' : 'viewer123');
    if (oldPass !== currentPass) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan salah.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal harus 6 karakter.' };
    }

    const updatedUser = { ...user, password: newPass };
    setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('isms_current_user', JSON.stringify(updatedUser));
    }
    addAuditLog('PASSWORD_CHANGED', 'Profil Pengguna', `Pengguna ${user.fullName} berhasil memperbarui kata sandi.`);
    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  };

  const registerUser = (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    departmentId: string;
    siteId: string;
    position: string;
    phone: string;
  }): { success: boolean; message: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email sudah terdaftar dalam sistem ISMS.' };
    }
    if (data.password.length < 6) {
      return { success: false, message: 'Kata sandi minimal harus 6 karakter.' };
    }

    const dept = departments.find(d => d.id === data.departmentId);
    const site = sites.find(s => s.id === data.siteId);

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      password: data.password,
      fullName: data.fullName,
      role: data.role,
      departmentId: data.departmentId,
      departmentName: dept?.name || 'Safety, Health & Environment (SHE)',
      siteId: data.siteId,
      siteName: site?.name || 'Pit Sangatta Block North',
      position: data.position || 'Staff Pengawas Operasional Tambang',
      phone: data.phone || '+62 812-0000-0000',
      isActive: true,
      lastLogin: '-'
    };

    setAllUsers(prev => [...prev, newUser]);
    addAuditLog('USER_REGISTERED', 'Autentikasi & Sesi', `Pendaftaran akun baru: ${newUser.fullName} (${newUser.email})`);
    return { success: true, message: 'Pendaftaran berhasil! Silakan masuk dengan email dan kata sandi Anda.' };
  };

  const updateCurrentUserProfile = (data: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    addAuditLog('PROFILE_UPDATED', 'Profil Pengguna', `Memperbarui data profil: ${data.fullName || ''}`);
  };

  const toggleUserActiveStatus = (userId: string) => {
    if (currentUser.role !== 'ADMIN') return;
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = !u.isActive;
        addAuditLog('USER_STATUS_CHANGED', 'Manajemen Pengguna', `Mengubah status pengguna ${u.fullName} menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}`);
        return { ...u, isActive: nextStatus };
      }
      return u;
    }));
  };

  const addNewUser = (userData: Omit<UserProfile, 'id'>) => {
    if (currentUser.role !== 'ADMIN') return;
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`
    };
    setAllUsers(prev => [...prev, newUser]);
    addAuditLog('USER_CREATED', 'Manajemen Pengguna', `Menambahkan pengguna baru: ${newUser.fullName} (${newUser.role})`);
  };

  // Master SMKP criteria update
  const updateSMKPCriteria = (
    criteriaId: string, 
    updates: Partial<{ requirementText: string; expectedEvidence: string; verificationGuidance: string }>
  ) => {
    if (currentUser.role !== 'ADMIN') return;
    setSmkpMaster(prev => prev.map(el => ({
      ...el,
      subElements: el.subElements.map(sub => ({
        ...sub,
        criteria: sub.criteria.map(crit => crit.id === criteriaId ? { ...crit, ...updates } : crit)
      }))
    })));
    addAuditLog('SMKP_CRITERIA_UPDATED', 'Master SMKP Minerba', `Memperbarui kriteria SMKP ID: ${criteriaId}`);
  };

  // Document Operations
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newDocId = `doc-${Date.now()}`;
    const initialVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: docData.currentRevision || 'Rev.00',
      status: docData.status,
      releaseDate: docData.effectiveDate || now,
      changeSummary: docData.changeSummary || 'Penerbitan perdana',
      fileName: docData.fileName || `${docData.docNumber}.pdf`,
      fileSizeKb: docData.fileSizeKb || 1200,
      authorName: docData.authorName,
      createdAt: now
    };

    const newDoc: DocumentItem = {
      ...docData,
      id: newDocId,
      versions: [initialVersion],
      createdAt: `${now} 10:00`,
      updatedAt: `${now} 10:00`
    };

    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('DOCUMENT_CREATED', 'Database Dokumen', `Membuat dokumen baru ${newDoc.docNumber} - ${newDoc.title}`);
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return doc;
    }));
    addAuditLog('DOCUMENT_UPDATED', 'Database Dokumen', `Memperbarui dokumen ID ${id}`);
  };

  const deleteDocument = (id: string) => {
    if (currentUser.role !== 'ADMIN') return;
    const doc = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    addAuditLog('DOCUMENT_DELETED', 'Database Dokumen', `Menghapus dokumen ${doc?.docNumber || id}`);
  };

  const submitDocumentForReview = (id: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: 'Submitted' as DocumentStatus };
      }
      return doc;
    }));
    addAuditLog('DOCUMENT_SUBMITTED', 'Pengendalian Dokumen', `Mengajukan dokumen ID ${id} untuk review teknis`);
  };

  const approveDocument = (id: string, approverName: string) => {
    if (currentUser.role !== 'ADMIN') return;
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          status: 'Effective' as DocumentStatus,
          approverName,
          effectiveDate: new Date().toISOString().split('T')[0]
        };
      }
      return doc;
    }));
    addAuditLog('DOCUMENT_APPROVED', 'Pengendalian Dokumen', `Menyetujui dan mengaktifkan dokumen ID ${id} oleh ${approverName}`);
  };

  const rejectDocument = (id: string, comments: string) => {
    if (currentUser.role !== 'ADMIN') return;
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          status: 'Revision Required' as DocumentStatus,
          changeSummary: `Revisi Diperlukan: ${comments}`
        };
      }
      return doc;
    }));
    addAuditLog('DOCUMENT_REJECTED', 'Pengendalian Dokumen', `Mengembalikan dokumen ID ${id} untuk revisi. Catatan: ${comments}`);
  };

  const createDocumentRevision = (id: string, newRevNumber: string, changeSummary: string, fileName: string) => {
    const now = new Date().toISOString().split('T')[0];
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const newVersion = {
          id: `ver-${Date.now()}`,
          versionNumber: newRevNumber,
          status: 'Effective' as DocumentStatus,
          releaseDate: now,
          changeSummary,
          fileName: fileName || `${doc.docNumber}_${newRevNumber}.pdf`,
          fileSizeKb: 1500,
          authorName: currentUser.fullName,
          approverName: 'Direktur SHE & KTT',
          createdAt: now
        };

        const updatedVersions = doc.versions.map(v => ({
          ...v,
          status: 'Obsolete' as DocumentStatus
        }));

        return {
          ...doc,
          currentRevision: newRevNumber,
          changeSummary,
          status: 'Effective' as DocumentStatus,
          fileName: newVersion.fileName,
          versions: [...updatedVersions, newVersion],
          updatedAt: `${now} 10:00`
        };
      }
      return doc;
    }));
    addAuditLog('DOCUMENT_REVISED', 'Pengendalian Dokumen', `Menerbitkan revisi baru ${newRevNumber} untuk dokumen ID ${id}`);
  };

  const archiveDocument = (id: string) => {
    if (currentUser.role !== 'ADMIN') return;
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: 'Archived' as DocumentStatus };
      }
      return doc;
    }));
    addAuditLog('DOCUMENT_ARCHIVED', 'Database Dokumen', `Mengarsipkan dokumen ID ${id}`);
  };

  // Audits Operations
  const createAudit = (auditData: Omit<AuditItem, 'id' | 'createdAt' | 'checklists'>) => {
    if (currentUser.role !== 'ADMIN') return;
    // Automatically generate checklist from SMKP or ISO master based on selected type
    const newChecklists: AuditItem['checklists'] = [];

    if (auditData.auditType === 'SMKP Minerba' || auditData.auditType === 'Audit Terintegrasi') {
      smkpMaster.forEach(elem => {
        elem.subElements.forEach(sub => {
          sub.criteria.forEach(crit => {
            newChecklists.push({
              id: `chk-gen-${Date.now()}-${crit.code}`,
              auditId: '',
              standardType: 'SMKP',
              code: crit.code,
              requirementText: crit.requirementText,
              expectedEvidence: crit.expectedEvidence,
              resultStatus: 'Not Yet Verified'
            });
          });
        });
      });
    }

    if (auditData.auditType !== 'SMKP Minerba') {
      isoMaster.forEach(iso => {
        iso.clauses.forEach(clause => {
          clause.requirements.forEach(req => {
            newChecklists.push({
              id: `chk-iso-${Date.now()}-${req.subClauseCode}`,
              auditId: '',
              standardType: iso.type,
              code: req.subClauseCode,
              requirementText: req.verifiedSummary,
              expectedEvidence: req.expectedEvidence,
              resultStatus: 'Not Yet Verified'
            });
          });
        });
      });
    }

    const newAuditId = `audit-${Date.now()}`;
    const finalizedChecklists = newChecklists.map(c => ({ ...c, auditId: newAuditId }));

    const newAudit: AuditItem = {
      ...auditData,
      id: newAuditId,
      checklists: finalizedChecklists,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAudits(prev => [newAudit, ...prev]);
    addAuditLog('AUDIT_PROGRAM_CREATED', 'Program Audit', `Menjadwalkan audit baru ${newAudit.auditNumber} - ${newAudit.title}`);
  };

  const updateChecklistResult = (
    auditId: string, 
    checklistId: string, 
    status: ChecklistResult, 
    notes: string, 
    fieldObs: string, 
    naJust: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setAudits(prev => prev.map(audit => {
      if (audit.id === auditId) {
        const updatedChecklists = audit.checklists.map(chk => {
          if (chk.id === checklistId) {
            return {
              ...chk,
              resultStatus: status,
              auditorNotes: notes,
              fieldObservation: fieldObs,
              naJustification: naJust,
              verifiedBy: currentUser.fullName,
              verifiedAt: now
            };
          }
          return chk;
        });
        return {
          ...audit,
          checklists: updatedChecklists
        };
      }
      return audit;
    }));
    addAuditLog('CHECKLIST_ANSWERED', 'Audit SMKP & ISO', `Mengisi kriteria checklist ${checklistId} dengan hasil: ${status}`);
  };

  const updateAuditStatus = (auditId: string, status: AuditItem['status']) => {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, status } : a));
    addAuditLog('AUDIT_STATUS_CHANGED', 'Program Audit', `Mengubah status audit ${auditId} ke ${status}`);
  };

  // Findings & CAR Operations
  const createFinding = (findingData: Omit<AuditFinding, 'id' | 'createdAt' | 'findingNumber'>) => {
    const findingNumber = `NC-${findingData.standardType.includes('SMKP') ? 'SMKP' : 'ISO'}-${new Date().getFullYear()}-${String(findings.length + 1).padStart(3, '0')}`;
    const newFinding: AuditFinding = {
      ...findingData,
      id: `fnd-${Date.now()}`,
      findingNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setFindings(prev => [newFinding, ...prev]);
    addAuditLog('FINDING_CREATED', 'Temuan Audit', `Menerbitkan temuan baru ${newFinding.findingNumber}: ${newFinding.title}`);
  };

  const updateFindingStatus = (id: string, status: FindingStatus) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    addAuditLog('FINDING_STATUS_CHANGED', 'Temuan Audit', `Mengubah status temuan ID ${id} menjadi ${status}`);
  };

  const submitCAR = (
    findingId: string, 
    data: {
      rca: string;
      method: string;
      correction: string;
      actionPlan: string;
      preventive: string;
      evidenceDesc: string;
    }
  ) => {
    const now = new Date().toISOString().split('T')[0];
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          rootCauseAnalysis: data.rca,
          rcaMethod: data.method,
          immediateCorrection: data.correction,
          correctiveActionPlan: data.actionPlan,
          preventiveMeasure: data.preventive,
          evidenceDescription: data.evidenceDesc,
          submissionDate: now,
          status: 'Pending Verification' as FindingStatus
        };
      }
      return f;
    }));
    addAuditLog('CAR_SUBMITTED', 'Tindakan Perbaikan (CAPA)', `PIC mengajukan tindakan perbaikan untuk temuan ID ${findingId}`);
  };

  const verifyAndCloseFinding = (
    findingId: string, 
    data: {
      verifierName: string;
      notes: string;
      effectiveness: 'Efektif' | 'Tidak Efektif' | 'Perlu Tinjauan Ulang';
    }
  ) => {
    if (currentUser.role !== 'ADMIN') return;
    const now = new Date().toISOString().split('T')[0];
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const nextStatus = data.effectiveness === 'Efektif' ? 'Closed' : 'In Progress';
        return {
          ...f,
          verifierName: data.verifierName,
          verificationNotes: data.notes,
          effectivenessResult: data.effectiveness,
          closureDate: data.effectiveness === 'Efektif' ? now : undefined,
          status: nextStatus as FindingStatus
        };
      }
      return f;
    }));
    addAuditLog('CAR_VERIFIED', 'Tindakan Perbaikan (CAPA)', `Lead Auditor memverifikasi temuan ID ${findingId}. Hasil: ${data.effectiveness}`);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Excel Export Operations
  const exportDocumentsToExcel = () => {
    const dataForExport = documents.map(doc => ({
      'Nomor Dokumen': doc.docNumber,
      'Judul Dokumen': doc.title,
      'Kategori': doc.category,
      'Departemen': doc.departmentName,
      'Site / Lokasi': doc.siteName,
      'Revisi': doc.currentRevision,
      'Status': doc.status,
      'Kerahasiaan': doc.confidentiality,
      'Tanggal Berlaku': doc.effectiveDate,
      'Masa Review': doc.reviewDueDate,
      'Penyusun': doc.authorName,
      'Pemeriksa': doc.reviewerName,
      'Penyetuju': doc.approverName,
      'Elemen SMKP': doc.mappedSMKPElements.join(', '),
      'Klausul ISO': doc.mappedISOClauses.join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Dokumen ISMS');
    XLSX.writeFile(workbook, `ISMS_Daftar_Dokumen_${new Date().toISOString().split('T')[0]}.xlsx`);
    addAuditLog('EXCEL_EXPORT', 'Database Dokumen', 'Mengekspor daftar seluruh dokumen ke format Excel');
  };

  const exportAuditReportToExcel = (auditId: string) => {
    const audit = audits.find(a => a.id === auditId);
    if (!audit) return;

    const dataForExport = audit.checklists.map(c => ({
      'Standar': c.standardType,
      'Kode Kriteria': c.code,
      'Persyaratan': c.requirementText,
      'Bukti Objektif yang Diharapkan': c.expectedEvidence,
      'Status Hasil': c.resultStatus,
      'Catatan Auditor': c.auditorNotes || '-',
      'Observasi Lapangan': c.fieldObservation || '-',
      'Justifikasi N/A': c.naJustification || '-',
      'Verifikator': c.verifiedBy || '-',
      'Tanggal Verifikasi': c.verifiedAt || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist Audit');
    XLSX.writeFile(workbook, `Laporan_${audit.auditNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
    addAuditLog('EXCEL_EXPORT', 'Program Audit', `Mengekspor checklist audit ${audit.auditNumber} ke Excel`);
  };

  const exportFindingsToExcel = () => {
    const dataForExport = findings.map(f => ({
      'Nomor Temuan': f.findingNumber,
      'Nomor Audit': f.auditNumber,
      'Standar': f.standardType,
      'Klausul / Elemen': f.clauseOrElement,
      'Judul Temuan': f.title,
      'Kondisi Aktual': f.conditionDescription,
      'Kriteria Regulasi': f.criteriaRequirement,
      'Kategori': f.category,
      'Tingkat Risiko': f.riskLevel,
      'Status': f.status,
      'PIC': f.picName,
      'Batas Waktu': f.dueDate,
      'Akar Masalah (RCA)': f.rootCauseAnalysis || '-',
      'Tindakan Koreksi': f.immediateCorrection || '-',
      'Rencana Perbaikan': f.correctiveActionPlan || '-',
      'Hasil Verifikasi': f.effectivenessResult || '-',
      'Tanggal Tutup': f.closureDate || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi Temuan CAR');
    XLSX.writeFile(workbook, `ISMS_Rekap_Temuan_${new Date().toISOString().split('T')[0]}.xlsx`);
    addAuditLog('EXCEL_EXPORT', 'Temuan & CAR', 'Mengekspor seluruh rekap temuan dan corrective action ke Excel');
  };

  const importMasterFromExcel = (
    type: 'documents' | 'smkp' | 'iso', 
    jsonData: any[]
  ): { success: boolean; count: number; error?: string } => {
    try {
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return { success: false, count: 0, error: 'File Excel kosong atau format tidak sesuai.' };
      }

      if (type === 'documents') {
        let importedCount = 0;
        const newDocs: DocumentItem[] = [];

        jsonData.forEach((row, idx) => {
          if (row['Nomor Dokumen'] || row.docNumber) {
            const docNum = row['Nomor Dokumen'] || row.docNumber;
            // Prevent duplicate
            if (!documents.some(d => d.docNumber === docNum) && !newDocs.some(d => d.docNumber === docNum)) {
              newDocs.push({
                id: `doc-imp-${Date.now()}-${idx}`,
                docNumber: docNum,
                title: row['Judul Dokumen'] || row.title || 'Dokumen Tanpa Judul',
                category: (row['Kategori'] || row.category || 'SOP') as any,
                departmentId: 'dept-1',
                departmentName: row['Departemen'] || 'Safety, Health & Environment (SHE)',
                siteId: 'site-1',
                siteName: row['Site'] || 'Pit Sangatta Block North',
                businessProcess: row['Proses Bisnis'] || 'Operasional Tambang',
                sheAspectRisk: row['Risiko SHE'] || 'Pengendalian Risiko Operasional Tambang',
                currentRevision: row['Revisi'] || 'Rev.00',
                status: (row['Status'] || 'Effective') as DocumentStatus,
                confidentiality: 'Internal',
                effectiveDate: row['Tanggal Berlaku'] || new Date().toISOString().split('T')[0],
                reviewDueDate: '2027-12-31',
                createdBy: currentUser.id,
                authorName: currentUser.fullName,
                reviewerName: 'Lead SHE',
                approverName: 'KTT',
                fileName: `${docNum}.pdf`,
                fileSizeKb: 1024,
                changeSummary: 'Diimpor dari file Excel eksternal',
                versions: [{
                  id: `v-imp-${idx}`,
                  versionNumber: row['Revisi'] || 'Rev.00',
                  status: 'Effective',
                  releaseDate: new Date().toISOString().split('T')[0],
                  changeSummary: 'Import perdana',
                  fileName: `${docNum}.pdf`,
                  fileSizeKb: 1024,
                  authorName: currentUser.fullName,
                  createdAt: new Date().toISOString().split('T')[0]
                }],
                mappedSMKPElements: ['IV.1'],
                mappedISOClauses: ['iso45001-c8'],
                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
              });
              importedCount++;
            }
          }
        });

        if (newDocs.length > 0) {
          setDocuments(prev => [...prev, ...newDocs]);
          addAuditLog('EXCEL_IMPORT', 'Database Dokumen', `Berhasil mengimpor ${importedCount} dokumen dari Excel`);
          return { success: true, count: importedCount };
        } else {
          return { success: false, count: 0, error: 'Semua dokumen di dalam file Excel sudah terdaftar atau format kolom tidak cocok.' };
        }
      }

      return { success: true, count: jsonData.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Gagal memproses data Excel.' };
    }
  };

  // Initial Supabase check and background sync
  useEffect(() => {
    checkSupabaseConnection().then(status => {
      setSupabaseStatus(status);
      if (status.connected && status.tablesStatus?.documents) {
        syncWithSupabase().catch(() => {});
      }
    });
  }, []);

  const syncWithSupabase = async () => {
    setIsSyncingWithSupabase(true);
    try {
      // 1. Fetch documents
      const { data: remoteDocs, error: docErr } = await supabase.from('documents').select('*');
      if (!docErr && remoteDocs && remoteDocs.length > 0) {
        setDocuments(prev => {
          const map = new Map(prev.map(d => [d.docNumber, d]));
          remoteDocs.forEach((rd: any) => {
            const existing = map.get(rd.doc_number);
            const docItem: DocumentItem = {
              id: rd.id || `doc-${Date.now()}`,
              docNumber: rd.doc_number,
              title: rd.title,
              category: rd.category_id || 'SOP',
              departmentId: 'dept-1',
              departmentName: rd.department_name || 'Safety, Health & Environment (SHE)',
              siteId: 'site-1',
              siteName: rd.site_name || 'Pit Sangatta Block North',
              businessProcess: rd.business_process || 'Operasional Tambang',
              sheAspectRisk: rd.she_aspect_risk || 'Mitigasi Risiko SHE',
              currentRevision: rd.current_revision || 'Rev.00',
              status: rd.status || 'Effective',
              confidentiality: rd.confidentiality || 'Internal',
              effectiveDate: rd.effective_date || new Date().toISOString().split('T')[0],
              reviewDueDate: rd.review_due_date || '2027-12-31',
              createdBy: 'user-admin',
              authorName: rd.author_name || 'Lead SHE',
              reviewerName: 'Mine Supt',
              approverName: rd.approver_name || 'KTT',
              fileName: rd.file_name || `${rd.doc_number}.pdf`,
              fileSizeKb: rd.file_size_kb || 1200,
              changeSummary: rd.change_summary || 'Penerbitan dokumen',
              versions: existing?.versions || [{
                id: `ver-${Date.now()}`,
                versionNumber: rd.current_revision || 'Rev.00',
                status: rd.status || 'Effective',
                releaseDate: rd.effective_date || new Date().toISOString().split('T')[0],
                changeSummary: rd.change_summary || 'Penerbitan dokumen',
                fileName: rd.file_name || `${rd.doc_number}.pdf`,
                fileSizeKb: 1200,
                authorName: rd.author_name || 'Lead SHE',
                createdAt: new Date().toISOString().split('T')[0]
              }],
              mappedSMKPElements: existing?.mappedSMKPElements || ['IV.1'],
              mappedISOClauses: existing?.mappedISOClauses || ['iso45001-c8'],
              createdAt: rd.created_at || new Date().toISOString(),
              updatedAt: rd.updated_at || new Date().toISOString()
            };
            map.set(rd.doc_number, docItem);
          });
          return Array.from(map.values());
        });
      }

      // 2. Fetch findings
      const { data: remoteFindings, error: fndErr } = await supabase.from('audit_findings').select('*');
      if (!fndErr && remoteFindings && remoteFindings.length > 0) {
        setFindings(prev => {
          const map = new Map(prev.map(f => [f.findingNumber, f]));
          remoteFindings.forEach((rf: any) => {
            const findingItem: AuditFinding = {
              id: rf.id || `fnd-${Date.now()}`,
              findingNumber: rf.finding_number,
              auditId: 'audit-001',
              auditNumber: rf.audit_number || 'AUD-SMKP-2026-001',
              standardType: rf.standard_type || 'SMKP Minerba',
              clauseOrElement: rf.clause_or_element || 'Elemen IV.1',
              title: rf.title,
              conditionDescription: rf.condition_description,
              criteriaRequirement: rf.criteria_requirement,
              objectiveEvidence: rf.objective_evidence,
              category: rf.category || 'Major Nonconformity',
              riskLevel: rf.risk_level || 'Sedang',
              status: rf.status || 'Open',
              picId: 'user-op',
              picName: rf.pic_name || 'Bambang Kusuma, S.T.',
              departmentName: 'Mining Operations & Engineering',
              dueDate: rf.due_date || '2026-11-15',
              createdBy: 'Lead Auditor',
              createdAt: rf.created_at || new Date().toISOString(),
              rootCauseAnalysis: rf.root_cause_analysis,
              immediateCorrection: rf.immediate_correction,
              correctiveActionPlan: rf.corrective_action_plan,
              preventiveMeasure: rf.preventive_measure,
              effectivenessResult: rf.effectiveness_result,
              closureDate: rf.closure_date
            };
            map.set(rf.finding_number, findingItem);
          });
          return Array.from(map.values());
        });
      }

      // 3. Fetch profiles
      const { data: remoteProfiles, error: profErr } = await supabase.from('profiles').select('*');
      if (!profErr && remoteProfiles && remoteProfiles.length > 0) {
        setAllUsers(prev => {
          const map = new Map(prev.map(u => [u.email.toLowerCase(), u]));
          remoteProfiles.forEach((rp: any) => {
            map.set(rp.email.toLowerCase(), {
              id: rp.id,
              email: rp.email,
              password: rp.password_hash || 'user123',
              fullName: rp.full_name,
              role: rp.role || 'USER',
              departmentId: 'dept-1',
              departmentName: 'Safety, Health & Environment (SHE)',
              siteId: 'site-1',
              siteName: 'Pit Sangatta Block North',
              position: rp.position || 'Pengawas Tambang (POP)',
              phone: rp.phone || '+62 812-0000-0000',
              isActive: rp.is_active !== false,
              lastLogin: '-'
            });
          });
          return Array.from(map.values());
        });
      }

      addAuditLog('SUPABASE_SYNC', 'Database Cloud', 'Sinkronisasi data dengan Supabase PostgreSQL berhasil.');
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  const pushAllToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncingWithSupabase(true);
    try {
      // Push documents
      const docsToPush = documents.map(d => ({
        doc_number: d.docNumber,
        title: d.title,
        category_id: d.category,
        department_name: d.departmentName,
        site_name: d.siteName,
        business_process: d.businessProcess,
        she_aspect_risk: d.sheAspectRisk,
        current_revision: d.currentRevision,
        status: d.status,
        confidentiality: d.confidentiality,
        effective_date: d.effectiveDate,
        review_due_date: d.reviewDueDate,
        author_name: d.authorName,
        approver_name: d.approverName,
        file_name: d.fileName,
        file_size_kb: d.fileSizeKb,
        change_summary: d.changeSummary
      }));

      const { error: docErr } = await supabase.from('documents').upsert(docsToPush, { onConflict: 'doc_number' });

      // Push findings
      const findingsToPush = findings.map(f => ({
        finding_number: f.findingNumber,
        audit_number: f.auditNumber,
        standard_type: f.standardType,
        clause_or_element: f.clauseOrElement,
        title: f.title,
        condition_description: f.conditionDescription,
        criteria_requirement: f.criteriaRequirement,
        objective_evidence: f.objectiveEvidence,
        category: f.category,
        risk_level: f.riskLevel,
        status: f.status,
        pic_name: f.picName,
        due_date: f.dueDate,
        root_cause_analysis: f.rootCauseAnalysis,
        immediate_correction: f.immediateCorrection,
        corrective_action_plan: f.correctiveActionPlan,
        preventive_measure: f.preventiveMeasure,
        effectiveness_result: f.effectivenessResult,
        closure_date: f.closureDate
      }));

      const { error: fndErr } = await supabase.from('audit_findings').upsert(findingsToPush, { onConflict: 'finding_number' });

      // Push profiles
      const profilesToPush = allUsers.map(u => ({
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        position: u.position,
        phone: u.phone,
        is_active: u.isActive,
        password_hash: u.password
      }));

      const { error: profErr } = await supabase.from('profiles').upsert(profilesToPush, { onConflict: 'email' });

      if (docErr && docErr.code === '42P01') {
        return {
          success: false,
          message: 'Tabel database Supabase belum dibuat. Harap salin dan jalankan script SQL Migration terlebih dahulu di Supabase SQL Editor.'
        };
      }

      addAuditLog('SUPABASE_PUSH', 'Database Cloud', `Berhasil mengekspor ${documents.length} dokumen & ${findings.length} temuan ke Supabase`);
      return { success: true, message: `Berhasil mengekspor ${documents.length} dokumen, ${findings.length} temuan, dan ${allUsers.length} pengguna ke Supabase!` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengirim data ke Supabase.' };
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setAllUsers(INITIAL_PROFILES);
    setCurrentUser(INITIAL_PROFILES[0]);
    setSmkpMaster(INITIAL_SMKP_MASTER);
    setDocuments(INITIAL_DOCUMENTS);
    setAudits(INITIAL_AUDITS);
    setFindings(INITIAL_FINDINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    addAuditLog('DATA_RESET', 'Sistem & Konfigurasi', 'Mengembalikan database aplikasi ke data master terverifikasi awal');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        switchUserRole,
        loginUser,
        logout,
        updateCurrentUserProfile,
        changeUserPassword,
        registerUser,
        toggleUserActiveStatus,
        addNewUser,
        hasPermission,
        departments,
        sites,
        smkpMaster,
        isoMaster,
        updateSMKPCriteria,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        submitDocumentForReview,
        approveDocument,
        rejectDocument,
        createDocumentRevision,
        archiveDocument,
        audits,
        createAudit,
        updateChecklistResult,
        updateAuditStatus,
        findings,
        createFinding,
        updateFindingStatus,
        submitCAR,
        verifyAndCloseFinding,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        auditLogs,
        addAuditLog,
        selectedSiteFilter,
        setSelectedSiteFilter,
        selectedDeptFilter,
        setSelectedDeptFilter,
        exportDocumentsToExcel,
        exportAuditReportToExcel,
        exportFindingsToExcel,
        importMasterFromExcel,
        resetToDemoData,
        supabaseStatus,
        isSyncingWithSupabase,
        syncWithSupabase,
        pushAllToSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

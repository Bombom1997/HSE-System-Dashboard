-- ==============================================================================
-- ISMS: INTEGRATED SHE MANAGEMENT SYSTEM (SOP & AUDIT SMKP MINERBA + ISO)
-- Complete Database Schema for Supabase (PostgreSQL 15+)
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 0. ENABLE REQUIRED EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ROLES & PERMISSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (id, name, description) VALUES
('ADMIN', 'SHE Administrator & Lead Auditor', 'Akses penuh administrasi master, user, approval dokumen, verifikasi temuan, dan konfigurasi sistem'),
('USER', 'Operational / Document Owner / Auditor', 'Pengguna operasional, pemilik dokumen SOP, pengunggah bukti perbaikan, dan pengisi checklist'),
('VIEWER', 'Auditee / Viewer / Management', 'Akses lihat dokumen berlaku, ringkasan dashboard, dan progres temuan tanpa hak modifikasi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

CREATE TABLE IF NOT EXISTS public.permissions (
    id VARCHAR(80) PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id VARCHAR(30) REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(80) REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ==============================================================================
-- 2. DEPARTMENTS & MINING SITES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    head_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. USER PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL REFERENCES public.roles(id) DEFAULT 'USER',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    position VARCHAR(100),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional Supabase Auth trigger: sync auth.users to public.profiles if using Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe trigger creation for auth.users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ==============================================================================
-- 4. DOCUMENT CATEGORIES & MASTER HIERARCHY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.document_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code_prefix VARCHAR(20) NOT NULL,
    description TEXT
);

INSERT INTO public.document_categories (id, name, code_prefix, description) VALUES
('SOP', 'Standar Operasional Prosedur', 'SOP', 'Prosedur operasional terperinci'),
('STD', 'Standar Parameter', 'STD', 'Standar teknis, limit ambang batas lingkungan & keselamatan'),
('IK', 'Instruksi Kerja', 'IK', 'Panduan teknis langkah demi langkah pekerjaan spesifik'),
('JSA', 'Job Safety Analysis / JHA', 'JSA', 'Analisis keselamatan pekerjaan dan mitigasi bahaya'),
('FORM', 'Formulir Standar', 'FRM', 'Formulir inspeksi, izin kerja, dan pelaporan'),
('REC', 'Rekaman & Catatan', 'REC', 'Bukti pelaksanaan kegiatan K3L dan operasional'),
('POL', 'Kebijakan SHE', 'POL', 'Kebijakan K3, Lingkungan, dan Mutu Direksi'),
('PED', 'Pedoman & Manual', 'PED', 'Manual SMKP Minerba dan ISO Terintegrasi'),
('REG', 'Dokumen Regulasi & Eksternal', 'REG', 'Undang-undang, Kepdirjen 185, Permen ESDM, Standar ISO')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. DOCUMENTS, REVISIONS & APPROVALS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_number VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES public.document_categories(id),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    business_process VARCHAR(150),
    she_aspect_risk TEXT,
    current_revision VARCHAR(20) DEFAULT 'Rev.00',
    status VARCHAR(40) NOT NULL DEFAULT 'Draft', -- Draft, Submitted, Under Review, Pending Approval, Effective, Obsolete, Archived
    confidentiality VARCHAR(30) DEFAULT 'Internal', -- Public, Internal, Confidential, Restricted
    effective_date DATE,
    review_due_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size_kb INT,
    change_summary TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    revision_number VARCHAR(20) NOT NULL,
    status VARCHAR(40) NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    change_summary TEXT,
    effective_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    step_name VARCHAR(50) NOT NULL, -- Review, Technical Approval, Final Approval
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Revision Required
    comments TEXT,
    action_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. SMKP MINERBA (KEPDIRJEN 185.K/37.04/DJB/2019)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.smkp_elements (
    id INT PRIMARY KEY,
    number_roman VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    weight_percentage NUMERIC(5,2) DEFAULT 0.00,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.smkp_subelements (
    id VARCHAR(20) PRIMARY KEY,
    element_id INT REFERENCES public.smkp_elements(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.smkp_criteria (
    id VARCHAR(30) PRIMARY KEY,
    subelement_id VARCHAR(20) REFERENCES public.smkp_subelements(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    requirement_text TEXT NOT NULL,
    regulatory_reference VARCHAR(255),
    expected_evidence TEXT,
    verification_guidance TEXT,
    source_reference VARCHAR(255) DEFAULT 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019'
);

-- ==============================================================================
-- 7. ISO INTEGRATED MASTER (9001:2015, 14001:2015, 45001:2018)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.iso_standards (
    id VARCHAR(30) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    edition VARCHAR(30) NOT NULL,
    description TEXT
);

INSERT INTO public.iso_standards (id, code, name, edition, description) VALUES
('ISO9001', 'ISO 9001:2015', 'Sistem Manajemen Mutu (Quality Management System)', '2015', 'Klausul 4 s/d 10 untuk keunggulan operasional & kepuasan pelanggan'),
('ISO14001', 'ISO 14001:2015', 'Sistem Manajemen Lingkungan (Environmental Management System)', '2015', 'Klausul 4 s/d 10 untuk pencegahan pencemaran dan kelestarian hayati tambang'),
('ISO45001', 'ISO 45001:2018', 'Sistem Manajemen K3 (Occupational Health & Safety)', '2018', 'Klausul 4 s/d 10 untuk pencegahan insiden kerja dan partisipasi pekerja')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.iso_clauses (
    id VARCHAR(40) PRIMARY KEY,
    standard_id VARCHAR(30) REFERENCES public.iso_standards(id) ON DELETE CASCADE,
    clause_number VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.iso_requirements (
    id VARCHAR(50) PRIMARY KEY,
    clause_id VARCHAR(40) REFERENCES public.iso_clauses(id) ON DELETE CASCADE,
    subclause_code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    verified_summary TEXT NOT NULL,
    expected_evidence TEXT,
    source_reference VARCHAR(255)
);

-- ==============================================================================
-- 8. DOCUMENT REQUIREMENT MAPPINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.document_requirement_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    standard_type VARCHAR(30) NOT NULL, -- SMKP, ISO9001, ISO14001, ISO45001, REGULATION
    requirement_id VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (document_id, standard_type, requirement_id)
);

-- ==============================================================================
-- 9. AUDITS, CHECKLISTS & EVIDENCE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_number VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    audit_type VARCHAR(50) NOT NULL, -- SMKP, ISO9001, ISO14001, ISO45001, INTEGRATED
    standards_applied TEXT[] NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    audit_date_start DATE NOT NULL,
    audit_date_end DATE NOT NULL,
    lead_auditor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    auditee_pic_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scope TEXT NOT NULL,
    objective TEXT NOT NULL,
    status VARCHAR(40) DEFAULT 'Draft', -- Draft, Scheduled, In Progress, Reporting, Completed, Closed
    total_criteria INT DEFAULT 0,
    compliant_count INT DEFAULT 0,
    noncompliant_count INT DEFAULT 0,
    partial_count INT DEFAULT 0,
    na_count INT DEFAULT 0,
    unverified_count INT DEFAULT 0,
    achievement_percentage NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- Lead Auditor, Auditor, Technical Expert, Observer
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    standard_type VARCHAR(30) NOT NULL,
    requirement_code VARCHAR(50) NOT NULL,
    requirement_text TEXT NOT NULL,
    expected_evidence TEXT,
    document_ref_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    result_status VARCHAR(30) DEFAULT 'Not Yet Verified', -- Compliant, Noncompliant, Partial Compliance, Not Applicable, Not Yet Verified
    na_justification TEXT,
    auditor_notes TEXT,
    interviewee_notes TEXT,
    field_observation TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.audit_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.audit_checklists(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. AUDIT FINDINGS & CORRECTIVE ACTIONS (CAPA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_number VARCHAR(80) UNIQUE NOT NULL,
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES public.audit_checklists(id) ON DELETE SET NULL,
    standard_type VARCHAR(30) NOT NULL,
    clause_or_element VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    condition_description TEXT NOT NULL,
    criteria_requirement TEXT NOT NULL,
    objective_evidence TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- Major Nonconformity, Minor Nonconformity, Observation, Opportunity for Improvement (OFI)
    risk_level VARCHAR(30) DEFAULT 'Medium', -- High, Medium, Low
    status VARCHAR(40) DEFAULT 'Open', -- Open, Assigned, In Progress, Pending Verification, Rejected, Closed, Overdue
    pic_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.corrective_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID REFERENCES public.audit_findings(id) ON DELETE CASCADE,
    root_cause_analysis TEXT NOT NULL,
    rca_method VARCHAR(50) DEFAULT '5-Why / Fishbone',
    immediate_correction TEXT NOT NULL,
    corrective_action_plan TEXT NOT NULL,
    preventive_measure TEXT,
    implementation_date DATE,
    evidence_description TEXT,
    evidence_file_url TEXT,
    verifier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_notes TEXT,
    effectiveness_result VARCHAR(50), -- Effective, Ineffective, Need Re-evaluation
    closure_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. AUDIT LOGS, NOTIFICATIONS & SYSTEM SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    user_role VARCHAR(30),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) DEFAULT 'info', -- info, warning, danger, success
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_dept ON public.documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_site ON public.documents(site_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_audits_status ON public.audits(status);
CREATE INDEX IF NOT EXISTS idx_findings_status ON public.audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_category ON public.audit_findings(category);
CREATE INDEX IF NOT EXISTS idx_findings_audit ON public.audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated or public can read; users edit self or admin edits all
CREATE POLICY "Allow read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow user or admin update profile" ON public.profiles FOR UPDATE USING (
    id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Documents: Public/Viewers can view Effective/Approved; Admin & Owners can view/edit
CREATE POLICY "Allow view active documents" ON public.documents FOR SELECT USING (
    is_deleted = false AND (
        status IN ('Approved', 'Effective')
        OR created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    )
);
CREATE POLICY "Allow create documents" ON public.documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'USER'))
);
CREATE POLICY "Allow edit documents" ON public.documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'ADMIN' OR created_by = auth.uid()))
);

-- Findings: Anyone in org can view; Admin and PIC can update
CREATE POLICY "Allow read findings" ON public.audit_findings FOR SELECT USING (true);
CREATE POLICY "Allow insert findings" ON public.audit_findings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'USER'))
);
CREATE POLICY "Allow update findings" ON public.audit_findings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'ADMIN' OR pic_id = auth.uid()))
);

-- Corrective actions
CREATE POLICY "Allow read CAR" ON public.corrective_actions FOR SELECT USING (true);
CREATE POLICY "Allow update CAR" ON public.corrective_actions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'USER'))
);

-- Notifications: Only owner can view and mark read
CREATE POLICY "User own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- Audit logs: Insert allowed, Read allowed for admin
CREATE POLICY "Audit logs insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Audit logs select admin" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- ==============================================================================
-- 14. SEED INITIAL MASTER DATA
-- ==============================================================================
-- Departments
INSERT INTO public.departments (id, code, name, head_name) VALUES
('d1111111-1111-1111-1111-111111111111', 'SHE', 'Safety, Health & Environment', 'Ir. Hendra Wijaya, IPM'),
('d2222222-2222-2222-2222-222222222222', 'MINE', 'Mining Operation & Engineering', 'Bambang Kusuma, S.T.'),
('d3333333-3333-3333-3333-333333333333', 'PLANT', 'Coal Processing & Plant', 'Dedi Gunawan, S.T.'),
('d4444444-4444-4444-4444-444444444444', 'MAINT', 'Plant & Heavy Equipment Maintenance', 'Rudi Hartono, M.T.'),
('d5555555-5555-5555-5555-555555555555', 'LOG', 'Supply Chain, Warehouse & Logistics', 'Ratna Sari, S.E.')
ON CONFLICT (code) DO NOTHING;

-- Sites
INSERT INTO public.sites (id, code, name, location) VALUES
('s1111111-1111-1111-1111-111111111111', 'SITE-KALTIM', 'Pit Sangatta Block North', 'Kutai Timur, Kalimantan Timur'),
('s2222222-2222-2222-2222-222222222222', 'SITE-KALSEL', 'Pit Batulicin Coal Mining', 'Tanah Bumbu, Kalimantan Selatan'),
('s3333333-3333-3333-3333-333333333333', 'HO-JKT', 'Head Office Jakarta', 'Kuningan, Jakarta Selatan')
ON CONFLICT (code) DO NOTHING;

-- SMKP 7 Elements (Kepdirjen Minerba 185.K/37.04/DJB/2019)
INSERT INTO public.smkp_elements (id, number_roman, title, weight_percentage, description) VALUES
(1, 'I', 'Kebijakan', 5.00, 'Penyusunan, penetapan, komunikasi, dan peninjauan kebijakan keselamatan pertambangan'),
(2, 'II', 'Perencanaan', 15.00, 'Penelaahan awal, IBPR (Manajemen Risiko), kepatuhan regulasi, sasaran & program kerja'),
(3, 'III', 'Organisasi dan Personel', 15.00, 'Struktur KTT, PJO, Pengawas Operasional (POP/POM/POU), Komite KP, kompetensi & pelatihan'),
(4, 'IV', 'Implementasi', 35.00, 'Pelaksanaan operasional, SPI, JSA, izin kerja khusus, K3, KO, pengelolaan lingkungan, ERP'),
(5, 'V', 'Pemantauan, Evaluasi, dan Tindak Lanjut', 15.00, 'Inspeksi terencana, audit internal SMKP, investigasi insiden, kalibrasi, evaluasi kepatuhan hukum'),
(6, 'VI', 'Dokumentasi', 5.00, 'Pengendalian manual, SOP, IK, standar parameter, formulir, rekaman K3, dan retensi arsip'),
(7, 'VII', 'Tinjauan Manajemen dan Peningkatan Kinerja', 10.00, 'Rapat tinjauan manajemen (RTM) berkala, evaluasi efektivitas SMKP, dan continual improvement')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ISMS: Integrated SHE Management System (SOP & Audit SMKP Minerba + ISO)
-- PostgreSQL Schema & Row Level Security (RLS) Migrations
-- Compatible with Supabase / Standard PostgreSQL 14+
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
('ADMIN', 'SHE Administrator & Lead Auditor', 'Akses penuh administrasi master, user, approval dokumen, verifikasi temuan, dan konfigurasi sistem'),
('USER', 'Operational / Document Owner / Auditor', 'Pengguna operasional, pemilik dokumen SOP, pengunggah bukti perbaikan, dan pengisi checklist'),
('VIEWER', 'Auditee / Viewer / Management', 'Akses lihat dokumen berlaku, ringkasan dashboard, dan progres temuan tanpa hak modifikasi')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(80) PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(30) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(80) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. DEPARTMENTS & SITES
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    head_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL REFERENCES roles(id) DEFAULT 'USER',
    department_id UUID REFERENCES departments(id),
    site_id UUID REFERENCES sites(id),
    position VARCHAR(100),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENT CATEGORIES & MASTER
CREATE TABLE IF NOT EXISTS document_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code_prefix VARCHAR(20) NOT NULL,
    description TEXT
);

INSERT INTO document_categories (id, name, code_prefix, description) VALUES
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

-- 5. DOCUMENTS & VERSIONS
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_number VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES document_categories(id),
    department_id UUID REFERENCES departments(id),
    site_id UUID REFERENCES sites(id),
    business_process VARCHAR(150),
    she_aspect_risk TEXT,
    current_revision VARCHAR(20) DEFAULT 'Rev.00',
    status VARCHAR(40) NOT NULL DEFAULT 'Draft',
    confidentiality VARCHAR(30) DEFAULT 'Internal', -- Public, Internal, Confidential, Restricted
    effective_date DATE,
    review_due_date DATE,
    created_by UUID REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size_kb INT,
    change_summary TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    revision_number VARCHAR(20) NOT NULL,
    status VARCHAR(40) NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    change_summary TEXT,
    effective_date DATE,
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES profiles(id),
    step_name VARCHAR(50) NOT NULL, -- Review, Technical Approval, Final Approval
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Revision Required
    comments TEXT,
    action_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SMKP MINERBA MASTER (KEPDIRJEN 185.K/37.04/DJB/2019)
CREATE TABLE IF NOT EXISTS smkp_elements (
    id INT PRIMARY KEY,
    number_roman VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    weight_percentage NUMERIC(5,2) DEFAULT 0.00,
    description TEXT
);

CREATE TABLE IF NOT EXISTS smkp_subelements (
    id VARCHAR(20) PRIMARY KEY,
    element_id INT REFERENCES smkp_elements(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS smkp_criteria (
    id VARCHAR(30) PRIMARY KEY,
    subelement_id VARCHAR(20) REFERENCES smkp_subelements(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    requirement_text TEXT NOT NULL,
    regulatory_reference VARCHAR(255),
    expected_evidence TEXT,
    verification_guidance TEXT,
    source_reference VARCHAR(255) DEFAULT 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I/II'
);

-- 7. ISO INTEGRATED MASTER (ISO 9001, 14001, 45001)
CREATE TABLE IF NOT EXISTS iso_standards (
    id VARCHAR(30) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    edition VARCHAR(30) NOT NULL,
    description TEXT
);

INSERT INTO iso_standards (id, code, name, edition, description) VALUES
('ISO9001', 'ISO 9001:2015', 'Sistem Manajemen Mutu (Quality Management System)', '2015', 'Klausul 4 s/d 10 untuk keunggulan operasional & kepuasan pelanggan'),
('ISO14001', 'ISO 14001:2015', 'Sistem Manajemen Lingkungan (Environmental Management System)', '2015', 'Klausul 4 s/d 10 untuk pencegahan pencemaran dan kelestarian hayati tambang'),
('ISO45001', 'ISO 45001:2018', 'Sistem Manajemen K3 (Occupational Health & Safety)', '2018', 'Klausul 4 s/d 10 untuk pencegahan insiden kerja dan partisipasi pekerja')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS iso_clauses (
    id VARCHAR(40) PRIMARY KEY,
    standard_id VARCHAR(30) REFERENCES iso_standards(id) ON DELETE CASCADE,
    clause_number VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS iso_requirements (
    id VARCHAR(50) PRIMARY KEY,
    clause_id VARCHAR(40) REFERENCES iso_clauses(id) ON DELETE CASCADE,
    subclause_code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    verified_summary TEXT NOT NULL,
    expected_evidence TEXT,
    source_reference VARCHAR(255)
);

-- 8. DOCUMENT REQUIREMENT MAPPINGS
CREATE TABLE IF NOT EXISTS document_requirement_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    standard_type VARCHAR(30) NOT NULL, -- SMKP, ISO9001, ISO14001, ISO45001, REGULATION
    requirement_id VARCHAR(50) NOT NULL, -- smkp_criteria.id or iso_requirements.id
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (document_id, standard_type, requirement_id)
);

-- 9. AUDITS & AUDIT CHECKLIST
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_number VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    audit_type VARCHAR(50) NOT NULL, -- SMKP, ISO9001, ISO14001, ISO45001, INTEGRATED
    standards_applied TEXT[] NOT NULL,
    department_id UUID REFERENCES departments(id),
    site_id UUID REFERENCES sites(id),
    audit_date_start DATE NOT NULL,
    audit_date_end DATE NOT NULL,
    lead_auditor_id UUID REFERENCES profiles(id),
    auditee_pic_id UUID REFERENCES profiles(id),
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

CREATE TABLE IF NOT EXISTS audit_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role VARCHAR(50) NOT NULL, -- Lead Auditor, Auditor, Technical Expert, Observer
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    standard_type VARCHAR(30) NOT NULL,
    requirement_code VARCHAR(50) NOT NULL,
    requirement_text TEXT NOT NULL,
    expected_evidence TEXT,
    document_ref_id UUID REFERENCES documents(id),
    result_status VARCHAR(30) DEFAULT 'Not Yet Verified', -- Compliant, Noncompliant, Partial Compliance, Not Applicable, Not Yet Verified
    na_justification TEXT,
    auditor_notes TEXT,
    interviewee_notes TEXT,
    field_observation TEXT,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID REFERENCES audit_checklists(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    description TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT FINDINGS & CORRECTIVE ACTIONS
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_number VARCHAR(80) UNIQUE NOT NULL,
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES audit_checklists(id),
    standard_type VARCHAR(30) NOT NULL,
    clause_or_element VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    condition_description TEXT NOT NULL,
    criteria_requirement TEXT NOT NULL,
    objective_evidence TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- Major Nonconformity, Minor Nonconformity, Observation, Opportunity for Improvement (OFI)
    risk_level VARCHAR(30) DEFAULT 'Medium', -- High, Medium, Low
    status VARCHAR(40) DEFAULT 'Open', -- Open, Assigned, In Progress, Pending Verification, Rejected, Closed, Overdue
    pic_id UUID REFERENCES profiles(id),
    due_date DATE NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES audit_findings(id) ON DELETE CASCADE,
    root_cause_analysis TEXT NOT NULL,
    rca_method VARCHAR(50) DEFAULT '5-Why / Fishbone',
    immediate_correction TEXT NOT NULL,
    corrective_action_plan TEXT NOT NULL,
    preventive_measure TEXT,
    implementation_date DATE,
    evidence_description TEXT,
    evidence_file_url TEXT,
    verifier_id UUID REFERENCES profiles(id),
    verification_notes TEXT,
    effectiveness_result VARCHAR(50), -- Effective, Ineffective, Need Re-evaluation
    closure_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    user_name VARCHAR(150),
    user_role VARCHAR(30),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) DEFAULT 'info', -- info, warning, danger, success
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy
CREATE POLICY "Public profile view" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admin update profile" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

-- 2. Documents policy (Viewer can only see Approved/Effective, Admin full, User can insert/update own)
CREATE POLICY "Documents View Policy" ON documents FOR SELECT USING (
    is_deleted = false AND (
        status IN ('Approved', 'Effective') 
        OR created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
    )
);

CREATE POLICY "Documents Insert Policy" ON documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'USER'))
);

CREATE POLICY "Documents Update Policy" ON documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'ADMIN' OR documents.created_by = auth.uid()))
);

-- 3. Audit Findings & Corrective Action
CREATE POLICY "Findings Select Policy" ON audit_findings FOR SELECT USING (true);
CREATE POLICY "Findings Manage Policy" ON audit_findings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'USER'))
);

-- 4. Audit Log Immutable policy (Insert only, No update/delete)
CREATE POLICY "Audit Log Insert" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Audit Log Select" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

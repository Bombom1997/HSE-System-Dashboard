import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { checkSupabaseConnection, SupabaseConnectionStatus, SUPABASE_URL } from '../lib/supabase';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    supabaseStatus, 
    isSyncingWithSupabase, 
    syncWithSupabase, 
    pushAllToSupabase 
  } = useApp();

  const [connStatus, setConnStatus] = useState<SupabaseConnectionStatus | null>(supabaseStatus);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsChecking(true);
    setSyncFeedback(null);
    try {
      const res = await checkSupabaseConnection();
      setConnStatus(res);
    } catch (err: any) {
      setConnStatus({
        connected: false,
        message: err?.message || 'Gagal terhubung ke Supabase',
        projectUrl: SUPABASE_URL,
        projectId: 'bxohfhunsnbmktyvttuh'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopySql = () => {
    const sqlScript = `-- SQL Migration Script for Supabase (Project: bxohfhunsnbmktyvttuh)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/bxohfhunsnbmktyvttuh/sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
('ADMIN', 'SHE Administrator & Lead Auditor', 'Akses penuh'),
('USER', 'Operational / Document Owner / Auditor', 'Pengguna operasional'),
('VIEWER', 'Auditee / Viewer / Management', 'Akses lihat')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL REFERENCES roles(id) DEFAULT 'USER',
    position VARCHAR(100),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code_prefix VARCHAR(20) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_number VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50),
    department_name VARCHAR(150),
    site_name VARCHAR(150),
    business_process VARCHAR(150),
    she_aspect_risk TEXT,
    current_revision VARCHAR(20) DEFAULT 'Rev.00',
    status VARCHAR(40) NOT NULL DEFAULT 'Draft',
    confidentiality VARCHAR(30) DEFAULT 'Internal',
    effective_date DATE,
    review_due_date DATE,
    author_name VARCHAR(150),
    approver_name VARCHAR(150),
    file_name VARCHAR(255),
    file_size_kb INT,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_number VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    audit_type VARCHAR(50) NOT NULL,
    standards_applied TEXT[],
    department_name VARCHAR(150),
    site_name VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    lead_auditor VARCHAR(150),
    auditee_pic VARCHAR(150),
    scope TEXT NOT NULL,
    objective TEXT NOT NULL,
    status VARCHAR(40) DEFAULT 'Terjadwal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_number VARCHAR(80) UNIQUE NOT NULL,
    audit_number VARCHAR(80),
    standard_type VARCHAR(50),
    clause_or_element VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    condition_description TEXT NOT NULL,
    criteria_requirement TEXT NOT NULL,
    objective_evidence TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    risk_level VARCHAR(30) DEFAULT 'Sedang',
    status VARCHAR(40) DEFAULT 'Open',
    pic_name VARCHAR(150),
    due_date DATE NOT NULL,
    root_cause_analysis TEXT,
    immediate_correction TEXT,
    corrective_action_plan TEXT,
    preventive_measure TEXT,
    effectiveness_result VARCHAR(50),
    closure_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Allow read/write for prototype anon key
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all for anon on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all for anon on audits" ON audits FOR ALL USING (true);
CREATE POLICY "Allow all for anon on audit_findings" ON audit_findings FOR ALL USING (true);
`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handlePullFromSupabase = async () => {
    setSyncFeedback(null);
    try {
      await syncWithSupabase();
      setSyncFeedback({ text: 'Sinkronisasi berhasil! Data terbaru telah diambil dari Supabase.', type: 'success' });
    } catch (err: any) {
      setSyncFeedback({ text: `Gagal sinkronisasi: ${err.message}`, type: 'error' });
    }
  };

  const handlePushToSupabase = async () => {
    setSyncFeedback(null);
    try {
      const res = await pushAllToSupabase();
      if (res.success) {
        setSyncFeedback({ text: res.message, type: 'success' });
        handleTestConnection();
      } else {
        setSyncFeedback({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setSyncFeedback({ text: `Gagal mengirim data: ${err.message}`, type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Integrasi Backend Supabase</h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                  Project: bxohfhunsnbmktyvttuh
                </span>
              </div>
              <p className="text-xs text-slate-400">PostgreSQL Terkelola & Database Cloud Terpusat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            connStatus?.connected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              {connStatus?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {connStatus?.connected ? 'Terhubung ke Supabase Database' : 'Koneksi Supabase Menunggu Konfigurasi'}
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">{connStatus?.message}</div>
                <div className="font-mono text-[10px] mt-1 text-slate-600">
                  URL: {connStatus?.projectUrl || SUPABASE_URL}
                </div>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isChecking}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Memeriksa...' : 'Cek Status'}</span>
            </button>
          </div>

          {/* Feedback message */}
          {syncFeedback && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              syncFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {syncFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{syncFeedback.text}</span>
            </div>
          )}

          {/* Table Status Check */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Status Skema Tabel Database PostgreSQL:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'profiles (Pengguna)', exists: connStatus?.tablesStatus?.profiles },
                { name: 'documents (SOP)', exists: connStatus?.tablesStatus?.documents },
                { name: 'audits (Program)', exists: connStatus?.tablesStatus?.audits },
                { name: 'audit_findings (CAR)', exists: connStatus?.tablesStatus?.findings },
              ].map((tb, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-700 truncate">{tb.name}</span>
                  {tb.exists ? (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Ada
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                      Belum Ada
                    </span>
                  )}
                </div>
              ))}
            </div>

            {(!connStatus?.tablesStatus?.documents || !connStatus?.tablesStatus?.profiles) && (
              <p className="text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
                Tabel database PostgreSQL di Supabase belum dibuat. Anda dapat menyalin skema SQL di bawah dan menjalankannya di Supabase SQL Editor.
              </p>
            )}
          </div>

          {/* Action Row: Sync / Push / Copy SQL */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCopySql}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copiedSql ? 'Skema SQL Berhasil Disalin!' : 'Salin Script SQL Migration untuk Supabase'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/bxohfhunsnbmktyvttuh/sql"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
              >
                <span>Buka SQL Editor Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={handlePushToSupabase}
                disabled={isSyncingWithSupabase}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload / Sinkron Data Lokal ke Supabase</span>
              </button>

              <button
                onClick={handlePullFromSupabase}
                disabled={isSyncingWithSupabase}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Tarik Data Terbaru dari Supabase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-500 text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kredensial Project ID: <strong>bxohfhunsnbmktyvttuh</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Filter,
  FileText,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchLog, setSearchLog] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (selectedModule !== 'all' && log.module !== selectedModule) return false;
    if (searchLog.trim()) {
      const q = searchLog.toLowerCase();
      return log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q);
    }
    return true;
  });

  // Permission Matrix Definition
  const permissionMatrix = [
    { module: 'Database Dokumen', action: 'Melihat & mencari dokumen SOP yang disetujui (Effective)', admin: true, user: true, viewer: true },
    { module: 'Database Dokumen', action: 'Mengajukan dokumen baru / draf SOP', admin: true, user: true, viewer: false },
    { module: 'Database Dokumen', action: 'Mengedit draf & mengunggah revisi dokumen miliknya', admin: true, user: true, viewer: false },
    { module: 'Database Dokumen', action: 'Menyetujui (Approve) & mengaktifkan dokumen resmi', admin: true, user: false, viewer: false },
    { module: 'Database Dokumen', action: 'Mengarsipkan & menghapus dokumen secara terkendali', admin: true, user: false, viewer: false },
    { module: 'Master Regulasi', action: 'Membaca kriteria SMKP Kepdirjen 185 & klausul ISO', admin: true, user: true, viewer: true },
    { module: 'Master Regulasi', action: 'Mengubah teks kriteria / menambah kriteria baru', admin: true, user: false, viewer: false },
    { module: 'Program Audit', action: 'Membuat jadwal audit baru & penugasan tim', admin: true, user: false, viewer: false },
    { module: 'Checklist Audit', action: 'Mengisi checklist kepatuhan & bukti verifikasi', admin: true, user: true, viewer: false },
    { module: 'Temuan & CAR', action: 'Mengajukan RCA & bukti tindakan perbaikan (PIC)', admin: true, user: true, viewer: false },
    { module: 'Temuan & CAR', action: 'Memverifikasi efektivitas & menutup temuan (Closed)', admin: true, user: false, viewer: false },
    { module: 'Laporan & Ekspor', action: 'Mengekspor laporan ke format Excel & PDF', admin: true, user: true, viewer: true },
    { module: 'Manajemen User', action: 'Membuat, menonaktifkan, & mengubah role pengguna', admin: true, user: false, viewer: false },
    { module: 'Audit Log', action: 'Mengakses jejak log aktivitas keamanan sistem', admin: true, user: false, viewer: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <History className="w-4 h-4 text-amber-600" />
            <span>AUDIT TRAIL & PERMISSION MATRIX</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Jejak Aktivitas Sistem & Matriks Hak Akses (RBAC)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan aktivitas terenkripsi (immutable) untuk akuntabilitas integritas data SMKP Minerba
          </p>
        </div>

        <div className="bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Status RLS: <strong>Row Level Security Active</strong></span>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Matriks Hak Akses & Otorisasi Pengguna (RBAC Matrix)</h3>
            <p className="text-xs text-slate-500">Batasan wewenang eksplisit antara peran Admin, User, dan Viewer</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">14 Aturan Otorisasi</span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="py-2.5 px-4 w-44">Modul Sistem</th>
                <th className="py-2.5 px-4">Operasi / Fungsi Yang Diizinkan</th>
                <th className="py-2.5 px-3 text-center w-28 bg-red-50 text-red-800 font-extrabold">ADMIN</th>
                <th className="py-2.5 px-3 text-center w-28 bg-amber-50 text-amber-900 font-extrabold">USER</th>
                <th className="py-2.5 px-3 text-center w-28 bg-blue-50 text-blue-900 font-extrabold">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{item.module}</td>
                  <td className="py-2.5 px-4 text-slate-700">{item.action}</td>
                  <td className="py-2.5 px-3 text-center bg-red-50/30">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center bg-amber-50/30">
                    {item.user ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center bg-blue-50/30">
                    {item.viewer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Jejak Log Audit Aktivitas Pengguna (Audit Trail)</h3>
            <p className="text-xs text-slate-500">Mencatat seluruh aksi penting secara berurutan waktu (timestamp)</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari log..."
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none w-48"
              />
            </div>

            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
            >
              <option value="all">Semua Modul</option>
              <option value="Autentikasi & Sesi">Autentikasi</option>
              <option value="Database Dokumen">Database Dokumen</option>
              <option value="Pengendalian Dokumen">Pengendalian Dokumen</option>
              <option value="Program Audit">Program Audit</option>
              <option value="Audit SMKP & ISO">Audit SMKP & ISO</option>
              <option value="Temuan Audit">Temuan Audit</option>
              <option value="Tindakan Perbaikan (CAPA)">CAPA</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="py-2.5 px-4 w-44">Waktu (Timestamp)</th>
                <th className="py-2.5 px-4 w-48">Pengguna & Peran</th>
                <th className="py-2.5 px-4 w-36">Aktivitas</th>
                <th className="py-2.5 px-4 w-36">Modul</th>
                <th className="py-2.5 px-4">Rincian Informasi Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] font-mono text-amber-700 font-bold">{log.userRole}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">{log.module}</td>
                  <td className="py-2.5 px-4 text-slate-700 leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
